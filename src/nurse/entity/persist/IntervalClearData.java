package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class IntervalClearData {
	public int id;
	public String name;
	public String clearObject;
	public long delay;
	public long period;
	public int storageDays;
	public String storageCols;
	public int status;
	
	public static ArrayList<IntervalClearData> fromDataTable(DataTable dt) {
		ArrayList<IntervalClearData> icds = new ArrayList<IntervalClearData>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			IntervalClearData icd = new IntervalClearData();
			
			icd.id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
			icd.name = drs.get(i).getValueAsString("Name");
			icd.clearObject = drs.get(i).getValueAsString("ClearObject");
			icd.delay = Long.parseLong(drs.get(i).getValueAsString("Delay"));
			icd.period = Long.parseLong(drs.get(i).getValueAsString("Period"));
			icd.storageDays = Integer.parseInt(drs.get(i).getValueAsString("StorageDays"));
			icd.storageCols = drs.get(i).getValueAsString("StorageCols");
			icd.status = Integer.parseInt(drs.get(i).getValueAsString("Status"));
			
			icds.add(icd);
		}
		return icds;
	}
}
