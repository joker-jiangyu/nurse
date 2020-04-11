package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.JsonHelper;

public class TimeGroup {
	public int timeGroupId;
	public String timeGroupCategory;
	public String timeGroupName;
	public String timeGroupType;
	public int timeGroupException;
	public String startTime;
	public String endTime;
	public String lastUpdateTime;
	
	public String timeGroupSpan; 

	public static ArrayList<TimeGroup> fromDataTable(DataTable dt) {
		ArrayList<TimeGroup> list = new ArrayList<TimeGroup>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++){
			TimeGroup tg = new TimeGroup();
			
			tg.timeGroupId = CabinetDeviceMap.parseInt(drs.get(i).getValue("TimeGroupId")); 
			tg.timeGroupCategory = drs.get(i).getValueAsString("TimeGroupCategory");
			tg.timeGroupName = drs.get(i).getValueAsString("TimeGroupName");
			tg.timeGroupType = drs.get(i).getValueAsString("TimeGroupType");
			tg.timeGroupException = CabinetDeviceMap.parseInt(drs.get(i).getValue("TimeGroupException"));
			tg.startTime = drs.get(i).getValueAsString("StartTime");
			tg.endTime = drs.get(i).getValueAsString("EndTime");
			tg.lastUpdateTime = drs.get(i).getValueAsString("lastUpdateTime");
			
			list.add(tg);
		}
		return list;
	}
	
	public static ArrayList<TimeGroup> fromDataTable(DataTable dt,ArrayList<TimeGroupSpan> lsit) {
		ArrayList<TimeGroup> list = new ArrayList<TimeGroup>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++){
			TimeGroup tg = new TimeGroup();
			
			tg.timeGroupId = CabinetDeviceMap.parseInt(drs.get(i).getValue("TimeGroupId")); 
			tg.timeGroupCategory = drs.get(i).getValueAsString("TimeGroupCategory");
			tg.timeGroupName = drs.get(i).getValueAsString("TimeGroupName");
			tg.timeGroupType = drs.get(i).getValueAsString("TimeGroupType");
			tg.timeGroupException = CabinetDeviceMap.parseInt(drs.get(i).getValue("TimeGroupException"));
			tg.startTime = drs.get(i).getValueAsString("StartTime");
			tg.endTime = drs.get(i).getValueAsString("EndTime");
			tg.lastUpdateTime = drs.get(i).getValueAsString("lastUpdateTime");
			
			tg.timeGroupSpan = getTimeGroupSpanListById(tg.timeGroupId,lsit);
			
			list.add(tg);
		}
		return list;
	}
	
	private static String getTimeGroupSpanListById(int timeGroupId,ArrayList<TimeGroupSpan> lsit){
		ArrayList<TimeGroupSpan> tgss = new ArrayList<TimeGroupSpan>();
		for(TimeGroupSpan tgs : lsit){
			if(tgs.timeGroupId == timeGroupId)
				tgss.add(tgs);
		}
		return JsonHelper.ListjsonArray(tgss).toString();
	}
}
