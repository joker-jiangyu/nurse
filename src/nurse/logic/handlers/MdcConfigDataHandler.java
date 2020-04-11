package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.HashMap;

import nurse.entity.persist.*;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.DataItemProvider;
import nurse.logic.providers.MdcAlarmProvider;
import nurse.logic.providers.MdcConfigProvider;
import nurse.logic.providers.RtspVideoProviders;
import nurse.logic.providers.VideoEquipmentPrioviders;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class MdcConfigDataHandler extends DataHandlerBase {
	
	private static final String GETMDCCONFIGINFO = "GetMdcConfigInfo";
	private static final String SETMDCCONFIGINFO = "SetMdcConfigInfo";
	private static final String GETCABINETTYPES = "GetCabinetTypeDataItem";
	private static final String GETOTHEREVENTS = "GetOtherEvents";
	private static final String GETOTHERSIGNAL = "GetOtherSignal";
	private static final String SETOTHERSIGNAL = "SetOtherSignal";
	private static final String GETALLEVENTS = "GetAllEvents";
	private static final String UPDATEOTHEREVENT = "UpdateOtherEvent";
	private static final String INITCABINET = "InitCabinet";
	private static final String INITCABINETTHERMALSENSORS = "InitCabinetThermalSensors";
	private static final String UPDATECABINETDEVICE = "UpdateCabinetDevice";
	private static final String GETCABINETASSETINFO = "GetCabinetAssetInfo";
	//private static final String UPDATECABINETASSET = "UpdateCabinetAsset";
	private static final String GETALLAISLETHERMALHUMIDITY = "getAllAisleThermalHumidity";
	private static final String SETAISLETHERMALHUMIDITY = "setAisleThermalHumidity";
	private static final String GETAISLEDEVICELOCATION = "getAisleDeviceLocation";
	private static final String SETAISLEDEVICELOCATION = "setAisleDeviceLocation";
	private static final String DELAISLEDEVICELOCATION = "delAisleDeviceLocation";

	private static final String GETMDCCONTROLBYNAME = "GetMdcControlByName";
	private static final String SETTINGMDCCONTROL = "SettingMdcControl";
	private static final String REMOVEMDCCONTROL = "RemoveMdcControl";

	private static final String GETALLAISLEDEVICELIST = "GetAllAisleDeviceList";
	
	private static HashMap<String, ArrayList<DataItem>> CabinetTypeDataItem = new HashMap<String, ArrayList<DataItem>>();
	private static HashMap<String, ArrayList<CabinetSignalMap>> OtherEvents = new HashMap<String, ArrayList<CabinetSignalMap>>();
	private static ArrayList<CabinetSignalMap> AllEvents = new ArrayList<CabinetSignalMap>();
	
	public static void closeHashMap(){
		CabinetTypeDataItem = new HashMap<String, ArrayList<DataItem>>();
		OtherEvents = new HashMap<String, ArrayList<CabinetSignalMap>>();
		AllEvents = new ArrayList<CabinetSignalMap>();
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETMDCCONFIGINFO))
		{
			rep.responseResult = HandleGetMdcConfigInfo(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.SETMDCCONFIGINFO))
		{
			rep.responseResult = HandleSetMdcConfigInfo(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETCABINETTYPES))
		{
			rep.responseResult = HandleGetCabinetTypeDataItem(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETOTHEREVENTS))
		{
			rep.responseResult = HandleGetOtherEvents(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETOTHERSIGNAL))
		{
			rep.responseResult = HandleGetOtherSignal(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.SETOTHERSIGNAL))
		{
			rep.responseResult = HandleSetOtherSignal(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETALLEVENTS))
		{
			rep.responseResult = HandleGetAllEvents();
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.UPDATEOTHEREVENT))
		{
			rep.responseResult = HandleUpdateOtherEvent(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.INITCABINET))
		{
			rep.responseResult = HandleInitCabinet(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.INITCABINETTHERMALSENSORS))
		{
			rep.responseResult = HandleInitCabinetThermalSensors(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.UPDATECABINETDEVICE))
		{
			rep.responseResult = HandleUpdateCabinetDevice(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETCABINETASSETINFO)){
  			rep.responseResult = HandleGetCabinetAssetInfo(req.requestParams);
  		}
		/*if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.UPDATECABINETASSET)){
  			rep.responseResult = HandleUpdateCabinetAsset(req.requestParams);
  		}*/
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETALLAISLETHERMALHUMIDITY)){
			rep.responseResult = HandlerGetAllAisleThermalHumidity(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.SETAISLETHERMALHUMIDITY)){
			rep.responseResult = HandlerSetAisleThermalHumidity(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETAISLEDEVICELOCATION)){
			rep.responseResult = HandlerGetAisleDeviceLocation(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.SETAISLEDEVICELOCATION)){
			rep.responseResult = HandlerSetAisleDeviceLocation(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.DELAISLEDEVICELOCATION)){
			rep.responseResult = HandlerDelAisleDeviceLocation(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETMDCCONTROLBYNAME)){
			rep.responseResult = HandlerGetMdcControlByName(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.SETTINGMDCCONTROL)){
			rep.responseResult = HandlerSettingMdcControl(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.REMOVEMDCCONTROL)){
			rep.responseResult = HandlerRemoveMdcControl(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcConfigDataHandler.GETALLAISLEDEVICELIST)){
			rep.responseResult = HandlerGetAllAisleDeviceList(req.requestParams);
		}
	}
	

	private String HandleGetMdcConfigInfo(String reuestParams){
		return JsonHelper.ListjsonString("ret", MdcAlarmProvider.getInstance().getMdcConfigInfo());
	}
	
	private String HandleSetMdcConfigInfo(String reuestParams){
		/* type|id|name|cabinetNumber|cabinetUHeight|lineNumber|powerConsumption(DeviceId-SignalId)|
		 * line1PhaseAVoltage(DeviceId-SignalId)|line1PhaseACurrent(...)|line1PhaseBVoltage(...)|
		 * line1PhaseBCurrent(...)|line1PhaseCVoltage(...)|line1PhaseCCurrent(...)|...|*/
		String decode = Base64Helper.decode(reuestParams);
		String[] split = decode.split("\\|");
		
		Mdc mdc = new Mdc();
		mdc.type = CabinetDeviceMap.parseInt(split[0]);
		//id=undefined => 新增，否则修改
		mdc.id = split[1];
		mdc.name = split[2];
		mdc.cabinetNumber = CabinetDeviceMap.parseInt(split[3]);
		mdc.cabinetUHeight = CabinetDeviceMap.parseInt(split[4]);
		mdc.lineNumber = CabinetDeviceMap.parseInt(split[5]);
		mdc.powerConsumptionDeviceId = getStringByIndex(split,6,0);
		mdc.powerConsumptionSignalId = getStringByIndex(split,6,1);
		mdc.line1PhaseAVoltageDeviceId = getStringByIndex(split,7,0);
		mdc.line1PhaseAVoltageSignalId = getStringByIndex(split,7,1);
		mdc.line1PhaseACurrentDeviceId = getStringByIndex(split,8,0);
		mdc.line1PhaseACurrentSignalId = getStringByIndex(split,8,1);
		mdc.line1PhaseBVoltageDeviceId = getStringByIndex(split,9,0);
		mdc.line1PhaseBVoltageSignalId = getStringByIndex(split,9,1);
		mdc.line1PhaseBCurrentDeviceId = getStringByIndex(split,10,0);
		mdc.line1PhaseBCurrentSignalId = getStringByIndex(split,10,1);
		mdc.line1PhaseCVoltageDeviceId = getStringByIndex(split,11,0);
		mdc.line1PhaseCVoltageSignalId = getStringByIndex(split,11,1);
		mdc.line1PhaseCCurrentDeviceId = getStringByIndex(split,12,0);
		mdc.line1PhaseCCurrentSignalId = getStringByIndex(split,12,1);
		if(mdc.lineNumber > 1){//两路主路
			mdc.line2PhaseAVoltageDeviceId = getStringByIndex(split,13,0);
			mdc.line2PhaseAVoltageSignalId = getStringByIndex(split,13,1);
			mdc.line2PhaseACurrentDeviceId = getStringByIndex(split,14,0);
			mdc.line2PhaseACurrentSignalId = getStringByIndex(split,14,1);
			mdc.line2PhaseBVoltageDeviceId = getStringByIndex(split,15,0);
			mdc.line2PhaseBVoltageSignalId = getStringByIndex(split,15,1);
			mdc.line2PhaseBCurrentDeviceId = getStringByIndex(split,16,0);
			mdc.line2PhaseBCurrentSignalId = getStringByIndex(split,16,1);
			mdc.line2PhaseCVoltageDeviceId = getStringByIndex(split,17,0);
			mdc.line2PhaseCVoltageSignalId = getStringByIndex(split,17,1);
			mdc.line2PhaseCCurrentDeviceId = getStringByIndex(split,18,0);
			mdc.line2PhaseCCurrentSignalId = getStringByIndex(split,18,1);
		}
		
		if(mdc.id.equals("undefined") || mdc.id.equals("")){//新增
			if(!MdcConfigProvider.getInstance().insertMdcAndDictionary(mdc)) return "DANGER";
		}else{//修改
			if(!MdcConfigProvider.getInstance().updateMdcAndDictionary(mdc)) return "DANGER";
		}
		//Thermal_Sensors表
		MdcConfigProvider.getInstance().InitThermalSensors(mdc.cabinetNumber,mdc.type);
		return "SUCCESS";
	}
	
	private String getStringByIndex(String [] split, int index, int number){
		return split.length > index ? 
				(split[index].split("\\-").length > 1 ? 
						split[index].split("\\-")[number] : "NULL") : "NULL";
	}
	
	private String HandleGetCabinetTypeDataItem(String reuestParams){
		if(!CabinetTypeDataItem.containsKey(reuestParams))
			CabinetTypeDataItem.put(reuestParams, DataItemProvider.getInstance().GetDataItemsByEntryId(CabinetDeviceMap.parseInt(reuestParams)));
		return JsonHelper.ListjsonString("ret", CabinetTypeDataItem.get(reuestParams));
	}
	
	private String HandleGetOtherEvents(String reuestParams){
		if(!OtherEvents.containsKey(reuestParams))
			OtherEvents.put(reuestParams, MdcConfigProvider.getInstance().GetOtherEvents(reuestParams));
		return JsonHelper.ListjsonString("ret", OtherEvents.get(reuestParams));
	}
	
	private String HandleGetOtherSignal(String reuestParams){
		return JsonHelper.ListjsonString("ret", MdcConfigProvider.getInstance().GetOtherSignal());
	}
	
	private String HandleSetOtherSignal(String reuestParams){
		// reuestParams => mdcId|type|deviceId|signalId
		String[] split = reuestParams.split("\\|");
		String mdcId = split[0];
		// type => Water1、Water2、SkyFalling、Smoke1、Smoke2、Infrared1、Infrared2、DoorA、DoorB
		String type = split[1];
		String deviceId = split.length > 2 ? split[2] : null;
		String signalId = split.length > 3 ? split[3] : null;
		MdcConfigProvider.getInstance().SetOtherSignal(mdcId,type,deviceId,signalId);
		return MdcAlarmDataHandler.ReloadOtherSignal(mdcId);
	}
	
	private String HandleGetAllEvents(){
		if(AllEvents.size() == 0)
			AllEvents = MdcConfigProvider.getInstance().GetAllEvents();
		return JsonHelper.ListjsonString("ret", AllEvents);
	}
	
	private String HandleUpdateOtherEvent(String reuestParams){
		//reuestParams => MdcId|CabinetId|DeviceId1-SignalId1|DeviceId12-SignalId2|...
		String[] split = reuestParams.split("\\|");
		String mdcId = split[0];
		String cabinetId = split[1];
		ArrayList<CabinetSignalMap> csmList = new ArrayList<CabinetSignalMap>();
		for(int i = 2;i<split.length;i++){
			CabinetSignalMap csm = new CabinetSignalMap();
			csm.deviceId = split[i].split("\\-")[0];
			csm.signalId = split[i].split("\\-")[1];
			csm.cabinetId = cabinetId;
			csmList.add(csm);
		}
		MdcConfigProvider.getInstance().UpdateOtherEvent(mdcId,cabinetId,csmList);
		OtherEvents = new HashMap<String, ArrayList<CabinetSignalMap>>();
		return HandleGetOtherEvents(mdcId);
	}
	
	private String HandleInitCabinet(String reuestParams){
		//reuestParams => No|Name|MDCId|CabinetType|Side|RatedVoltage|RatedCurrent|PaaseAVoltage|PhaseACurrent|PaaseBVoltage|PhaseBCurrent|PaaseCVoltage|PhaseCCurrent
		String[] decode = Base64Helper.decode(reuestParams).split("\\|");
		String mdcId = decode[2];
		CabinetDeviceMap cdm = new CabinetDeviceMap();
		cdm.cabinetId = decode[0];
		cdm.cabinetName = decode[1];
		cdm.cabinetType = decode[3];
		cdm.side = decode[4];
		cdm.ratedVoltage = decode[5].equals("undefined") || decode[5].equals("") ? 0 : Double.parseDouble(decode[5]);
		cdm.ratedCurrent = decode[6].equals("undefined") || decode[6].equals("") ? 0 : Double.parseDouble(decode[6]);
		if(decode.length > 7 && !decode[7].equals("undefined") && !decode[7].equals("")){
			cdm.PhaseAVoltageDeviceId = decode[7].split("\\-")[0];
			cdm.PhaseAVoltageSignalId = decode[7].split("\\-")[1];
		}
		if(decode.length > 8 && !decode[8].equals("undefined") && !decode[8].equals("")){
			cdm.PhaseACurrentDeviceId = decode[8].split("\\-")[0];
			cdm.PhaseACurrentSignalId = decode[8].split("\\-")[1];
		}
		if(decode.length > 9 && !decode[9].equals("undefined") && !decode[9].equals("")){
			cdm.PhaseBVoltageDeviceId = decode[9].split("\\-")[0];
			cdm.PhaseBVoltageSignalId = decode[9].split("\\-")[1];
		}
		if(decode.length > 10 && !decode[10].equals("undefined") && !decode[10].equals("")){
			cdm.PhaseBCurrentDeviceId = decode[10].split("\\-")[0];
			cdm.PhaseBCurrentSignalId = decode[10].split("\\-")[1];
		}
		if(decode.length > 11 && !decode[11].equals("undefined") && !decode[11].equals("")){
			cdm.PhaseCVoltageDeviceId = decode[11].split("\\-")[0];
			cdm.PhaseCVoltageSignalId = decode[11].split("\\-")[1];
		}
		if(decode.length > 12 && !decode[12].equals("undefined") && !decode[12].equals("")){
			cdm.PhaseCCurrentDeviceId = decode[12].split("\\-")[0];
			cdm.PhaseCCurrentSignalId = decode[12].split("\\-")[1];
		}
		cdm.description = (decode.length > 13 && !decode[13].equals("undefined")) ? decode[13] : "";
		
		return MdcConfigProvider.getInstance().InitCabinet(mdcId,cdm);//MdcAlarmDataHandler.ReloadCabinetList(mdcId);
	}
	
	public String HandleInitCabinetThermalSensors(String reuestParams){
		//reuestParams => mdcId|cabinetNo|thermalSensors1|thermalSensors2|thermalSensors3
		String[] decode = Base64Helper.decode(reuestParams).split("\\|");
		String mdcId = decode[0];
		int cabinetNo = Integer.parseInt(decode[1]);
		HashMap<Integer, MdcTemperature> tempMap = new HashMap<Integer, MdcTemperature>();

		MdcTemperature mt1 = new MdcTemperature();
		mt1.mdcId = Integer.parseInt(mdcId);
		mt1.cabinetId = cabinetNo;
		mt1.deviceId = parseIntByDecode(decode,2,"\\-",0);
		mt1.signalId = parseIntByDecode(decode,2,"\\-",1);
		tempMap.put(1, mt1);
		
		MdcTemperature mt2 = new MdcTemperature();
		mt2.mdcId = Integer.parseInt(mdcId);
		mt2.cabinetId = cabinetNo;
		mt2.deviceId = parseIntByDecode(decode,3,"\\-",0);
		mt2.signalId = parseIntByDecode(decode,3,"\\-",1);
		tempMap.put(2, mt2);
		
		MdcTemperature mt3 = new MdcTemperature();
		mt3.mdcId = Integer.parseInt(mdcId);
		mt3.cabinetId = cabinetNo;
		mt3.deviceId = parseIntByDecode(decode,4,"\\-",0);
		mt3.signalId = parseIntByDecode(decode,4,"\\-",1);
		tempMap.put(3, mt3);
		
		MdcConfigProvider.getInstance().InitCabinetThermalSensors(tempMap);
		
		return MdcAlarmDataHandler.ReloadCabinetTemp(mdcId);
	}
	
	private int parseIntByDecode(String[] decode,int index,String c,int cindex){
		try {
			if(decode.length > index && !decode[index].equals("undefined") && !decode[index].equals(""))
				return Integer.parseInt(decode[index].split(c)[cindex]);
			else
				return -1;
		} catch (Exception e) {
			return -1;
		}
	}
	
	public String HandleUpdateCabinetDevice(String reuestParams){
		//reuestParams => mdcId|cabinetId|deviceId-index-height|...
		String[] split = reuestParams.split("\\|");
		String mdcId = split[0];
		String cabinetId = split[1];
		ArrayList<CabinetDeviceMap> cdms = new ArrayList<CabinetDeviceMap>();
		for(int i = 2;i < split.length;i++){
			String[] cabinet = split[i].split("\\-");
			CabinetDeviceMap cdm = new CabinetDeviceMap();
			cdm.cabinetId = cabinetId;
			cdm.equipmentId = cabinet[0].equals("undefined") ? "" : cabinet[0];
			cdm.equipmentName = Base64Helper.decode(cabinet[1]);
			cdm.UIndex = cabinet.length < 3 || cabinet[2].equals("undefined") || cabinet[2].equals("") 
					? 0 : Integer.parseInt(cabinet[2]);
			cdm.UHeight = cabinet.length < 4 || cabinet[3].equals("undefined") || cabinet[3].equals("") 
					? 0 : Integer.parseInt(cabinet[3]);
			cdms.add(cdm);
		}
		MdcConfigProvider.getInstance().UpdateCabinetDevice(cabinetId,cdms);
		
		return MdcAlarmDataHandler.ReloadCabinetList(mdcId);
	}
	
	private String HandleGetCabinetAssetInfo(String requestParams){
		// requestParams => CabinetId|MdcId
		String[] split = requestParams.split("\\|");
		String cabinetId = split[0];
		String mdcId = split[1];
		return JsonHelper.ListjsonString("ret",MdcConfigProvider.getInstance().GetCabinetAssetInfo(cabinetId,mdcId));
	}
	
