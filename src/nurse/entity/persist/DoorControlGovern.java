package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class DoorControlGovern {

	public int DoorControlId;
	public String DoorType;
	public String CardType;// ID|IC|指纹|人脸
	public int CardSystem;
	public int CardNumber;
	public String TimeGroupNo;
	public String RemoteOpenDoor;
	public String AccessControlReset;
	public String AddCard;
	public String DeleteCard;
	public String DeleteAllCard;
	public String ModifyCardSetting;
	public String AccessTimeSetting;
	public String DoorOpenOvertimeSetting;
	public String AccessControlTimingSetting;
	public String DoorEncryption;
	public String OtherControl1;
	public String OtherControl2;
	public String OtherControl3;
	
	public static ArrayList<DoorControlGovern> getTemperatures(DataTable dt){
		ArrayList<DoorControlGovern> temps = new ArrayList<DoorControlGovern>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			
			DoorControlGovern dcg = new DoorControlGovern();
			dcg.DoorControlId = Integer.parseInt(dataRow.getValueAsString("DoorControlId"));
			dcg.DoorType = dataRow.getValueAsString("DoorType");
			dcg.CardType = dataRow.getValueAsString("CardType");
			dcg.CardSystem = Integer.parseInt(dataRow.getValueAsString("CardSystem"));
			dcg.CardNumber = Integer.parseInt(dataRow.getValueAsString("CardNumber"));
			dcg.TimeGroupNo = dataRow.getValueAsString("TimeGroupNo");
			dcg.RemoteOpenDoor = dataRow.getValueAsString("RemoteOpenDoor");
			dcg.AccessControlReset = dataRow.getValueAsString("AccessControlReset");
			dcg.AddCard = dataRow.getValueAsString("AddCard");
			dcg.DeleteCard = dataRow.getValueAsString("DeleteCard");
			dcg.DeleteAllCard = dataRow.getValueAsString("DeleteAllCard");
			dcg.ModifyCardSetting = dataRow.getValueAsString("ModifyCardSetting");
			dcg.AccessTimeSetting = dataRow.getValueAsString("AccessTimeSetting");
			dcg.DoorOpenOvertimeSetting = dataRow.getValueAsString("DoorOpenOvertimeSetting");
			dcg.AccessControlTimingSetting = dataRow.getValueAsString("AccessControlTimingSetting");
			dcg.DoorEncryption = dataRow.getValueAsString("DoorEncryption");
			dcg.OtherControl1 = dataRow.getValueAsString("OtherControl1");
			dcg.OtherControl2 = dataRow.getValueAsString("OtherControl2");
			dcg.OtherControl3 = dataRow.getValueAsString("OtherControl3");
			
			temps.add(dcg);
		}
		return temps;
	}
	
	public static DoorControlGovern getTemperatures(DataRow dataRow){
			
		DoorControlGovern dcg = new DoorControlGovern();
		if(dataRow.getValue("DoorControlId") == null) return null;
		dcg.DoorControlId = Integer.parseInt(dataRow.getValueAsString("DoorControlId"));
		dcg.DoorType = dataRow.getValueAsString("DoorType");
		dcg.CardType = dataRow.getValueAsString("CardType");
		dcg.CardSystem = Integer.parseInt(dataRow.getValueAsString("CardSystem"));
		dcg.CardNumber = Integer.parseInt(dataRow.getValueAsString("CardNumber"));
		dcg.TimeGroupNo = dataRow.getValueAsString("TimeGroupNo");
		dcg.RemoteOpenDoor = dataRow.getValueAsString("RemoteOpenDoor");
		dcg.AccessControlReset = dataRow.getValueAsString("AccessControlReset");
		dcg.AddCard = dataRow.getValueAsString("AddCard");
		dcg.DeleteCard = dataRow.getValueAsString("DeleteCard");
		dcg.DeleteAllCard = dataRow.getValueAsString("DeleteAllCard");
		dcg.ModifyCardSetting = dataRow.getValueAsString("ModifyCardSetting");
		dcg.AccessTimeSetting = dataRow.getValueAsString("AccessTimeSetting");
		dcg.DoorOpenOvertimeSetting = dataRow.getValueAsString("DoorOpenOvertimeSetting");
		dcg.AccessControlTimingSetting = dataRow.getValueAsString("AccessControlTimingSetting");
		dcg.DoorEncryption = dataRow.getValueAsString("DoorEncryption");
		dcg.OtherControl1 = dataRow.getValueAsString("OtherControl1");
		dcg.OtherControl2 = dataRow.getValueAsString("OtherControl2");
		dcg.OtherControl3 = dataRow.getValueAsString("OtherControl3");

		return dcg;
	}
}
