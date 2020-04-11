package nurse.logic.handlers;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import nurse.entity.persist.Puerecord;
import nurse.entity.persist.ThermalSensors;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.ActiveSignalProvider;
import nurse.logic.providers.CacheHistorySignalProvider;
import nurse.logic.providers.DiagramProvider;
import nurse.logic.providers.MdcAlarmProvider;
import nurse.logic.providers.MdcConfigProvider;
import nurse.logic.providers.SystemSettingProvider;
import nurse.logic.providers.UserOperationLogProviders;
import nurse.utility.JsonHelper;

public class MdcAlarmDataHandler extends DataHandlerBase {

	private static final String GETCABINETLIST = "GetCabinetList";
	private static final String GETOTHERSIGNAL = "GetOtherSignal";
	private static final String GETCABINETPOWERINFO = "GetCabinetPowerInfo";
	private static final String GETPOWERKPIINFO = "GetPowerKpiInfo";
	private static final String GETCABINETTEMP = "GetCabinetTemp";
	private static final String GETMDCALARMINFO = "GetMDCAlarmInfo";
	private static final String GETTEMPERATURE = "GetTemperature";
	private static final String GETMDCNAMES = "GetMdcNames";
	private static final String GETCABINETNUMBER = "GetCabinetNumber";
	private static final String GETHISTORYPUECHARTS = "GetHistoryPueCharts";
	private static final String GETIPSTATUS = "GetIPStatus";
	
	private static final String reLoadMdcConfig = "reLoadMdcConfig";

	private static final String GETCABINETLISTINFO = "GetCabinetListInfo";
	
