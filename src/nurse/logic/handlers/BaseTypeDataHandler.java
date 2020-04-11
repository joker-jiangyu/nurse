package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.Control;
import nurse.entity.persist.ControlMeanings;
import nurse.entity.persist.DataItem;
import nurse.entity.persist.SignalBaseType;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.view.ActiveDevice;
import nurse.logic.providers.BaseTypeProvider;
import nurse.logic.providers.ConfigCache;
import nurse.logic.providers.DataItemProvider;
import nurse.logic.providers.SignalMeaningsProvider;
import nurse.utility.JsonHelper;

public class BaseTypeDataHandler extends DataHandlerBase {

	private static final String GetSignalBaseTypeByDeviceBaseType = "getSignalBaseTypeByDeviceBaseType";
	private static final String GETSIGNALBASETYPE = "getSignalBaseType";
	private static final String GETGAUGESIGNALBASETYPE = "getGaugeSignalBaseType";
	private static final String GETALLCONTROLBASEDEVICE = "getAllControlBaseDevice";
	private static final String GETCONTROLTYPEBASETYPEID = "getControlTypeBaseTypeId";
	private static final String GETDEVICELIST = "getDeviceList";
	private static final String GETSIGNALBYEQUIPMENTID = "getSignalByEquipmentId";
	private static final String getControlList = "getControlList";
	private static final String getEventsByDeviceId = "getEventsByDeviceId";
	private static final String getSignalSwitchByDeviceId = "getSignalSwitchByDeviceId";
	private static final String GetSignalMeaningsByDIdSId = "GetSignalMeaningsByDIdSId";
	
	
	public BaseTypeDataHandler() {
	}

	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.GetSignalBaseTypeByDeviceBaseType))
		{
			rep.responseResult = handleGetSignalBaseTypeByDeviceBaseType(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.GETSIGNALBASETYPE))
		{
			rep.responseResult = handleGetSignalBaseType();
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.GETGAUGESIGNALBASETYPE))
		{
			rep.responseResult = handleGetGaugeSignalBaseType(req.requestParams);
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.GETALLCONTROLBASEDEVICE))
		{
			rep.responseResult = handleGetAllControlBaseDevice(req.requestParams);
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.GETCONTROLTYPEBASETYPEID))
		{
			rep.responseResult = handleGetControlTypeBaseTypeId(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.GETDEVICELIST))
		{
			rep.responseResult = handleGetDeviceList();
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.GETSIGNALBYEQUIPMENTID))
		{
			rep.responseResult = handleGetSignalByEquipmentId(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(
				BaseTypeDataHandler.getControlList))
		{
			rep.responseResult = handlegetControlList(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(BaseTypeDataHandler.getEventsByDeviceId))
		{
			rep.responseResult = handleGetEventsByDeviceId(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(BaseTypeDataHandler.getSignalSwitchByDeviceId))
		{
			rep.responseResult = handleGetSignalSwitchByDeviceId(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(BaseTypeDataHandler.GetSignalMeaningsByDIdSId))
		{
			rep.responseResult = handleGetSignalMeaningsByDIdSId(req.requestParams);
		}
	}

	private String handlegetControlList(String requestParams) {
		 ArrayList<DataItem> temp = DataItemProvider.getInstance().GetDataItemsByEntryId(32);
		 return JsonHelper.ListjsonString("ret", temp);
	}

	private String handleGetSignalBaseTypeByDeviceBaseType(String requestParams) {
		
		try {
			Integer.valueOf(requestParams);
		} catch (Exception e) {
			System.out.println("handleGetSignalBaseTypeByDeviceBaseType requestParams:"+requestParams);
			return JsonHelper.ListjsonString("ret", new ArrayList<SignalBaseType>());
		}
		int deviceId = Integer.valueOf(requestParams);
		
		List<SignalBaseType> rs = null;
		ArrayList<SignalBaseType> ts = BaseTypeProvider.getInstance().GetAllSignalBaseTypes();
		
		//预防加载数据代码失效
		if(ts.size() ==0){ 
			ConfigCache.getInstance().Load();
			ts = BaseTypeProvider.getInstance().GetAllSignalBaseTypes();
		}
		//判断是主页面还是其他页面
		if(deviceId == 1004){
			ArrayList<ActiveDevice> devicesList = ConfigCache.getInstance().getAllActiveDevices();
			List<ActiveDevice> collect = devicesList.stream()
					.filter(d -> (d.equipmentCategory > 50 && d.equipmentCategory < 56))
					.collect(Collectors.toList());
			rs = new ArrayList<SignalBaseType>();
			for(ActiveDevice ad : collect){
				for(SignalBaseType sb : ts){
					if(sb.deviceBaseTypeId == ad.id){
						/*if(sb.baseTypeName.indexOf(ad.name+" - ")<0)
							sb.baseTypeName = ad.name+" - "+sb.baseTypeName;*/
						rs.add(sb);
					}
				}
			}
		}else{
			rs = ts.stream()
					.filter(s->s.deviceBaseTypeId == deviceId)
					.collect(Collectors.toList());
		}
		return JsonHelper.ListjsonString("ret", rs);
	}
	/**
	 * 只限于在“系统概况”页面显示所有的设备信号
	 * */
	private String handleGetSignalBaseType(){
		List<SignalBaseType> rs = new ArrayList<SignalBaseType>();
		
		List<ActiveDevice> ads = ConfigCache.getInstance().getAllActiveDevices();
		List<ActiveSignal> ass = ConfigCache.getInstance().getAllActiveSignals();
		
		if(ads.size()==0 || ass.size()==0){
			ConfigCache.getInstance().Load();
			ads = ConfigCache.getInstance().getAllActiveDevices();
			ass = ConfigCache.getInstance().getAllActiveSignals();
		}
		
		for(ActiveDevice dev : ads){
			if ((dev.equipmentCategory <= 50 || dev.equipmentCategory >=56) && dev.equipmentCategory != 83) continue;
			for(ActiveSignal as : ass){
				if (as.baseTypeId == 0) continue;
				if (as.signalId == -3) continue;
				if(dev.id == as.deviceId){
					SignalBaseType sbt = new SignalBaseType();
					sbt.deviceBaseTypeId = dev.id;
					sbt.baseTypeId = as.baseTypeId;
					sbt.baseTypeName = dev.name + "-" + as.signalName;
					sbt.remark = as.description;
					
					rs.add(sbt);				
				}
			}
		}
		
		return JsonHelper.ListjsonString("ret", rs);
	}
	/** 仪表盘相关 */
	private String handleGetGaugeSignalBaseType(String requestParams){
		try {
			int deviceId = Integer.valueOf(requestParams);
			ArrayList<SignalBaseType> ts = BaseTypeProvider.getInstance().GetGaugeSignalBaseType(deviceId);
			
			return JsonHelper.ListjsonString("ret", ts);
		} catch (Exception e) {
			return JsonHelper.ListjsonString("ret", new ArrayList<SignalBaseType>());
		}
	} 
	/** 遥控遥调控件 */
	private String handleGetAllControlBaseDevice(String requestParams){
		ArrayList<Control> cs = new ArrayList<Control>();
		String[] split = requestParams.split("\\|");
		
		//if(split.length < 2 || split[0].equals("undefined") || split[1].equals("undefined")) return JsonHelper.ListjsonString("ret", cs);;
		
		int deviceId = split[0].equals("") ? 0 :Integer.valueOf(split[0]);
		int CommandType = split.length < 2 ? -1 : Integer.valueOf(split[1]);
		
		cs = BaseTypeProvider.getInstance().GetAllControlBaseDevice(deviceId,CommandType);

		return JsonHelper.ListjsonString("ret", cs);
	}
	/** 遥控遥调绑定值 */
	private String handleGetControlTypeBaseTypeId(String requestParams){
		String[] split = requestParams.split("\\|");
		int deviceId = split[0].equals("") ? 0 :Integer.valueOf(split[0]);
		if(split.length < 2 || split[1].equals("undefined")) return JsonHelper.ListjsonString("ret",new ArrayList<ControlMeanings>());
		int baseTypeId = Integer.valueOf(split[1]);
		
		ArrayList<ControlMeanings> cm = BaseTypeProvider.getInstance().GetControlTypeByControlId(deviceId,baseTypeId);
		
		return JsonHelper.ListjsonString("ret",cm);
	}
	
	private String handleGetDeviceList(){
		return JsonHelper.ListjsonString("ret",BaseTypeProvider.getInstance().GetDeviceList());
	}
	
	private String handleGetSignalByEquipmentId(String requestParams){
		// requestParams => EquipmentId
		ArrayList<ActiveSignal> allSignals = ConfigCache.getInstance().getAllActiveSignals(); 
		List<ActiveSignal> collect = allSignals.stream()
				.filter(s->s.deviceId == CabinetDeviceMap.parseInt(requestParams))
				.collect(Collectors.toList());
		collect.sort((a, b) -> Integer.compare(a.signalId, b.signalId));
		return JsonHelper.ListjsonString("ret",collect);
	}
	
	private String handleGetEventsByDeviceId(String requestParams){
		// requestParams => EquipmentId
		return JsonHelper.ListjsonString("ret", BaseTypeProvider.getInstance().GetEventsByDeviceId(requestParams));
	}
	
	//根据设备编号获取所有开关量
	private String handleGetSignalSwitchByDeviceId(String requestParams){
		// requestParams => EquipmentId
		return JsonHelper.ListjsonString("ret", BaseTypeProvider.getInstance().GetSignalSwitchByDeviceId(requestParams));
	}
	
	//根据设备编号与信号编号获取信号含义
	private String handleGetSignalMeaningsByDIdSId(String requestParams){
		// requestParams => EquipmentId|SignalId
		String[] split = requestParams.split("\\|");
		return JsonHelper.ListjsonString("ret", SignalMeaningsProvider.getInstance().GetSignalMeaningsByDIdSId(split[0],split[1]));
	}
}
