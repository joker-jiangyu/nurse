package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Event {

	public Event() {
	}

	public int EquipmentTemplateId;
	public int EventId;
	public int StartType;
	public int EndType;
	public int EventCategory;
	public Integer SignalId;
	public Integer DisplayIndex;
	public int ModuleNo;
	
	public boolean Enable;
	public boolean Visible;
	
	public String EventName;
	public String StartExpression;
	public String SuppressExpression;
	public String Description;

	
	public int getEventId() {
		return EventId;
	}

	public void setEventId(int EventId) {
		this.EventId = EventId;
	}	
	
	public static ArrayList<Event> fromDataTable(DataTable dt) {
		ArrayList<Event> ds = new ArrayList<Event>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Event d = new Event();
			
			d.EquipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			d.EventId = (int) drs.get(i).getValue("EventId");
			d.StartType = (int) drs.get(i).getValue("StartType");
			d.EndType = (int) drs.get(i).getValue("EndType");
			d.EventCategory = (int) drs.get(i).getValue("EventCategory");
			d.SignalId = (Integer) drs.get(i).getValue("SignalId");
			d.DisplayIndex = (int) drs.get(i).getValue("DisplayIndex");
			d.ModuleNo = (int) drs.get(i).getValue("ModuleNo");
			d.Enable = (boolean) drs.get(i).getValue("Enable");
			d.Visible = (boolean) drs.get(i).getValue("Visible");
			d.Description = (String) drs.get(i).getValue("Description");
			d.EventName = (String) drs.get(i).getValue("EventName");
			d.StartExpression = (String) drs.get(i).getValue("StartExpression");
			d.SuppressExpression = (String) drs.get(i).getValue("SuppressExpression");
			
			ds.add(d);
		}		
		return ds;
	}
}