/*	private String HandleUpdateCabinetAsset(String requestParams){
		// requestParams => AssetId|MdcId|CabinetId|AssetCode|Date|Vendor|Model|Responsible|EmployeeId|Description
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		CabinetAsset ca = new CabinetAsset();
		ca.assetId = split[0].equals("undefined") ? null : Integer.parseInt(split[0]);
		ca.mdcId = split[1].equals("undefined") ? null : Integer.parseInt(split[1]);
		ca.cabinetId = split[2].equals("undefined") ? null : Integer.parseInt(split[2]);
		ca.assetCode = split[3].equals("undefined") ? "" : split[3];
		ca.date = split[4].equals("undefined") ? "" : split[4];
		ca.vendor = split[5].equals("undefined") ? "" : split[5];
		ca.model = split[6].equals("undefined") ? "" : split[6];
		ca.responsible = split[7].equals("undefined") ? "" : split[7];
		ca.employeeId = split[8].equals("undefined") ? 0 :Integer.parseInt(split[8]);
		ca.description = split.length > 9 ? (split[9].equals("undefined") ? "" : split[9]) : "";
		
		return MdcConfigProvider.getInstance().UpdateCabinetAsset(ca);
	}*/
	
	private String HandlerGetAllAisleThermalHumidity(String requestParams){
		//requestParams => MdcId
		return JsonHelper.ListjsonString("ret", MdcConfigProvider.getInstance().getAllAisleThermalHumidity(requestParams));
	}
	
	private String HandlerSetAisleThermalHumidity(String requestParams){
		//requestParams => MdcId|Type-Index|DeviceId|SignalId
		String[] split = requestParams.split("\\|");
		String mdcId = split[0];
		String type = split[1].split("\\_").length > 1 ? split[1].split("\\_")[0] : "";// Thermal | Humidity
		String index = split[1].split("\\_").length > 1 ? split[1].split("\\_")[1] : "";// 1 | 2 | 3
		String deviceId = split.length > 2 ? split[2] : "NULL";
		String signalId = split.length > 3 ? split[3] : "NULL";
		
		MdcConfigProvider.getInstance().setAisleThermalHumidity(mdcId,type,index,deviceId,signalId);
		
		return JsonHelper.ListjsonString("ret", MdcConfigProvider.getInstance().getAllAisleThermalHumidity(mdcId));
	}
	
	private String HandlerGetAisleDeviceLocation(String requestParams){
		return JsonHelper.ListjsonString("ret", MdcConfigProvider.getInstance().getAisleDeviceLocation());
	}
	
	private String HandlerSetAisleDeviceLocation(String requestParams){
		//requestParams[0]: MDC_AisleDeviceLocation.Id
		//requestParams[1]: thermalHumidity(温湿度)、smoke(烟感)、infrared(红外)、skyFalling(天窗)、video(摄像头)、openSoftware(打开外置软件)
		//requestParams[2]: Row
		//requestParams[3]: Col
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		if(split.length > 2){
			AisleDeviceLocation adl = null;
			boolean bool = false;
			if(split[1].equals("thermal") || split[1].equals("humidity")){//温湿度
				String mdcId = split[4];
				String type = split[5].split("\\_").length > 1 ? split[5].split("\\_")[0] : "";// Thermal | Humidity
				String index = split[5].split("\\_").length > 1 ? split[5].split("\\_")[1] : "";// 1 | 2 | 3
				String deviceId = split.length > 6 ? split[6] : "NULL";
				String signalId = split.length > 7 ? split[7] : "NULL";
				
				int tableId = MdcConfigProvider.getInstance().setAisleThermalHumidity(mdcId,type,index,deviceId,signalId);
				if(tableId != -1){
					adl = new AisleDeviceLocation();
					adl.Id = (split[0].equals("") || split[0].equals("undefined"))?-1:Integer.parseInt(split[0]);
					adl.TableId = tableId;
					adl.TableName = "MDC_AisleThermalHumidity";
					adl.DeviceType = "thermalHumidity";
					adl.TableRow = Integer.parseInt(split[2]);
					adl.TableCol = Integer.parseInt(split[3]);
				}
				bool = false;
			}else if(split[1].equals("smoke") || split[1].equals("infrared") || split[1].equals("skyFalling")){//烟感 红外 天窗
				String mdcId = split[4];
				// type => Water1、Water2、SkyFalling、Smoke1、Smoke2、Infrared1、Infrared2、DoorA、DoorB
				String type = split[5];
				String deviceId = split.length > 6 ? split[6] : null;
				String signalId = split.length > 7 ? split[7] : null;
				int tableId = MdcConfigProvider.getInstance().SetOtherSignal(mdcId,type,deviceId,signalId);
				if(tableId != -1){
					adl = new AisleDeviceLocation();
					adl.Id = (split[0].equals("") || split[0].equals("undefined"))?-1:Integer.parseInt(split[0]);
					adl.TableId = tableId;
					adl.TableName = "MDC_Environment";
					adl.DeviceType = split[1];
					adl.TableRow = Integer.parseInt(split[2]);
					adl.TableCol = Integer.parseInt(split[3]);
				}
				bool = false;
			}else if(split[1].equals("video")){//摄像头
				adl = VideoEquipmentPrioviders.getInstance().setVideo(split);
			}else if(split[1].equals("rtspVideo")){//Rtsp分流视频
				adl = RtspVideoProviders.getInstance().setRtspVideo(split);
			}	
			if(adl != null)
				bool = MdcConfigProvider.getInstance().setAisleDeviceLocation(adl.Id,adl.TableId, adl.TableName, adl.DeviceType, adl.TableRow, adl.TableCol);
			
			if(bool) return "OK";
		}
		return "ERROR";
	}
	
	private String HandlerDelAisleDeviceLocation(String requestParams){
		// requestParams => Id
		if(MdcConfigProvider.getInstance().delAisleDeviceLocation(requestParams))
			return "OK";
		else
			return "ERROR";
	}

	private String HandlerGetMdcControlByName(String requestParams){
		// requestParams => MdcI|ControlName
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		String mdcId = split[0].equals("") ? null : split[0];
		String controlName = split[1];

		return JsonHelper.ListjsonString("ret", MdcConfigProvider.getInstance().getMdcControlByName(mdcId, controlName));
	}

	private String HandlerSettingMdcControl(String requestParams){
		// requestParams => MdcId|ControlName|EquipmentId|BaseTypeId|ParameterValues|Password
		String[] split = Base64Helper.decode(requestParams).split("\\|");

		MdcControl mc = new MdcControl();
		mc.setMdcId(split[0].equals("") ? null : split[0]);
		mc.setControlName(split[1]);
		mc.setEquipmentId(Integer.parseInt(split[2]));
		mc.setBaseTypeId(Integer.parseInt(split[3]));
		mc.setParameterValues(split[4]);
		mc.setPassword(split.length > 5 ? (split[5].equals("undefined") ? null : split[5]) : null);

		if(MdcConfigProvider.getInstance().settingMdcControl(mc))
			return "OK";
		else
			return "ERROR";
	}

	private String HandlerRemoveMdcControl(String requestParams){
		// requestParams => MdcI|ControlName
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		String mdcId = split[0].equals("") ? null : split[0];
		String controlName = split[1];

		if(MdcConfigProvider.getInstance().removeMdcControl(mdcId,controlName))
			return "OK";
		else
			return "ERROR";
	}

	private String HandlerGetAllAisleDeviceList(String requestParams){
		return JsonHelper.ListjsonString("ret", MdcConfigProvider.getInstance().getAllAisleDeviceList());
	}
}
