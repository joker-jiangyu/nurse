package nurse.logic.providers;

import java.sql.CallableStatement;
import java.sql.Date;
import java.util.ArrayList;

import nurse.logic.handlers.LanguageDataHandler;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.ActiveAlarm;
import nurse.utility.DatabaseHelper;

public class ReportProvider {

	private static ReportProvider instance = new ReportProvider();
	private static Logger log = Logger.getLogger(ReportProvider.class);
	
	public ReportProvider() {
	}
	

	
	public static ReportProvider getInstance(){
		return instance;
	}

	public ArrayList<ActiveAlarm> getHisAlarmByTimeSpan(Date startTime, Date endTime)
	{
		ArrayList<ActiveAlarm> res = new ArrayList<ActiveAlarm>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			CallableStatement stat = dbHelper.prepareProcedure("queryHisAlarm", "?,?");
			stat.setDate(1, startTime);
			stat.setDate(2, endTime);
			DataTable dt = dbHelper.executeQuery(stat);
			
			return ActiveAlarm.GetListFromDataTable(dt);

		} catch (Exception e) {
			log.error("fail to read all his alarms", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return res;
	}
	
	public ArrayList<ActiveAlarm> likeLimitHisAlarms(int index,int size,Date startTime, Date endTime,String content){
		ArrayList<ActiveAlarm> res = new ArrayList<ActiveAlarm>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT A.* FROM (");
			sb.append("	SELECT * FROM TBL_HistoryEvent he ");
			sb.append(String.format("	WHERE he.StartTime >= '%s' AND he.StartTime <= '%s' ", startTime,endTime));
			sb.append(String.format("	AND CONCAT(he.EventSeverity,' ',he.EquipmentName,' ',he.EventName,' ',he.Meanings,' [触发值:',he.EventValue,']') LIKE '%s' ", "%"+content+"%"));
			sb.append("	ORDER BY he.EndTime DESC,he.EventSeverityId DESC");
			sb.append("	LIMIT 3000 ");
			sb.append(String.format(") A LIMIT %s,%s;", index,size));
			DataTable dt = dbHelper.executeToTable(sb.toString());
			
			return ActiveAlarm.GetListFromDataTable(dt);
		} catch (Exception e) {
			log.error("LikeLimitHisAlarmss Exception:", e);
		} finally{
			if(dbHelper != null)dbHelper.close();
		}
		return res;
	}

	public ArrayList<ActiveAlarm> newLikeLimitHisAlarms(int index,int size,Date startTime, Date endTime,String[] equipments,String[] levels,String cancel){
		ArrayList<ActiveAlarm> res = new ArrayList<ActiveAlarm>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT A.* FROM (");
			sb.append("	SELECT * FROM TBL_HistoryEvent he ");
			sb.append(String.format("	WHERE he.StartTime >= '%s' AND he.StartTime <= '%s' ", startTime,endTime));
			//设备列表
			if(equipments != null && equipments.length > 0 && !equipments[0].equals("")){
				String eStr = "";
				for (String id : equipments) {
					if(eStr.equals(""))
						eStr += String.format(" he.EquipmentId = %s ",id);
					else
						eStr += String.format(" OR he.EquipmentId = %s ",id);
				}
				sb.append(String.format(" AND (%s) ",eStr));
			}
			//告警等级
			if(levels != null && levels.length > 0 && !levels[0].equals("")){
				String lStr = "";
				for(String level : levels){
					if(lStr.equals(""))
						lStr += String.format(" he.EventSeverityId = %s ",level);
					else
						lStr += String.format(" OR he.EventSeverityId = %s ",level);
				}
				sb.append(String.format(" AND (%s) ",lStr));
			}
			//确认状态
			if(cancel != null && !cancel.equals("")){
				if(cancel.equals("unconfirmed"))
					sb.append("AND he.CancelTime IS NULL");
				else
					sb.append("AND he.CancelTime IS NOT NULL");
			}

			sb.append("	ORDER BY he.EndTime DESC,he.EventSeverityId DESC");
			sb.append("	LIMIT 3000 ");
			sb.append(String.format(") A LIMIT %s,%s;", index,size));

			DataTable dt = dbHelper.executeToTable(sb.toString());


			return ActiveAlarm.GetListFromDataTable(dt);
		} catch (Exception e) {
			log.error("LikeLimitHisAlarmss Exception:", e);
		} finally{
			if(dbHelper != null)dbHelper.close();
		}
		return res;
	}

	public String likeHisAlarmsTotals(Date startTime, Date endTime,String content){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			StringBuffer sb = new StringBuffer();
			sb.append("SELECT COUNT(*) FROM (");
			sb.append("	SELECT * FROM TBL_HistoryEvent he ");
			sb.append(String.format("	WHERE he.StartTime >= '%s' AND he.StartTime <= '%s' ", startTime,endTime));
			sb.append(String.format("	AND CONCAT(he.EventSeverity,' ',he.EquipmentName,' ',he.EventName,' ',he.Meanings,' [触发值:',he.EventValue,']') LIKE '%s' ", "%"+content+"%"));
			sb.append("	ORDER BY he.EndTime DESC,he.EventSeverityId DESC");
			sb.append("	LIMIT 3000 ");
			sb.append(") A;");

			Object res = dbHelper.executeScalar(sb.toString());

			if(res == null){
				return "0";
			}else{
				return res.toString();
			}
		} catch (Exception e) {
			log.error("LikeHisAlarmsTotals Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return "0";
	}
	
	public String newLikeHisAlarmsTotals(Date startTime, Date endTime,String[] equipments,String[] levels,String cancel){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			StringBuffer sb = new StringBuffer();
			sb.append("SELECT COUNT(*) FROM (");
			sb.append("	SELECT * FROM TBL_HistoryEvent he ");
			sb.append(String.format("	WHERE he.StartTime >= '%s' AND he.StartTime <= '%s' ", startTime,endTime));
			//设备列表
			if(equipments != null && equipments.length > 0 && !equipments[0].equals("")){
				String eStr = "";
				for (String id : equipments) {
					if(eStr.equals(""))
						eStr += String.format(" he.EquipmentId = %s ",id);
					else
						eStr += String.format(" OR he.EquipmentId = %s ",id);
				}
				sb.append(String.format(" AND (%s) ",eStr));
			}
			//告警等级
			if(levels != null && levels.length > 0 && !levels[0].equals("")){
				String lStr = "";
				for(String level : levels){
					if(lStr.equals(""))
						lStr += String.format(" he.EventSeverityId = %s ",level);
					else
						lStr += String.format(" OR he.EventSeverityId = %s ",level);
				}
				sb.append(String.format(" AND (%s) ",lStr));
			}
			//确认状态
			if(cancel != null && !cancel.equals("")){
				if(cancel.equals("unconfirmed"))
					sb.append("AND he.CancelTime IS NULL");
				else
					sb.append("AND he.CancelTime IS NOT NULL");
			}
			sb.append("	ORDER BY he.EndTime DESC,he.EventSeverityId DESC");
			sb.append("	LIMIT 3000 ");
			sb.append(") A;");

			Object res = dbHelper.executeScalar(sb.toString());


			if(res == null){
            	return "0";
			}else{
				return res.toString();
			}
		} catch (Exception e) {
			log.error("LikeHisAlarmsTotals Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return "0";
	}

	public ArrayList<ActiveAlarm> getHistoryAlarmByDays(String[] ids, int days){
		ArrayList<ActiveAlarm> res = new ArrayList<ActiveAlarm>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT * FROM TBL_HistoryEvent ");
			int index = 0;
			for(String id : ids){
				if(index == 0)
					sb.append(String.format(" WHERE EquipmentId = %s ",id));
				else
					sb.append(String.format(" OR EquipmentId = %s ",id));
				index ++;
			}
			sb.append(String.format(" AND StartTime > NOW() - INTERVAL %d DAY ORDER BY StartTime DESC LIMIT 300;", days));
			DataTable dt = dbHelper.executeToTable(sb.toString());

			return forModifyLanguage(ActiveAlarm.GetListFromDataTable(dt));
		} catch (Exception e) {
			log.error("GetHistoryAlarmByDays Exception:", e);
		} finally{
			if(dbHelper != null)dbHelper.close();
		}
		return res;
	}

	public ArrayList<ActiveAlarm> getHistoryAlarmByTotals(String[] ids, int totals){
		ArrayList<ActiveAlarm> res = new ArrayList<ActiveAlarm>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT * FROM TBL_HistoryEvent ");
			int index = 0;
			for(String id : ids){
				if(id.equals("")) continue;

				if(index == 0)
					sb.append(String.format(" WHERE EquipmentId = %s ",id));
				else
					sb.append(String.format(" OR EquipmentId = %s ",id));
				index ++;
			}
			sb.append(String.format(" ORDER BY StartTime DESC LIMIT %d;", totals));

			DataTable dt = dbHelper.executeToTable(sb.toString());

			return forModifyLanguage(ActiveAlarm.GetListFromDataTable(dt));
		} catch (Exception e) {
			log.error("GetHistoryAlarmByTotals Exception:", e);
		} finally{
			if(dbHelper != null)dbHelper.close();
		}
		return res;
	}

	//遍历告警，修改中英文含义
	private ArrayList<ActiveAlarm> forModifyLanguage(ArrayList<ActiveAlarm> list){
		if(LanguageDataHandler.getLanaguage().equals("Chinese")) return list;

		if(list != null && list.size() > 0){
			for (ActiveAlarm alarm : list) {
				//告警等级
				String key = "AlarmRecord.";
				if(alarm.alarmLevel == 0) key += "PAlarm";
				else if(alarm.alarmLevel == 1) key += "GAlarm";
				else if(alarm.alarmLevel == 2) key += "IAlarm";
				else key += "EAlarm";
				alarm.alarmLevelName = LanguageDataHandler.getLanaguageJsonValue(key);
			}
		}
		return list;
	}
}
