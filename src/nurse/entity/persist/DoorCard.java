package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class DoorCard {
	public int doorId;
	public String doorName;
	public int doorNo;
	public String timeGroupId;
	public String timeGroupName;
	public String timeGroupType;
	public int cardId;
	public String cardCode;
	public String cardName;
	public String employeeName;
	public String startTime;
	public String endTime;
	public String password;
	
	public static ArrayList<DoorCard> fromDataTable(DataTable dt) {
		ArrayList<DoorCard> list = new ArrayList<DoorCard>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++){
			DoorCard dc = new DoorCard();
			
			dc.doorId = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorId"));
			dc.doorName = drs.get(i).getValueAsString("DoorName");
			dc.doorNo = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorNo"));
			dc.timeGroupId = drs.get(i).getValueAsString("TimeGroupId");
			dc.timeGroupName = drs.get(i).getValueAsString("TimeGroupName");
			dc.timeGroupType = drs.get(i).getValueAsString("TimeGroupType");
			dc.cardId = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardId"));
			dc.cardCode = drs.get(i).getValueAsString("CardCode");
			dc.cardName = drs.get(i).getValueAsString("CardName");
			dc.employeeName = drs.get(i).getValueAsString("EmployeeName");
			dc.startTime = drs.get(i).getValueAsString("StartTime");
			dc.endTime = drs.get(i).getValueAsString("EndTime");
			dc.password = drs.get(i).getValueAsString("Password");
			
			list.add(dc);
		}
		return list;
	}
}
