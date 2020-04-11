package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class CardRecode {
	public Integer StationId;
	public String StationName;
	public Integer EquipmentId;
	public String EquipmentName;
	public Integer CardStationId;	
	public String CardStationName;
	public Integer CardId;
	public String CardCode;
	public String CardName;
	public Integer CardUserId;
	public String CardUserName;
	public Integer CardCategory;
	public String CardCategoryName;
	public Integer CardGroup;
	public String CardGroupName;
	public Integer CardStatus;
	public String CardStatusName;  
	public Integer DoorId ;
	public Integer DoorNo ;
	public String DoorName;
	public Integer DoorCategory;
	public String DoorCategoryName;
	public Integer Valid;
	public String ValidName;
	public String ItemAlias;
	public String  Enter;
	public String RecordTime;
	 
	public static ArrayList<CardRecode> GetListFromDataTable(DataTable dt)
	{
		ArrayList<CardRecode> Cards = new ArrayList<CardRecode>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			CardRecode aa = new CardRecode();
 	        aa.StationId = drs.get(i).getValueAsString("StationId")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("StationId"));
			aa.StationName =(String) drs.get(i).getValue("StationName");
			aa.EquipmentId = drs.get(i).getValueAsString("EquipmentId")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
		    aa.EquipmentName =  (String) drs.get(i).getValue("EquipmentName");
			aa.CardStationId = drs.get(i).getValueAsString("CardStationId")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("CardStationId"));
			aa.CardStationName =  (String) drs.get(i).getValue("CardStationName");
			aa.CardId = drs.get(i).getValueAsString("CardId")==null ? null : Integer.parseInt(drs.get(i).getValueAsString("CardId"));
			aa.CardCode = (String) drs.get(i).getValue("CardCode");
			aa.CardName = (String) drs.get(i).getValue("CardName");
			aa.CardUserId = drs.get(i).getValueAsString("CardUserId")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("CardUserId"));
			aa.CardUserName = (String) drs.get(i).getValue("EmployeeName");
			aa.CardCategory = drs.get(i).getValueAsString("CardCategory")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("CardCategory"));
			aa.CardCategoryName =  (String) drs.get(i).getValue("CardCategoryName");
			aa.CardGroup = drs.get(i).getValueAsString("CardGroup")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("CardGroup"));
			aa.CardGroupName = (String) drs.get(i).getValue("CardGroupName");
			aa.CardStatus = drs.get(i).getValueAsString("CardStatus")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("CardStatus"));
			aa.CardStatusName = (String) drs.get(i).getValue("CardStatusName");
			aa.DoorId = drs.get(i).getValueAsString("DoorId")==null ? null :Integer.parseInt(drs.get(i).getValueAsString("DoorId"));
			aa.DoorNo = drs.get(i).getValueAsString("DoorNo")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("DoorNo"));
			aa.DoorName =(String) drs.get(i).getValue("DoorName");
			aa.DoorCategory=  drs.get(i).getValueAsString("DoorCategory")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("DoorCategory"));
			aa.DoorCategoryName = (String) drs.get(i).getValue("DoorCategoryName");
			aa.Valid = drs.get(i).getValueAsString("Valid")==null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("Valid"));
			aa.ValidName =(String) drs.get(i).getValue("ItemValue");
			aa.ItemAlias = (String) drs.get(i).getValue("ItemAlias");
			aa.Enter = String.valueOf(drs.get(i).getValue("Enter"));
			aa.RecordTime = drs.get(i).getValueAsString("RecordTime").replace(".0", "");
			Cards.add(aa);
		}
		return Cards;
	}

}
