package nurse.logic.handlers;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import nurse.entity.persist.*;
import nurse.logic.providers.*;
import nurse.utility.ControlAdaptiveHelper;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import nurse.NurseApp;
import nurse.entity.trasfer.BindingSignal;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.trasfer.PartData;
import nurse.entity.view.ActiveDevice;
import nurse.utility.JsonHelper;
import nurse.utility.Base64Helper;


public class DiagramDataHandler extends DataHandlerBase {
	
	private static final String GetDiagramConfig = "getDiagramConfig";
	private static final String GetDiagramData = "getDiagramData";
	private static final String SaveDiagram = "saveDiagram";
	private static final String GetCabinetData = "getCabinetData";
	private static final String GetSignalHistoryChart = "getSignalHistoryChart";
	private static final String GetControlValueByBaseType = "getControlValueByBaseType";
	private static final String SaveNodeTemperature = "SaveNodeTemperature";
	private static final String GenerateStaticPage = "GenerateStaticPage";
	
	private static Logger log = Logger.getLogger(NurseApp.class);
	private ArrayList<PartData> partDataCache = new ArrayList<PartData>();
	private String oldBinding = "";
	
	
	public DiagramDataHandler() {
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.GetDiagramConfig))
		{
//			String handleData=handleGetDiagramById(req.requestParams);
//			rep.responseResult =Base64Helper.encode(handleData); 
			rep.responseResult =handleGetDiagramById(req.requestParams);
			
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.GetDiagramData))
		{
			rep.responseResult = handleGetDiagramData(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.SaveDiagram))
		{
			//String paras=Base64Helper.decode(req.requestParams);
			rep.responseResult = handleSaveDiagram(req.requestParams);
		}

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.GetCabinetData))
		{
			rep.responseResult = HandleGetCabinetData(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.GetSignalHistoryChart))
		{
			rep.responseResult = HandleGetSignalHistoryChart(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.GetControlValueByBaseType))
		{
			rep.responseResult = HandleGetControlValueByBaseType(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.SaveNodeTemperature))
		{
			rep.responseResult = HandleSaveNodeTemperature(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DiagramDataHandler.GenerateStaticPage))
		{
			rep.responseResult = HandleGenerateStaticPage(req.requestParams);
		}
	}

	private String handleSaveDiagram(String requestParams) {
		String tempDiagram = requestParams;
		requestParams = Base64Helper.decode(requestParams);
		JSONObject param = new JSONObject(requestParams);
		
		String deviceId = null;
		String deviceBaseTypeId = null;
		String fileName = null;
		
		//if deviceid is not null, save device instance file
		try{
			deviceId = param.getString("deviceId");
			deviceBaseTypeId = param.getString("deviceBaseTypeId");

			if(deviceBaseTypeId.indexOf("table") != -1)
				deviceId = deviceId+".table";
		}catch(Exception ex){ex.printStackTrace();}
		
		if (deviceId != null)
		{
			fileName = deviceId + ".json";
			
			DiagramProvider.getInstance().saveInstanceFile(fileName,tempDiagram);
		}
		//if deviceid == null & devicebaseTypeId != null, save devicetype instance file.
		else
		{
			
			fileName = deviceBaseTypeId + ".json";
			DiagramProvider.getInstance().saveInstanceFile(fileName,tempDiagram);
	
		}		
		
		return "Success";
	}

	//{"deviceBaseTypeId":"120","deviceId":"13","binding":"p2$BS:120111|BS:120110,p1$BS:2111,"}
	private synchronized String handleGetDiagramData(String requestParams) {
		String res = null;	
		
		JSONObject qo = new JSONObject(requestParams);
		
		// DeBug ------------------------------------------------
		//System.out.println("Rece DeviceId:"+qo.get("deviceId").toString());
		// DeBug ------------------------------------------------
		
		//优化方案
		//1: 页面不切换的时候不重新计算binding（页面不切换，那么参数就不会变，就不用字符串切割计算等操作，在页面不切换时，性能会提高）
		//   使用变量保存上次的参数，用空间换时间
		//2: 优化实时数据更新（RealDataProvider写入ActiveSignalCache），使用时直接读，而不是重头计算，从而解开界面和数据的互锁机会）
		//3: ActiveSignalCache 从 HashMap更改为ConcurrentHashMap
		//4: 界面返回数据时，不生成ParData而是更新，减少开销
		
		if (IsParamChanged(qo)){
			BuildPartDataCache(qo);
		}
		
		UpdatePartData();
		
		// DeBug ------------------------------------------------
		//System.out.println("Send Data Size:"+partDataCache.size());
		// DeBug ------------------------------------------------
		res = JsonHelper.ListjsonString("ret", partDataCache);
		return res;
	}

	private void UpdatePartData() {
		for(PartData pd : partDataCache){
			if(pd.partId.indexOf("status") > -1){//设备状态组态
				buildStatusUpdateData(pd); 
			}else if(pd.partId.indexOf("virtualSignal") > -1 || pd.partId.indexOf("percent") > -1)//虚拟量组态
				virtualSignalUpdateData(pd);
			else if(pd.partId.indexOf("hspiechart") > -1)//历史信号图标组态
				historySignalUpdateData(pd);
			else if(pd.partId.indexOf("tableconfig") > -1)
				tableSignalUpadteData(pd);
			else{
				if(pd.partId.indexOf("piechart") > -1 && pd.description != null &&
						(pd.description.indexOf("line") > -1 || pd.description.indexOf("bar") > -1 || pd.description.equals("gauge|AvgMaxMin"))){
					if(pd.description.indexOf("line") > -1)
						lineChartUpdateData(pd);
					else if(pd.description.indexOf("bar") > -1)
						barCharUpdateData(pd);
					else
						avgMaxMinUpdateData(pd);
				}
				else if(pd.deviceId == null || pd.deviceId.equals(""))
					descriptionUpdateData(pd);
				else
					pd.updateData();
			}
		}
	}

	private void BuildPartDataCache(JSONObject qo) {
		//解决：同模板不同设备，Binding相同时不刷新问题。
		if(qo.isNull("binding")) return;
		String newBinding = qo.getString("deviceId")+","+qo.getString("binding");
		this.partDataCache.clear();
		
		String[] tokens = newBinding.split("\\,");
		
		if (tokens.length == 0 ) return;
		
		for(String s : tokens)
		{
			if(s.split("\\$").length <= 1) continue;
			String partId = s.split("\\$")[0];
			if(partId.indexOf("status") != -1){
				partDataCache.add(buildStatusPartDatas(s));
			}else if(partId.indexOf("virtualSignal") != -1 || partId.indexOf("percent") != -1){
				partDataCache.add(virtualSignalPartDatas(s));
			}else if(partId.indexOf("hspiechart") != -1){
				partDataCache.addAll(historySignalPartDatas(s));
			}else if(partId.indexOf("tableconfig") != -1){//表格组态
				partDataCache.addAll(tableSignalPartDatas(s));
			}else{// s => PartId$BS:|SI:|DI:&BS:|SI:|DI:
				if(partId.indexOf("piechart") != -1 &&
						(s.indexOf("line") != -1 || s.indexOf("bar") != -1 || s.indexOf("AvgMaxMin") != -1)){
					if(s.indexOf("line") != -1 || s.indexOf("bar") != -1)
						partDataCache.addAll(lineChartPartDatas(s));
					else
						partDataCache.add(avgMaxMinPartData(s));//平均值、最大值、最小值
				}else if(s.indexOf("DI:") != -1){//存在DI:关键字
					partDataCache.addAll(buildPartDatas(s));
				}else if(s.indexOf("SI:") != -1 || s.indexOf("BS:") != -1)
					partDataCache.addAll(buildPartDatas(s, qo.getString("deviceId")));
				else{
					partDataCache.add(descriptionPartData(s));// PartData.description = s.split("\\$")[1];
				}
			}
		}
		oldBinding = newBinding;
		
	}

	private boolean IsParamChanged(JSONObject qo) {
		try{
			if(qo.isNull("binding")) return false;
			String newBinding = qo.getString("deviceId")+","+qo.getString("binding");
			if (newBinding.equalsIgnoreCase(this.oldBinding)) return false;
			return true;
		}catch (Exception ex){
			System.out.println(qo.toString());
			log.error("IsParamChanged Exception:",ex);
			return false;
		}
	}

	private List<PartData> buildPartDatas(String params){
		// params => PartId$BS:|SI:|DI:&BS:|SI:|DI:
		List<PartData> pds = new ArrayList<PartData>();
		if(params.equals("undefined")) return pds;
		
		ArrayList<BindingSignal> bss = new ArrayList<BindingSignal>();	
		String[] tokens = params.split("\\$");
		if(tokens.length == 1) return pds;
		
		String partId = tokens[0];
		String[] devStr = tokens[1].split("\\&"); //BS:|SI:|DI:&BS:|SI:|DI:
		
		for(String ds : devStr){
			String deviceId = getStringByName(ds, "DI");
			if(deviceId.equals("undefined") || deviceId == "") return pds;
			
			String[] sigs = ds.split("\\|");
			
			for(String s : sigs)
			{
				BindingSignal bs = null;
				
				bs = BindingSignal.FromString(s, deviceId);
				
				if (bs != null)	bss.add(bs);
			}
		}
		
		pds = bss.stream().map(bs -> PartData.MakeFromBindingSignal(partId, bs)).collect(Collectors.toList());
		return pds;		
	}
	
	private List<PartData> buildPartDatas(String params, String deviceId) {
		
		List<PartData> pds = new ArrayList<PartData>();
		
		if(params.equals("undefined")) return pds;
		
		ArrayList<BindingSignal> bss = new ArrayList<BindingSignal>();	
		
		String[] tokens = params.split("\\$");
		if(tokens.length == 1) return pds;
		
		String partId = tokens[0];
		
		String[] sigs = tokens[1].split("\\|");
		
		for(String s : sigs)
		{
			BindingSignal bs = null;
			
			bs =BindingSignal.FromString(s, deviceId);
			
			if (bs != null)	bss.add(bs);
		}
		
		pds = bss.stream().map(bs -> PartData.MakeFromBindingSignal(partId, bs)).collect(Collectors.toList());
		return pds;		
	}

	private String handleGetDiagramById(String requestParams) {
		String res = null;		

		String[] tokens = requestParams.split("\\.");
		
		if (tokens.length != 2) return null;
		
		
		int devId = 0;
		
		try{
			devId = CabinetDeviceMap.parseInt(tokens[1]);
		}catch (Exception e)
		{			
		}
		
		String deviceId = devId == 0 ? null : tokens[1];
				
		res = getConfigById(tokens[0], deviceId);
			
		JSONObject obj = new JSONObject();
		obj.put("ret", res);
		return obj.toString();	
	}

	private String getConfigById(String typeId, String deviceId) {
		String res = null;
		//if device id is 'table'
		if(typeId.equals("table")){
			res = DiagramProvider.getInstance().getDiagramInstance(String.format("%s.table", deviceId));
			if(res!=null)
				res = res.substring(0,res.indexOf(':'));
			
			if (res == null)
			{
				res = DiagramProvider.getInstance().getDiagramTemplate("9999.table");
				res = Base64Helper.encode(res);
			}
			return res;
		}
		
		//if device id is null, get type diagram, first instance, then template
		if (deviceId == null)
		{
			res = DiagramProvider.getInstance().getDiagramInstance(typeId);
			if(res!=null)
				res = res.substring(0,res.indexOf(':'));
			
			if (res == null)
			{
				res = DiagramProvider.getInstance().getDiagramTemplate(typeId);
				res=Base64Helper.encode(res);
			}
		}
		//if device id is not null, get device diagram, first instance, then template
		else
		{
			res = DiagramProvider.getInstance().getDiagramInstance(deviceId);
			if(res!=null)
				res = res.substring(0,res.indexOf(':'));	
			
			if (res == null)
			{
				res = DiagramProvider.getInstance().getDiagramTemplate(typeId);
				res=Base64Helper.encode(res);
			}
		}
		log.debug("getConfigById:" + res);
		
		return res;
	}

	private String HandleGetCabinetData(String jsonParams){
		List<CabinetDeviceMap> cdmList = null;
		 //将json字符串转为集合
		try {
			cdmList = CabinetDeviceMap.getJsonListCabinet(jsonParams);
		} catch (Exception e) {
			log.error("JSON Format Error",e);
		}
		if(cdmList == null || cdmList.size() == 0) return JsonHelper.ListjsonString("ret", new ArrayList<CabinetDeviceMap>());
		// 设备连接状态 0/2中断  1正常
		HashMap<Integer, Integer> csMap = ActiveDeviceProvider.getInstance().getAllConnectStates();
		
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		//找到告警的设备，并把设备ID放到第一位
		for(CabinetDeviceMap cdm : cdmList){
			String cabinetStatus = "normal";//高级等级
			int alarmLv = -1;//最高的告警等级
			//机柜设备
			String[] equipmentIds = cdm.equipmentId!=null ? cdm.equipmentId.split(",") : new String[0];
			//非机柜设备
			String[] sigDeviceIds = cdm.sigDeviceId!=null ? cdm.sigDeviceId.split(",") : new String[0];
			String[] sigSignalIds = cdm.sigSiganlId!=null ? cdm.sigSiganlId.split(",") : new String[0];
			for(ActiveAlarm a : alarms){
				if(cdm.cabinetType.equals("imagesignal")){//环境量对象
					if(a.deviceId == CabinetDeviceMap.parseInt(cdm.PhaseACurrentDeviceId)
							&& a.signalId == CabinetDeviceMap.parseInt(cdm.PhaseACurrentSignalId)){
						alarmLv = a.alarmLevel;
						break;
					}
				}else if(!cdm.cabinetType.equals("")){ // 机柜对象  
					for(int i = 0;i < equipmentIds.length;i++){
						if(a.deviceId == CabinetDeviceMap.parseInt(equipmentIds[i])){
							if(alarmLv < a.alarmLevel){
								alarmLv = a.alarmLevel;
							}
						}
					}
					for(int i = 0;i < sigDeviceIds.length;i++){
						if(a.deviceId == CabinetDeviceMap.parseInt(sigDeviceIds[i])
								&& a.signalId == CabinetDeviceMap.parseInt(sigSignalIds[i])){
							if(alarmLv < a.alarmLevel){
								alarmLv = a.alarmLevel;
							}
						}
					}
				}
			}
			//机柜告警状态
			switch(alarmLv){
				case -1:
					cabinetStatus = "normal";
					break;
				case 0:
					cabinetStatus = "alarmTip";
					break;
				case 1:
					cabinetStatus = "alarmCommon";
					break;
				case 2:
					cabinetStatus = "alarmImportant";
					break;
				case 3:
					cabinetStatus = "alarmUrgent";
					break;
			}
			//环境量告警状态
			if(cdm.cabinetType.equals("imagesignal")){
				if(alarmLv == -1) cabinetStatus = "normal";
				else cabinetStatus = "alarm";
			}
			cdm.cabinetStatus = cabinetStatus;
			updateCabinetConnectStates(cdm,csMap);
		}
		return JsonHelper.ListjsonString("ret", cdmList);
	}
	//修改机柜的连接状态
	private static void updateCabinetConnectStates(CabinetDeviceMap cdm,HashMap<Integer, Integer> csMap){
		if(cdm.cabinetType.equals("imagesignal")){//环境量
			int tmpDeviceId = CabinetDeviceMap.parseInt(cdm.PhaseACurrentDeviceId);
			if (csMap.containsKey(tmpDeviceId)) {
				cdm.connectState = csMap.get(tmpDeviceId);
			}
		}
		if(cdm.equipmentId == null)return;
		String str = cdm.equipmentId.replaceAll(",", "");
		if(str.equals(""))return;
		
		String[] equipmentIds = cdm.equipmentId.split(",");
		int index = -1;
		for(int i = 0;i < equipmentIds.length;i++){
			Integer conn = csMap.get(CabinetDeviceMap.parseInt(equipmentIds[i]));
			if(conn != null && (conn == 0 || conn ==2)) index = i;
		}
		if(index > -1) cdm.connectState = csMap.get(CabinetDeviceMap.parseInt(equipmentIds[index]));
		else{
			if(csMap.containsKey(CabinetDeviceMap.parseInt(equipmentIds[0])))
				cdm.connectState = csMap.get(CabinetDeviceMap.parseInt(equipmentIds[0]));
		} 
	}
	
	private PartData buildStatusPartDatas(String params){
		PartData pd = new PartData();
		
		if(params.equals("undefined")) return pd;	
		String[] tokens = params.split("\\$");
		if(tokens.length == 1) return pd;
		String partId = tokens[0];
		String deviceIds = tokens[1];//tokens[1] => 10000001|10000002|
		
		pd.partId = partId;
		pd.description = deviceIds;
		return pd;
	}
	
	private PartData virtualSignalPartDatas(String params){
		return DiagramProvider.getInstance().getVirtualSignalPartData(params);
	} 
	
	private void buildStatusUpdateData(PartData pd){
		if (ActiveDeviceDataHandler.getInstance().getActiveDevices().size() == 0) 
			ActiveDeviceDataHandler.getInstance().setActiveDevices(ActiveDeviceProvider.getInstance().GetAllActiveDevices());
		
		HashMap<Integer, Integer> csMap = ActiveDeviceProvider.getInstance().getAllConnectStates();
			    
		String[] devIds = pd.description.split("\\|");
		
		int index = -1;
		for (ActiveDevice ad : ActiveDeviceDataHandler.getInstance().getActiveDevices()) {
			for(String deviceId : devIds){
				if(ad.id == CabinetDeviceMap.parseInt(deviceId)){
					ad.updateAlarms(csMap.get(ad.id));
					if(ad.status.equals("Disconnect")){
						pd.deviceId = deviceId;
						pd.baseTypeId = String.valueOf(ad.baseTypeId);
						pd.currentValue = ad.status;
						return;
					}
					if(ad.status.equals("Alarm")){
						pd.deviceId = deviceId;
						pd.baseTypeId = String.valueOf(ad.baseTypeId);
						pd.currentValue = ad.status;
						index ++;
					}
				}
			}
		}
		if(index == -1){
			for (ActiveDevice ad : ActiveDeviceDataHandler.getInstance().getActiveDevices()) {
				if(ad.id == CabinetDeviceMap.parseInt(devIds[0])){
					ad.updateAlarms(csMap.get(ad.id));
					pd.deviceId = devIds[0];
					pd.baseTypeId = String.valueOf(ad.baseTypeId);
					pd.currentValue = ad.status;
					return;
				}
			}
		}
	}
	
	private void virtualSignalUpdateData(PartData pd){
		DiagramProvider.getInstance().getVirtualSignalCountValue(pd);
	}

	private List<PartData> historySignalPartDatas(String params){
		return DiagramProvider.getInstance().historySignalPartDatas(params);
	}
	
	private void historySignalUpdateData(PartData pd){
		pd.currentValue = DiagramProvider.getInstance().getHistorySignalCountValue(pd);
	}
	
	private PartData descriptionPartData(String params){
		// params => PartId$type
		PartData pd = new PartData();
		try {
			if(params.equals("undefined")) return pd;	
			String[] tokens = params.split("\\$");
			if(tokens.length == 1) return pd;
			pd.partId = tokens[0];
			pd.description = tokens[1];

			if(tokens[1].split("\\|").length > 2)// piechart|6|expr1:&expr2:
				DiagramProvider.getInstance().saveActiveSignalMap(pd.partId,tokens[1].split("\\|")[2]);
		} catch (Exception e) {
			log.error("activePieChartPartData Exception:",e);
		}
		return pd;
	}
	
	private void descriptionUpdateData(PartData pd){
		pd.currentValue = DiagramProvider.getInstance().descriptionUpdateData(pd);
	}
		
	private List<PartData> lineChartPartDatas(String params){
		return DiagramProvider.getInstance().lineChartPartDatas(params);
	}
	
	private void lineChartUpdateData(PartData pd){
		DiagramProvider.getInstance().updatePartDataLineChart(pd);
	}

	private void barCharUpdateData(PartData pd){
		DiagramProvider.getInstance().updatePartDatabarChart(pd);
	}
	
	private List<PartData> tableSignalPartDatas(String params){
		return DiagramProvider.getInstance().tableChartPartDatas(params);
	}
	
	private void tableSignalUpadteData(PartData pd){
		ActiveSignal as = ConfigCache.getInstance().getActiveBaseTypeSignal(Integer.parseInt(pd.deviceId), 
				Integer.parseInt(pd.baseTypeId));
		if (as == null) return;
		pd.currentValue = as.getCurrentValue();
		pd.alarmSeverity = String.valueOf(as.getAlarmSeverity(Integer.parseInt(pd.deviceId)));
	}
	
	/**
	 * @param str BS:BaseTypeId|SI:SinglId|DI:DeviceId
	 * @param name DI
	 * @return DeviceId
	 */
	private String getStringByName(String str,String name){
		String result = "";
		try {
			String[] strs = str.split("\\|");
			for(String s : strs){
				if(s.indexOf(name) > -1)
					result = s.substring(s.lastIndexOf(name+":")+(name.length()+1));
			}
			return result;
		} catch (Exception e) {
			return "";
		}
	}
	
	
	private String HandleGetSignalHistoryChart(String requestParams){
		//requestParams => DeviceId|BaseTypeId
		String[] result = Base64Helper.decode(requestParams).split("\\|");
		try{
			int deviceId = Integer.parseInt(result[0]);
			int baseTypeId = Integer.parseInt(result[1]);
			ArrayList<ChartHistorySignal> chs = CacheHistorySignalProvider.getInstance().getHistorySignalsByDay(deviceId, baseTypeId, 7);
			return CacheHistorySignalProvider.getInstance().toChartDataJson(chs,deviceId,baseTypeId);
		}catch (Exception ex){
			return "{\"dates\":[],\"datas\":[],\"name\":\"\",\"unit\":\"\",\"category\":\"1\"}";
		}
	}

	private String HandleGetControlValueByBaseType(String requestParams){
		//requestParams => DeviceId|BaseTypeId
		//根据设备编号和控制基类编号，获取控制关联的信号当前值，信号值不存在返回控制取值的最小值
		//return {\"value\":\"25.5\",\"Unit\":\"℃\"}
		try{
			String[] result = Base64Helper.decode(requestParams).split("\\|");
			int deviceId = Integer.parseInt(result[0]);
			int baseTypeId = Integer.parseInt(result[1]);
			Control con = ControlProvider.getInstance().getControlById(deviceId,baseTypeId);

			ActiveSignal as = ConfigCache.getInstance().getActiveSignal(deviceId,con.SignalId);
			if (as == null) return "{\"name\":\"\",\"value\":\"\",\"unit\":\"\"}";

			Float value = con.MinValue;
			if(as.floatValue >= con.MinValue && as.floatValue <= con.MaxValue)
				value = as.getFloatValue();

			String unit = as.unit == null ? "" : as.unit;

			return String.format("{\"name\":\"%s\",\"value\":\"%s\",\"unit\":\"%s\"}",con.ControlName,value,unit);
		}catch (Exception e){
			return "{\"name\":\"\",\"value\":\"\",\"unit\":\"\"}";
		}
	}

	private PartData avgMaxMinPartData(String params){
		return DiagramProvider.getInstance().avgMaxMinPartData(params);
	}

	private void avgMaxMinUpdateData(PartData pd){
		DiagramProvider.getInstance().avgMaxMinUpdateData(pd);
	}

	private String HandleSaveNodeTemperature(String requestParams){
		try{
			String[] content = Base64Helper.decode(requestParams).split("\\|");

			return DiagramProvider.getInstance().saveNodeTemperature(content[0],content[1]);
		}catch (Exception ex){
			return "ParamError";
		}
	}

	private String HandleGenerateStaticPage(String requestParams){
		try{
			String[] split = requestParams.split("\\|");

			String[] tokens = split[0].split("\\.");
			if(tokens.length != 2) return "IdError";
			String deviceId = tokens.length >= 2 ? tokens[1] : null;
			String jsonName = deviceId == null ? tokens[0] : deviceId;
			//获取Json内容
			String res = getConfigById(tokens[0],deviceId);
			String code = Base64Helper.decode(res);
			JSONObject object = new JSONObject(code);

			//自适应初始化
			try{
				String[] screen = split[1].split("\\*");
				double screenWidth = Double.parseDouble(screen[0]);
				double screenHeight = Double.parseDouble(screen[1]);

				String[] inner = split[2].split("\\*");
				double innerWidth = Double.parseDouble(inner[0]);
				double innerHeight = Double.parseDouble(inner[1]);

				ControlAdaptiveHelper.getInstance().initDefault("iView",screenWidth,screenHeight,innerWidth,innerHeight);
			}catch (Exception e){
				//默认iView分辨率
				ControlAdaptiveHelper.getInstance().initDefault(1280,800,1280,800);
			}

			DiagramProvider.getInstance().generateStaticPage(jsonName,object);
			return jsonName;
        }catch (Exception ex){
			log.error("GenerateStaticPage Exception:",ex);
			return "Error";
        }
	}
}
