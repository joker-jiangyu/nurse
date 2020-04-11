package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class TimeGroupSpan {
	public int timeSpanId;
	public int timeGroupId;
	public int week;
	public String timeSpanChar;
	public String lastUpdateDate;
	
	public static ArrayList<TimeGroupSpan> fromDataTable(DataTable dt) {
		ArrayList<TimeGroupSpan> list = new ArrayList<TimeGroupSpan>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++){
			TimeGroupSpan tgs = new TimeGroupSpan();
			
			tgs.timeSpanId = CabinetDeviceMap.parseInt(drs.get(i).getValue("TimeSpanId")); 
			tgs.timeGroupId = CabinetDeviceMap.parseInt(drs.get(i).getValue("TimeGroupId")); 
			tgs.week = CabinetDeviceMap.parseInt(drs.get(i).getValue("Week")); 
			tgs.timeSpanChar = drs.get(i).getValueAsString("TimeSpanChar");
			tgs.lastUpdateDate = drs.get(i).getValueAsString("LastUpdateDate");
			
			list.add(tgs);
		}
		return list;
	}
}
