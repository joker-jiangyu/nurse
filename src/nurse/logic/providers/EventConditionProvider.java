package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.Event;
import nurse.entity.persist.EventCondition;
import nurse.utility.DatabaseHelper;

public class EventConditionProvider {

	private static EventConditionProvider instance = new EventConditionProvider();
	private static Logger log = Logger.getLogger(EventConditionProvider.class);
	
	public EventConditionProvider() {
	}
	
	public static EventConditionProvider getInstance(){
		return instance;
	}

	public boolean InsertEventCondition(int EventConditionId,
	        int EquipmentTemplateId,
	        int EventId,
	        String StartOperation,
	        Float StartCompareValue,
	        int StartDelay,
	        String EndOperation,
	        Float EndCompareValue,
	        Integer EndDelay,
	        Integer Frequency,
	        Integer FrequencyThreshold,
	        String Meanings,
	        Short EquipmentState,
	        Integer BaseTypeId,
	        int EventSeverity,
	        Integer StandardName) {

		DatabaseHelper dbHelper = null;
		try
	        {
				if (EndOperation == null) EndOperation = "";
			
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_EventCondition");
	            sb.append("(EventConditionId, EquipmentTemplateId, EventId, StartOperation, StartCompareValue, ");
	            sb.append("StartDelay, EndOperation, EndCompareValue, EndDelay, Frequency, ");
	            sb.append("FrequencyThreshold, Meanings, EquipmentState, BaseTypeId, EventSeverity, StandardName)");
	            sb.append("  VALUES (%d, %d, %d, '%s', %f, %d, '%s', %s, %s, %s, %s, '%s', %s, %s, %d, %s)");

	            String sql = sb.toString();
	            sql = String.format(sql, EventConditionId, EquipmentTemplateId, EventId, StartOperation, StartCompareValue,
	                    StartDelay, EndOperation, EndCompareValue == null ? "NULL" : EndCompareValue, EndDelay == null ? "NULL" : EndDelay, 
	                    		Frequency == null ? "NULL" : Frequency, FrequencyThreshold == null ? "NULL" : FrequencyThreshold, 
	                    		Meanings, EquipmentState == null ? "NULL" : EquipmentState, BaseTypeId == null ? "NULL" : BaseTypeId, 
	                    		EventSeverity, StandardName == null ? "NULL" : StandardName);
	            
	            dbHelper.executeNoQuery(sql);
	            System.out.println(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertEventCondition() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}

	public ArrayList<EventCondition> GetEventConditionById(int equipmentTemplateId){
		DatabaseHelper dbHelper = null;
		ArrayList<EventCondition> list = new ArrayList<EventCondition>();
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT * FROM TBL_EventCondition WHERE EquipmentTemplateId=%s;",equipmentTemplateId));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	            
	            list = EventCondition.fromDataTable(dt);
			} catch (Exception e) {
				log.error("fail to get Commmunication event", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return list;
	}
}
