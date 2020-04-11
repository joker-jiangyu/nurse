package nurse.entity.persist;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.JsonHelper;

public class Card {
	public int cardId;
	public String cardCode;
	public String cardName;
	public int cardCategory;
	public int cardGroup;
	public int userId;
	public String userName;
	public int stationId;
	public int cardStatus;
	public String startTime;
	public String endTime;
	public String registerTime;
	public String unRegisterTime;
	public String lostTime;
	public String description;
	
	public String cardCategoryName;
	public String cardGroupName;
	public String cardStatusName;

	public int timeGroup;
	public String doorIds;

	public int cardType;
	public String doorCards;
	
	public static ArrayList<Card> fromDataTable(DataTable dt) {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); 
		ArrayList<Card> cs = new ArrayList<Card>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Card c = new Card();
			
			c.cardId = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardId"));
			c.cardCode = drs.get(i).getValueAsString("CardCode");
			c.cardName = drs.get(i).getValueAsString("CardName");
			c.cardCategory = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardCategory"));
			c.cardGroup = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardGroup"));
			c.userId = CabinetDeviceMap.parseInt(drs.get(i).getValue("UserId"));
			c.userName = drs.get(i).getValueAsString("EmployeeName");
			c.stationId = CabinetDeviceMap.parseInt(drs.get(i).getValue("StationId"));
			c.cardStatus = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardStatus"));

			c.startTime = drs.get(i).getValueAsString("StartTime");
			try {
				c.endTime = format.format(format.parse(drs.get(i).getValueAsString("EndTime")));
				c.registerTime = format.format(format.parse(drs.get(i).getValueAsString("RegisterTime")));
			} catch (ParseException e) {
				c.endTime = "";
				c.registerTime = "";
			}
			c.unRegisterTime = drs.get(i).getValueAsString("UnRegisterTime");
			c.lostTime = drs.get(i).getValueAsString("LostTime");
			
			c.description = drs.get(i).getValueAsString("Description");
			
			c.cardCategoryName = drs.get(i).getValueAsString("CardCategoryName");
			c.cardGroupName = drs.get(i).getValueAsString("CardGroupName");
			c.cardStatusName = drs.get(i).getValueAsString("CardStatusName");

			c.cardType = Integer.parseInt(drs.get(i).getValueAsString("CardType"));
			
			cs.add(c);
		}
		return cs;
	}
	public static ArrayList<Card> fromDataTable(DataTable dt,DataTable dts) {
		ArrayList<Card> cs = new ArrayList<Card>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		Card c = new Card();
		for(int i=0;i<rowCount;i++)
		{
			c.cardId = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardId"));
			c.cardCode = drs.get(i).getValueAsString("CardCode");
			c.cardType = Integer.parseInt(drs.get(i).getValueAsString("CardType"));
			c.cardName = drs.get(i).getValueAsString("CardName");
			c.cardCategory = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardCategory"));
			c.cardGroup = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardGroup"));
			c.userId = CabinetDeviceMap.parseInt(drs.get(i).getValue("UserId"));
			c.userName = drs.get(i).getValueAsString("EmployeeName");
			c.stationId = CabinetDeviceMap.parseInt(drs.get(i).getValue("StationId"));
			c.cardStatus = CabinetDeviceMap.parseInt(drs.get(i).getValue("CardStatus"));
			c.startTime = drs.get(i).getValueAsString("StartTime");
			c.endTime = drs.get(i).getValueAsString("EndTime");
			c.registerTime = drs.get(i).getValueAsString("RegisterTime");
			c.unRegisterTime = drs.get(i).getValueAsString("UnRegisterTime");
			c.lostTime = drs.get(i).getValueAsString("LostTime");
			c.description = drs.get(i).getValueAsString("Description");
			
			c.cardCategoryName = drs.get(i).getValueAsString("CardCategoryName");
			c.cardGroupName = drs.get(i).getValueAsString("CardGroupName");
			c.cardStatusName = drs.get(i).getValueAsString("CardStatusName");
		}
		
		ArrayList<DoorCard> doorCards = DoorCard.fromDataTable(dts);
		c.doorCards = JsonHelper.ListjsonArray(doorCards).toString();
		
		/*DataRowCollection drss = dts.getRows();
		int rowCounts = dts.getRowCount();
		
		String dis = "";
		for(int i=0;i<rowCounts;i++)
		{
			c.timeGroup = CabinetDeviceMap.parseInt(drss.get(i).getValue("TimeGroupId"));
			if(i>0) dis += "|";
			dis += drss.get(i).getValueAsString("DoorId");
		}
		c.doorIds = dis; */

		cs.add(c);
		return cs;
	}
}
