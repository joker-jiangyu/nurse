
package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.json.JSONObject;

import nurse.entity.persist.ActiveAlarm;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.view.ActiveAlarmBrief;
import nurse.logic.providers.ActiveAlarmProvider;
import nurse.logic.providers.UserOperationLogProviders;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class ActiveAlarmDataHandler extends DataHandlerBase {
	
	private static final String AlarmCountByLevel = "alarmCountByLevel";
	private static final String AllAlarmList = "allAlarmList";
	private static final String EndAlarm = "endAlarm";
	private static final String GetAlarmsByDevice = "getAlarmsByDevice";
	private static final String LastedAlarm = "lastedAlarm";
	
	public ActiveAlarmDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveAlarmDataHandler.AlarmCountByLevel))
		{
			rep.responseResult = HandleAlarmCountByLevel(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveAlarmDataHandler.AllAlarmList))
		{
			rep.responseResult = HandleAllAlarmList(req.requestParams);
		}		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveAlarmDataHandler.EndAlarm))
		{
			rep.responseResult = HandleEndAlarm(req.requestParams, inetIp);
		}		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveAlarmDataHandler.GetAlarmsByDevice))
		{
			rep.responseResult = HandleGetAlarmsByDevice(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveAlarmDataHandler.LastedAlarm))
		{
			rep.responseResult = HandleLastedAlarm(req.requestParams);
		}	
		
	}

	private String HandleGetAlarmsByDevice(String requestParams) {
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		
		int id = Integer.parseInt(requestParams);
		List<ActiveAlarmBrief> abs = new ArrayList<ActiveAlarmBrief>();

		String triggerVal = LanguageDataHandler.getLanaguageJsonValue("AlarmRecord.TriggerVal");
		for(ActiveAlarm a : alarms)
		{
			if (a.deviceId == id)
				abs.add(new ActiveAlarmBrief(a,triggerVal));
		}
		
		return 	JsonHelper.ListjsonString("ret", abs);
	}

	private String HandleEndAlarm(String requestParams,String inetIp) {
		
		String param = Base64Helper.decode(requestParams);
		
		String[] tokens = param.split("\\|");
		
		if (tokens.length != 3 ) return "FAIL";

		//用户操作日志
		UserOperationLogProviders.getInstance().insertUserOperationLog(1, tokens[1], inetIp, null, null, null, tokens[0], "");
		
		ActiveAlarmProvider.getInstance().EndAlarms(tokens[0], tokens[1], tokens[2]);
		           return "OK";
	}
	
	
	private String HandleLastedAlarm(String requestParams) {
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		List<ActiveAlarmBrief> abs = new ArrayList<ActiveAlarmBrief>();
//		try {
//			Thread.sleep(400000);
//		} catch (InterruptedException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		} 
		Date now = new Date();
		ActiveAlarm lastedAlarm = null ;
		for(ActiveAlarm a : alarms)
		{
			if ((now.getTime()-a.startTime.getTime())/1000<30)
			{
				if(lastedAlarm==null){
					lastedAlarm = new ActiveAlarm(); 
					lastedAlarm = a;
				}
				if(lastedAlarm.startTime.getTime() < a.startTime.getTime()){
					lastedAlarm = a;
				}		
				if(lastedAlarm.alarmLevel<=a.alarmLevel){//获得时间段内最高级的告警
					lastedAlarm = a;
				}
			}
		}
		if(lastedAlarm!=null){
			abs.clear();
			String triggerVal = LanguageDataHandler.getLanaguageJsonValue("AlarmRecord.TriggerVal");
			abs.add(new ActiveAlarmBrief(lastedAlarm,triggerVal));//唯一警告
		}
		
		return 	JsonHelper.ListjsonString("ret", abs);
	}
	
	
	
	

	private String HandleAlarmCountByLevel(String requestParams) {
		JSONObject res = new JSONObject();
		
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		
		long tipCount = alarms.stream().filter(alarm -> alarm.alarmLevel == 0).count();
		long commonCount = alarms.stream().filter(alarm -> alarm.alarmLevel == 1).count();
		long importantCount = alarms.stream().filter(alarm -> alarm.alarmLevel == 2).count();
		long urgentCount = alarms.stream().filter(alarm -> alarm.alarmLevel == 3).count();
		
		res.put("levelTip", String.valueOf(tipCount));
		res.put("levelCommon", String.valueOf(commonCount));
		res.put("levelImportant", String.valueOf(importantCount));
		res.put("levelUrgent", String.valueOf(urgentCount));
		
		return res.toString();		
	}

	private String HandleAllAlarmList(String requestParams) {
		
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		
		List<ActiveAlarmBrief> abs = new ArrayList<ActiveAlarmBrief>();

		String triggerVal = LanguageDataHandler.getLanaguageJsonValue("AlarmRecord.TriggerVal");

		for(ActiveAlarm a : alarms)
		{
			abs.add(new ActiveAlarmBrief(a,triggerVal));
		}
		
		return 	JsonHelper.ListjsonString("ret", abs);
	}	
}
