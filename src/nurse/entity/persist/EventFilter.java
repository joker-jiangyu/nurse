package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EventFilter {

	public EventFilter() {
	}

	public int EventFilterId;
	public String EventFilterName;
	public String Description;
	public Date LastUpdateDate;
	
	public int getEventFilterId() {
		return EventFilterId;
	}

	public void setEventFilterId(int EventFilterId) {
		this.EventFilterId = EventFilterId;
	}	
	
	public static ArrayList<EventFilter> fromDataTable(DataTable dt) {
		ArrayList<EventFilter> ds = new ArrayList<EventFilter>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EventFilter d = new EventFilter();
			
			d.EventFilterId = (int) drs.get(i).getValue("EventFilterId");
			d.EventFilterName = (String) drs.get(i).getValue("EventFilterName");
			d.Description = (String) drs.get(i).getValue("Description");
			d.LastUpdateDate = (Date) drs.get(i).getValue("LastUpdateDate");
			
			ds.add(d);
		}		
		return ds;
	}
}
