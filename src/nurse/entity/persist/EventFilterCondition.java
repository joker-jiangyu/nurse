package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EventFilterCondition {

	public EventFilterCondition() {
	}

	public int EventFilterId;
	public int EventFilterConditionId;
	public String EventFilterCombination;
	public Integer EventFilterSegment1;
	public Integer EventFilterSegment2;
	public Integer EventFilterSegment3;
	public Integer EventFilterSegment4;
	public Integer EventFilterSegment5;
	public Integer EventFilterSegment6;
	public Integer EventFilterSegment7;
	public Integer EventFilterSegment8;
	public Integer EventFilterSegment9;
	public Integer EventFilterSegment10;
	public Integer EventFilterSegment11;
	public Integer EventFilterDelay;
	public Integer EventFilterCount;
	public String Description;
	public Date LastUpdateDate;

	public static ArrayList<EventFilterCondition> fromDataTable(DataTable dt) {
		ArrayList<EventFilterCondition> ds = new ArrayList<EventFilterCondition>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EventFilterCondition d = new EventFilterCondition();
			
			d.EventFilterId = (int) drs.get(i).getValue("EventFilterId");
			d.EventFilterConditionId = (int) drs.get(i).getValue("EventFilterConditionId");
			d.EventFilterCombination = (String) drs.get(i).getValue("EventFilterCombination");
			d.EventFilterSegment1 = (Integer) drs.get(i).getValue("EventFilterSegment1");
			d.EventFilterSegment2 = (Integer) drs.get(i).getValue("EventFilterSegment2");
			d.EventFilterSegment3 = (Integer) drs.get(i).getValue("EventFilterSegment3");
			d.EventFilterSegment4 = (Integer) drs.get(i).getValue("EventFilterSegment4");
			d.EventFilterSegment5 = (Integer) drs.get(i).getValue("EventFilterSegment5");
			d.EventFilterSegment6 = (Integer) drs.get(i).getValue("EventFilterSegment6");
			d.EventFilterSegment7 = (Integer) drs.get(i).getValue("EventFilterSegment7");
			d.EventFilterSegment8 = (Integer) drs.get(i).getValue("EventFilterSegment8");
			d.EventFilterSegment9 = (Integer) drs.get(i).getValue("EventFilterSegment9");
			d.EventFilterSegment10 = (Integer) drs.get(i).getValue("EventFilterSegment10");
			d.EventFilterSegment11 = (Integer) drs.get(i).getValue("EventFilterSegment11");
			d.Description = (String) drs.get(i).getValue("Description");
			d.LastUpdateDate = (Date) drs.get(i).getValue("LastUpdateDate");
			
			ds.add(d);
		}		
		return ds;
	}
}