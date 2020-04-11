package nurse.logic.handlers;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;

import nurse.entity.persist.ActiveAlarm;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.view.ActiveAlarmBrief;
import nurse.logic.providers.ReportProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class HisAlarmDataHandler  extends DataHandlerBase {

	private static final String GetHisALarms = "getHisAlarms";
	private static final String LikeLimitHisAlarms = "likeLimitHisAlarms";
	private static final String LikeHisAlarmsTotals = "likeHisAlarmsTotals";

	private static final String NewLikeLimitHisAlarms = "newLikeLimitHisAlarms";
	private static final String NewLikeHisAlarmsTotals = "newLikeHisAlarmsTotals";

	private static final String GetHistoryAlarmByDevice = "GetHistoryAlarmByDevice";
	
	public HisAlarmDataHandler() {
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisAlarmDataHandler.GetHisALarms))
		{
			rep.responseResult = handleGetHisAlarms(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisAlarmDataHandler.LikeLimitHisAlarms))
		{
			rep.responseResult = handleLikeLimitHisAlarms(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisAlarmDataHandler.LikeHisAlarmsTotals))
		{
			rep.responseResult = handleLikeHisAlarmsTotals(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisAlarmDataHandler.NewLikeLimitHisAlarms))
		{
			rep.responseResult = handleNewLikeLimitHisAlarms(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisAlarmDataHandler.NewLikeHisAlarmsTotals))
		{
			rep.responseResult = handleNewLikeHisAlarmsTotals(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisAlarmDataHandler.GetHistoryAlarmByDevice))
		{
			rep.responseResult = handleGetHistoryAlarmByDevice(req.requestParams);
		}
	}

	private String handleGetHisAlarms(String requestParams) {
		try {
			String[] ss = requestParams.split("\\|");
			
			//SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

			Timestamp ts1 = Timestamp.valueOf(ss[0]);
			Timestamp ts2 = Timestamp.valueOf(ss[1]);
			
			Date startTime = new Date(ts1.getTime());
			Date endTime = new Date(ts2.getTime()+ (1000 * 60 * 60 * 24));
			
			ArrayList<ActiveAlarmBrief> aabs = new ArrayList<ActiveAlarmBrief>();
			
			ArrayList<ActiveAlarm> aas = ReportProvider.getInstance().getHisAlarmByTimeSpan(startTime, endTime);

			String triggerVal = LanguageDataHandler.getLanaguageJsonValue("AlarmRecord.TriggerVal");
			for(ActiveAlarm a : aas)
			{
				aabs.add(new ActiveAlarmBrief(a,triggerVal));
			}
			
			return 	JsonHelper.ListjsonString("ret", aabs);
		} catch (Exception e) {
			return 	JsonHelper.ListjsonString("ret", new ArrayList<ActiveAlarmBrief>());
		}
	}
	
	private String handleLikeLimitHisAlarms(String requestParams){
		//requestParams => index|size|startTime|endTime|content
		ArrayList<ActiveAlarmBrief> aabs = new ArrayList<ActiveAlarmBrief>();
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		
		int index = Integer.parseInt(split[0]);
		int size = Integer.parseInt(split[1]);
		Timestamp ts1 = Timestamp.valueOf(split[2]);
		Timestamp ts2 = Timestamp.valueOf(split[3]);
		Date startTime = new Date(ts1.getTime());
		Date endTime = new Date(ts2.getTime()+ (1000 * 60 * 60 * 24));
		String content = split.length > 4 ? split[4] : "";
		
		ArrayList<ActiveAlarm> aas = ReportProvider.getInstance().likeLimitHisAlarms(index,size,startTime,endTime,content);

		String triggerVal = LanguageDataHandler.getLanaguageJsonValue("AlarmRecord.TriggerVal");
		for(ActiveAlarm a : aas)
		{
			aabs.add(new ActiveAlarmBrief(a,triggerVal));
		}
		return 	JsonHelper.ListjsonString("ret", aabs);
	}
	
	private String handleLikeHisAlarmsTotals(String requestParams){
		//requestParams => startTime|endTime|content

		String[] split = Base64Helper.decode(requestParams).split("\\|");
		Timestamp ts1 = Timestamp.valueOf(split[0]);
		Timestamp ts2 = Timestamp.valueOf(split[1]);
		Date startTime = new Date(ts1.getTime());
		Date endTime = new Date(ts2.getTime()+ (1000 * 60 * 60 * 24));
		String content = split.length > 2 ? split[2] : "";
		
		return ReportProvider.getInstance().likeHisAlarmsTotals(startTime,endTime,content);
	}

	private String handleNewLikeLimitHisAlarms(String requestParams){
		//requestParams => index|size|startTime|endTime|EquipmentId1&...|EventServerity1&...|All(unconfirmed/confirmed)
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		//System.out.println("Limit Param:"+Base64Helper.decode(requestParams));

		int index = Integer.parseInt(split[0]);
		int size = Integer.parseInt(split[1]);
		Timestamp ts1 = Timestamp.valueOf(split[2]);
		Timestamp ts2 = Timestamp.valueOf(split[3]);
		Date startTime = new Date(ts1.getTime());
		Date endTime = new Date(ts2.getTime()+ (1000 * 60 * 60 * 24));
		String[] equipments = split.length > 4 ? split[4].split("\\&") : null;
		String[] levels = split.length > 5 ? split[5].split("\\&") : null;
		String cancel = split.length > 6 ? split[6] : "";

		ArrayList<ActiveAlarm> aas = ReportProvider.getInstance().newLikeLimitHisAlarms(index,size,startTime,endTime,equipments,levels,cancel);

		ArrayList<ActiveAlarmBrief> aabs = new ArrayList<ActiveAlarmBrief>();
		String triggerVal = LanguageDataHandler.getLanaguageJsonValue("AlarmRecord.TriggerVal");
		for(ActiveAlarm a : aas)
		{
			aabs.add(new ActiveAlarmBrief(a,triggerVal));
		}
		return 	JsonHelper.ListjsonString("ret", aabs);
	}

	private String handleNewLikeHisAlarmsTotals(String requestParams){
		//requestParams => startTime|endTime|EquipmentId1&...|EventServerity1&...|All(unconfirmed/confirmed)

		String[] split = Base64Helper.decode(requestParams).split("\\|");
		//System.out.println("Total Param:"+Base64Helper.decode(requestParams));

		Timestamp ts1 = Timestamp.valueOf(split[0]);
		Timestamp ts2 = Timestamp.valueOf(split[1]);
		Date startTime = new Date(ts1.getTime());
		Date endTime = new Date(ts2.getTime()+ (1000 * 60 * 60 * 24));
		String[] equipments = split.length > 2 ? split[2].split("\\&") : null;
		String[] levels = split.length > 3 ? split[3].split("\\&") : null;
		String cancel = split.length > 4 ? split[4] : "";

		return ReportProvider.getInstance().newLikeHisAlarmsTotals(startTime,endTime,equipments,levels,cancel);
	}

	private String handleGetHistoryAlarmByDevice(String requestParams){
		//requestParams => id1-id2|day|7(id1-id2|total|20)
		try{
			String[] split = requestParams.split("\\|");
			String[] ids = split[0].split("\\-");
			String type = split[1];
			int number = Integer.parseInt(split[2]);


			ArrayList<ActiveAlarm> alarms = new ArrayList<ActiveAlarm>();
			if(type.equals("day"))
				alarms = ReportProvider.getInstance().getHistoryAlarmByDays(ids,number);
			else
				alarms = ReportProvider.getInstance().getHistoryAlarmByTotals(ids,number);

			return 	JsonHelper.ListjsonString("ret", alarms);
		} catch (Exception e) {
			return 	JsonHelper.ListjsonString("ret", new ArrayList<ActiveAlarm>());
		}
	}
}
