package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EventNotifyRule {

	public EventNotifyRule() {
	}

	public int NotifyID;
	public String Description;
	public int NotifyMode;
	public String Receiver;
	public String NotifyEventType;
	public String NotifyEventLevel;
	public String NotifyEquipID;
	
	public static ArrayList<EventNotifyRule> fromDataTable(DataTable dt) {
		ArrayList<EventNotifyRule> ds = new ArrayList<EventNotifyRule>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EventNotifyRule d = new EventNotifyRule();
			
			d.NotifyID = (int) drs.get(i).getValue("NotifyID");
			d.Description = (String) drs.get(i).getValue("Description");
			d.NotifyMode = (Integer) drs.get(i).getValue("NotifyMode");
			d.Receiver = (String) drs.get(i).getValue("Receiver");
			d.NotifyEventType = (String) drs.get(i).getValue("NotifyEventType");
			d.NotifyEventLevel = (String) drs.get(i).getValue("NotifyEventLevel");
			d.NotifyEquipID = (String) drs.get(i).getValue("NotifyEquipID");
			
			ds.add(d);
		}		
		return ds;
	}
}