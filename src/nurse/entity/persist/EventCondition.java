package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EventCondition {

	public EventCondition() {
	}

	public int EquipmentTemplateId;
	public int EventId;
	public int EventConditionId;
	public int StartDelay;
	public Integer EndDelay;
	public Integer Frequency;
	public Integer FrequencyThreshold;
	public Short EquipmentState;
	public Integer BaseTypeId;
	public int EventSeverity;
	public Integer StandardName;
	
	public Float StartCompareValue;
	public Float EndCompareValue;
	
	public String StartOperation;
	public String EndOperation;
	public String Meanings;

	public int getEventConditionId() {
		return EventConditionId;
	}

	public void setEventConditionId(int EventConditionId) {
		this.EventConditionId = EventConditionId;
	}	
	
	public static ArrayList<EventCondition> fromDataTable(DataTable dt) {
		ArrayList<EventCondition> ds = new ArrayList<EventCondition>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EventCondition d = new EventCondition();
			
			d.EquipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			d.EventId = (int) drs.get(i).getValue("EventId");
			d.EventConditionId = (int)drs.get(i).getValue("EventConditionId");
			d.StartDelay = (int)drs.get(i).getValue("StartDelay");
			d.EndDelay = (Integer)drs.get(i).getValue("EndDelay");
			d.Frequency = (Integer)drs.get(i).getValue("Frequency");
			d.FrequencyThreshold = (Integer)drs.get(i).getValue("FrequencyThreshold");
			d.EquipmentState = parseShort(drs.get(i).getValue("EquipmentState"));
			d.BaseTypeId = parseInteger(drs.get(i).getValueAsString("BaseTypeId"));
			d.EventSeverity = (int)drs.get(i).getValue("EventSeverity");
			d.StandardName = (Integer)drs.get(i).getValue("StandardName");
 
			d.StartCompareValue	= (Float)drs.get(i).getValue("StartCompareValue");
			d.EndCompareValue = (Float)drs.get(i).getValue("EndCompareValue");
 
			d.StartOperation = (String)drs.get(i).getValue("StartOperation");
			d.EndOperation = (String)drs.get(i).getValue("EndOperation");
			d.Meanings = (String)drs.get(i).getValue("Meanings");
			
			ds.add(d);
		}		
		return ds;
	}
	
	private static Short parseShort(Object obj){
		try {
			return (Short)obj;
		} catch (Exception e) {
			return null;
		}
	}
	private static Integer parseInteger(String obj){
		try {
			return Integer.parseInt(obj);
		} catch (Exception e) {
			return null;
		}
	}
}