	private static HashMap<String, String> cabinetListStr = new HashMap<String, String>();
	private static HashMap<String, String> otherSignalStr = new HashMap<String, String>();
	private static HashMap<String, String> powerKpiStr = new HashMap<String, String>();
	private static HashMap<String, String> cabinetTempStr = new HashMap<String, String>();
	private static HashMap<String, String> temperatureStr = new HashMap<String, String>();
	private static String mdcNames = "";
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETCABINETLIST))
		{
			rep.responseResult = HandleGetCabinetList(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETOTHERSIGNAL))
		{
			rep.responseResult = HandleGetOtherSignal(req.requestParams);
		}	
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETCABINETPOWERINFO))
		{
			rep.responseResult = HandleGetCabinetPowerInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETPOWERKPIINFO))
		{
			rep.responseResult = HandleGetPowerKpiInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETCABINETTEMP))
		{
			rep.responseResult = HandleGetCabinetTemp(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETMDCALARMINFO))
		{
			rep.responseResult = HandleGetMDCAlarmInfo(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETTEMPERATURE))
		{
			rep.responseResult = HandleGetTemperature(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETMDCNAMES))
		{
			rep.responseResult = HandleGetMdcNames(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETCABINETNUMBER))
		{
			rep.responseResult = HandleGetCabinetNumber(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETHISTORYPUECHARTS))
		{
			rep.responseResult = HandleGetHistoryPueCharts(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETIPSTATUS))
		{
			rep.responseResult = HandleGetIPStatus(req.requestParams);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.reLoadMdcConfig))
		{
			rep.responseResult = HandleReLoadMdcConfig(req.requestParams, inetIp);
		}
		if(GetCommandName(req.requestCommand).equalsIgnoreCase(MdcAlarmDataHandler.GETCABINETLISTINFO))
		{
			rep.responseResult = HandleGetCabinetListInfo(req.requestParams);
		}
	}

	/** 清空存储MDC的HashMap **/
	public static void closeHashMap(){
		cabinetListStr = new HashMap<String, String>();
		otherSignalStr = new HashMap<String, String>();
		powerKpiStr = new HashMap<String, String>();
		cabinetTempStr = new HashMap<String, String>();
		temperatureStr = new HashMap<String, String>();
		mdcNames = "";
		MdcConfigDataHandler.closeHashMap();
	}
	
	private String HandleGetCabinetList(String requestParams){
		if(cabinetListStr.containsKey(requestParams)) return cabinetListStr.get(requestParams);
		cabinetListStr.put(requestParams, MdcAlarmProvider.getInstance().getCabinetList(requestParams));
		return cabinetListStr.get(requestParams);
	}
	
	private String HandleGetOtherSignal(String requestParams){
		if(otherSignalStr.containsKey(requestParams)) return otherSignalStr.get(requestParams);
		otherSignalStr.put(requestParams, MdcAlarmProvider.getInstance().getOtherSignal(requestParams));
		return otherSignalStr.get(requestParams);
	}
	
	private String HandleGetCabinetPowerInfo(String requestParams){
		if(cabinetListStr.containsKey(requestParams)) return cabinetListStr.get(requestParams);
		cabinetListStr.put(requestParams, MdcAlarmProvider.getInstance().getCabinetList(requestParams));
		return cabinetListStr.get(requestParams);
	}
	
	private String HandleGetPowerKpiInfo(String requestParams){
		if(powerKpiStr.containsKey(requestParams)) return powerKpiStr.get(requestParams);
		StringBuffer sb = new StringBuffer();
		String mPueDataList = MdcAlarmProvider.getInstance().getPuerecord(requestParams);
		String mPueData = MdcAlarmProvider.getInstance().getmPueData(requestParams);
		String itLoadDataList = MdcAlarmProvider.getInstance().getItLoadDataList(requestParams);
		String totalPower = JsonHelper.ListjsonString("list", MdcAlarmProvider.getInstance().getTotalPower(requestParams));
		double maxPower = MdcAlarmProvider.getInstance().getMaxPower(requestParams);
		String totalElectricity = MdcAlarmProvider.getInstance().getTotalElectricity(requestParams);
		sb.append("{");
		sb.append(String.format("\"mdcId\":\"%s\",", requestParams));
		sb.append(String.format("\"mPueDataList\":{%s},", mPueDataList));
		sb.append(String.format("\"mPueData\":%s,", mPueData));
		sb.append(String.format("\"itLoadDataList\":[%s],", itLoadDataList));
		sb.append(String.format("\"totalPower\":{\"totleSignalId\":%s,\"value\":\"0\"},", totalPower));
		sb.append(String.format("\"maxPower\":\"%s\",", maxPower));
		sb.append(String.format("\"totalElectricity\":{\"signalId\":%s,\"value\":\"0\"}", totalElectricity));
		sb.append("}");
		powerKpiStr.put(requestParams, sb.toString());
		return powerKpiStr.get(requestParams);
	}
	
	private String HandleGetCabinetTemp(String reuestParams){
		if(cabinetTempStr.containsKey(reuestParams)) return cabinetTempStr.get(reuestParams);
		cabinetTempStr.put(reuestParams, MdcAlarmProvider.getInstance().getCabinetTemp(reuestParams));
		return cabinetTempStr.get(reuestParams);
	}
	
	private String HandleGetMDCAlarmInfo(String requestParams) {
		return MdcAlarmProvider.getInstance().getMDCAlarmInfo(requestParams);
	}
	
	private String HandleGetTemperature(String reuestParams){
		if(temperatureStr.containsKey(reuestParams)) return temperatureStr.get(reuestParams);
		List<ThermalSensors> temperature = MdcAlarmProvider.getInstance().getTemperature(reuestParams);
		temperatureStr.put(reuestParams, JsonHelper.ListjsonString("ret", temperature));
		return temperatureStr.get(reuestParams);
	}
	
	private String HandleGetMdcNames(String reuestParams){
		if(mdcNames == null || mdcNames.equals("")){
			mdcNames = MdcAlarmProvider.getInstance().getMdcNames();
		}
		return mdcNames;
	}
	
	private String HandleGetCabinetNumber(String reuestParams){
		return MdcConfigProvider.getInstance().getCabinetNumber(reuestParams);
	}

	/**********  重新加载   ***********/
	public static String ReloadOtherSignal(String mdcId){
		otherSignalStr.put(mdcId, MdcAlarmProvider.getInstance().getOtherSignal(mdcId));
		return otherSignalStr.get(mdcId);
	}
	public static String ReloadCabinetList(String mdcId){
		cabinetListStr.put(mdcId, MdcAlarmProvider.getInstance().getCabinetList(mdcId));
		return cabinetListStr.get(mdcId);
	}
	public static String ReloadCabinetTemp(String mdcId){
		cabinetTempStr.put(mdcId, MdcAlarmProvider.getInstance().getCabinetTemp(mdcId));
		return cabinetTempStr.get(mdcId);
	}
	
	public String HandleGetHistoryPueCharts(String reuestParams){
		// reuestParams => Days
		int days = 7;
		if(reuestParams != null && !reuestParams.equals(""))
			days = Integer.parseInt(reuestParams);
		
		ArrayList<Puerecord> prs = CacheHistorySignalProvider.getInstance().getAllPueRecordsByDay(days);
		return DiagramProvider.getInstance().getPueCountValue(prs);
	}
	
	private String HandleGetIPStatus(String reuestParams){
		// reuestParams => IP
		boolean status = SystemSettingProvider.getInstance().ping(reuestParams, 3, 3);
		if(status) return "true";
		else return "false";
	}
	
	private String HandleReLoadMdcConfig(String reuestParams, String inetIp){
		//清空存储MDC的HashMap 
		MdcAlarmDataHandler.closeHashMap();
		ActiveSignalProvider.closeHashMap();
		ActiveSignalDataHandler.closeHashMap();
		//用户操作日志
		UserOperationLogProviders.getInstance().insertUserOperationLog(60, reuestParams, inetIp, null, null, "", null, "");
		return "OK";
	}

	private String HandleGetCabinetListInfo(String reuestParams){
		// reuestParams => mdcId

		String mdcId = "";
		if(reuestParams != null && !reuestParams.equals("undefined"))
			mdcId = reuestParams;

		return MdcAlarmProvider.getInstance().getCabinetListInfo(mdcId);
	}
}
