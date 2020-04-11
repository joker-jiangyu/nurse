package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class NotifyReceiver {

	public NotifyReceiver() {
	}

	public Integer EventFilterId;
	public int NotifyReceiverId;
	public int NotifyReceiverCategory;
	public String NotifyReceiverName;
	public String NotifyAddress;
	public String NotifyContent;
	public String Description;
	public Date LastUpdateDate;

	public static ArrayList<NotifyReceiver> fromDataTable(DataTable dt) {
		ArrayList<NotifyReceiver> ds = new ArrayList<NotifyReceiver>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			NotifyReceiver d = new NotifyReceiver();
			
			d.EventFilterId = (Integer) drs.get(i).getValue("EventFilterId");
			d.NotifyReceiverId = (int) drs.get(i).getValue("NotifyReceiverId");
			d.NotifyReceiverName = (String) drs.get(i).getValue("NotifyReceiverName");
			d.NotifyAddress = (String) drs.get(i).getValue("NotifyAddress");
			
			ds.add(d);
		}		
		return ds;
	}
}
