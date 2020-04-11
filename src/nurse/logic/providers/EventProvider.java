package nurse.logic.providers;
import java.util.ArrayList;
import java.util.HashMap;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.Equipment;
import nurse.entity.persist.EquipmentTemplateEvent;
import nurse.entity.persist.Event;
import nurse.utility.DatabaseHelper;

public class EventProvider {

	private static EventProvider instance = new EventProvider();
	private static Logger log = Logger.getLogger(EventProvider.class);
	
	private HashMap<String,ArrayList<EquipmentTemplateEvent>> EteMap = new HashMap<String,ArrayList<EquipmentTemplateEvent>>();
	
	public EventProvider() {
	}
	
	public void initLoad(){
		EteMap = new HashMap<String,ArrayList<EquipmentTemplateEvent>>();
	}
	
	public static EventProvider getInstance(){
		return instance;
	}

	public boolean InsertEvent(int EquipmentTemplateId,
            int EventId,
            String EventName,
            int StartType,
            int EndType,
            String StartExpression,
            String SuppressExpression,
            int EventCategory,
            Integer SignalId,
            boolean Enable,
            boolean Visible,
            String Description,
            Integer DisplayIndex,
            int ModuleNo) {

		DatabaseHelper dbHelper = null;
		try
	        {
				if (SuppressExpression == null) SuppressExpression = "";
	            if (Description == null) Description = "";
            
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_Event");
	            sb.append("(EquipmentTemplateId, EventId, EventName, StartType, EndType, StartExpression, ");
	            sb.append("SuppressExpression, EventCategory, SignalId, Enable, Visible, Description, DisplayIndex, ModuleNo)");
	            sb.append(" VALUES (%d, %d, '%s', %d, %d, '%s', '%s', %d, %s, %d, %d, '%s', %d, %d)");

	            String sql = sb.toString();
	            sql = String.format(sql, EquipmentTemplateId, EventId, EventName, StartType, EndType, StartExpression,
	                    SuppressExpression, EventCategory, SignalId == null ? "NULL" : SignalId, Enable ? 1 : 0, Visible ? 1 : 0, 
	                    Description, DisplayIndex == null ? "NULL" : DisplayIndex, ModuleNo);
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertEvent() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
	
	public ArrayList<Event> GetCommmunicationEvent(int EquipmentTemplateId, int SignalId)
	{
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Event WHERE EquipmentTemplateId = %d AND SignalId = %d \r\n");
            String sql = sb.toString();
            sql = String.format(sql, EquipmentTemplateId, SignalId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return Event.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return null;
	}

	public ArrayList<Event> GetEventById(int equipmentTemplateId) {
		DatabaseHelper dbHelper = null;
		ArrayList<Event> list = new ArrayList<Event>();
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT * FROM TBL_Event WHERE EquipmentTemplateId=%s;",equipmentTemplateId));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	            
	            list = Event.fromDataTable(dt);
			} catch (Exception e) {
				log.error("fail to get Commmunication event", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return list;
	}

	public ArrayList<EquipmentTemplateEvent> getEquipmentTemplateEvents(String requestParams){
		if(EteMap.containsKey(requestParams))
			return EteMap.get(requestParams);
		
		ArrayList<EquipmentTemplateEvent> etes = new ArrayList<EquipmentTemplateEvent>();
		ArrayList<Equipment> equipments = new ArrayList<Equipment>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String[] ebts = requestParams.split("\\|");
			
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT A.* FROM TBL_Equipment A ");
            sb.append("LEFT JOIN TBL_EquipmentTemplate B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
            sb.append(String.format("WHERE %s;", resultSql("B",ebts)));
            DataTable dt = dbHelper.executeToTable(sb.toString());
            equipments = Equipment.fromDataTable(dt);
            
            sb = new StringBuilder();
            sb.append("SELECT C.EquipmentTemplateId,C.EquipmentTemplateName,A.SignalId,A.EventId,A.EventName,B.StartOperation,B.StartCompareValue,B.EventSeverity ");
            sb.append("FROM TBL_Event A ");
            sb.append("LEFT JOIN TBL_EventCondition B ON A.EventId = B.EventId AND A.EquipmentTemplateId = B.EquipmentTemplateId ");
            sb.append("LEFT JOIN TBL_EquipmentTemplate C ON A.EquipmentTemplateId = C.EquipmentTemplateId ");
            sb.append(String.format("WHERE %s;", resultSql("C",ebts)));
            dt = dbHelper.executeToTable(sb.toString());
            etes = EquipmentTemplateEvent.fromDataTable(dt, equipments);
            
            EteMap.put(requestParams, etes);
		} catch (Exception e) {
			log.error("GetEquipmentTemplateEvents Exception:", e);
			return etes;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return EteMap.get(requestParams);
	}
	
	private String resultSql(String t,String[] ebts){
		String result = "";
		for(int i = 0;i < ebts.length;i++){
			if(i == 0) result = String.format("%s.EquipmentBaseType = %s ", t,ebts[i]);
			else result += String.format(" OR %s.EquipmentBaseType = %s ", t,ebts[i]);
		}
		return result;
	}
}
