package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.*;
import nurse.utility.DatabaseHelper;

public class AlarmLinkageProvider {
	private static Logger log = Logger.getLogger(AlarmLinkageProvider.class);
	private static AlarmLinkageProvider instance = new AlarmLinkageProvider();
	private static int logActionId = 100000011;

	public AlarmLinkageProvider(){
		
	}
	public static AlarmLinkageProvider getInstance(){
		return instance;
	}
	
	public ArrayList<EventLogAction> GetAllAlarmLinkage(){
		DatabaseHelper dbHelper = null;
		ArrayList<EventLogAction> list = new ArrayList<EventLogAction>();
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            
            sb.append("SELECT A.LogActionId,B.ActionId,A.ActionName,A.TriggerType,");
            sb.append("A.StartExpression,B.EquipmentId,B.ControlId,B.ActionValue,A.Description ");
            sb.append("FROM TBL_EventLogAction A ");
            sb.append("LEFT JOIN TBL_ControlLogAction B ON A.LogActionId = B.LogActionId ");
            sb.append("ORDER BY LogActionId,ActionId;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());	
            list = EventLogAction.GetListFromDataTable(dt);
		} catch (Exception e) {
			log.error("GetAllAlarmLinkage()", e);
			return list;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return list;
	}
	
	public String InsertAlarmLinkage(EventLogAction eventLog,ArrayList<ControlLogAction> controlLogs){
		DatabaseHelper dbHelper = null;
		try
        {	
            dbHelper = new DatabaseHelper();
            int logActionId = GetMaxLogActionId();
            String sql = String.format(" call PRO_InsertAlarmLinkage(%s,'%s','%s','%s','%s')",
            		logActionId,eventLog.actionName,eventLog.triggerType,eventLog.startExpression,eventLog.description);
            dbHelper.executeNoQuery(sql);
            
            for(ControlLogAction item : controlLogs){
            	sql = String.format("INSERT INTO TBL_ControlLogAction VALUES(%s,%s,'%s',%s,%s,'%s');",
            			logActionId,item.actionId,item.actionName,item.equipmentId,item.controlId,item.actionValue);
                dbHelper.executeNoQuery(sql);
            }
            
		} catch (Exception e) {
			log.error("UpdateAlarmLinkage()", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return "OK";
	}
	
	private int GetMaxLogActionId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(LogActionId) FROM TBL_EventLogAction");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = logActionId++;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					iMaxId++;
					logActionId = iMaxId;
				}

			} catch (Exception e) {
				log.error("GetMaxEquipmentId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
	public String UpdateAlarmLinkage(EventLogAction eventLog,ArrayList<ControlLogAction> controlLogs){
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("UPDATE TBL_EventLogAction SET ActionName = '%s',TriggerType = %s,StartExpression = '%s',Description = '%s' WHERE LogActionId = %s;",
            		eventLog.actionName,eventLog.triggerType,eventLog.startExpression,eventLog.description,eventLog.logActionId);
            dbHelper.executeNoQuery(sql);
            
            sql = String.format("DELETE FROM TBL_ControlLogAction WHERE LogActionId = %s;", eventLog.logActionId);
            dbHelper.executeNoQuery(sql);
            
            for(ControlLogAction item : controlLogs){
            	sql = String.format("INSERT INTO TBL_ControlLogAction VALUES(%s,%s,'%s',%s,%s,'%s');",
            			item.logActionId,item.actionId,item.actionName,item.equipmentId,item.controlId,item.actionValue);
                dbHelper.executeNoQuery(sql);
            }
            
		} catch (Exception e) {
			log.error("UpdateAlarmLinkage()", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return "OK";
	}
	
	public String DeleteAlarmLinkage(int logActionId){
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_EventLogAction WHERE LogActionId = %s;", logActionId);
            dbHelper.executeNoQuery(sql);
            
            sql = String.format("DELETE FROM TBL_ControlLogAction WHERE LogActionId = %s;", logActionId);
            dbHelper.executeNoQuery(sql);
            
		} catch (Exception e) {
			log.error("UpdateAlarmLinkage()", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return "OK";
	}
	
	public ArrayList<EquipmentEventCondition> GetEventExperByETId(String equipmentId){
		DatabaseHelper dbHelper = null;
		ArrayList<EquipmentEventCondition> list = new ArrayList<EquipmentEventCondition>();
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            
            sb.append("SELECT C.EquipmentId,C.EquipmentName,B.EventId,B.EventName,A.EventConditionId,A.Meanings ");
            sb.append("FROM TBL_EventCondition A ");
            sb.append("LEFT JOIN TBL_Event B ON A.EventId = B.EventId AND A.EquipmentTemplateId = B.EquipmentTemplateId ");
            sb.append("LEFT JOIN TBL_Equipment C ON A.EquipmentTemplateId = C.EquipmentTemplateId ");
            sb.append(String.format("WHERE C.EquipmentId = %s ORDER BY A.EventId,A.EventConditionId;", equipmentId));
            
            DataTable dt = dbHelper.executeToTable(sb.toString());	
            list = EquipmentEventCondition.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetAllAlarmLinkage()", e);
			return list;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return list;
	}

	public String InsertSignalinkage(EventLogAction eventLog,ArrayList<ControlLogAction> controlLogs){
		DatabaseHelper dbHelper = null;
		try
		{
			dbHelper = new DatabaseHelper();
			int logActionId = GetMaxLogActionId();
			String sql = String.format(" call PRO_InsertAlarmLinkage(%s,'%s','%s','%s','%s')",
					logActionId,eventLog.actionName,eventLog.triggerType,eventLog.startExpression,eventLog.description);
			dbHelper.executeNoQuery(sql);

			for(ControlLogAction item : controlLogs){
				sql = String.format("INSERT INTO TBL_ControlLogAction VALUES(%s,%s,'%s',%s,%s,'%s');",
						logActionId,item.actionId,item.actionName,item.equipmentId,item.controlId,item.actionValue);
				dbHelper.executeNoQuery(sql);
			}
			return String.valueOf(logActionId);
		} catch (Exception e) {
			log.error("UpdateAlarmLinkage()", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
