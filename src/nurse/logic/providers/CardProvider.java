package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.Card;
import nurse.entity.persist.DataItem;
import nurse.entity.persist.DoorCard;
import nurse.entity.persist.Employee;
import nurse.utility.DatabaseHelper;
import nurse.utility.JsonHelper;

public class CardProvider {
	private static CardProvider instance = new CardProvider();
	private static Logger log = Logger.getLogger(CardProvider.class);
	private static int cEquipmentId = 100000001;

	public static CardProvider getInstance(){
		return instance;
	}
	
	public ArrayList<Card> getCardList(String cardGroup,String cardCategory,String cardStatus,
			String userName,String cardName,String cardCode){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	CardId,CardCode,CardName,CardCategory,CardGroup,UserId,EmployeeName,");
            sb.append("	StationId,CardStatus,StartTime,EndTime,RegisterTime,UnRegisterTime,A.Description ");
            sb.append("FROM TBL_Card A,TBL_Employee B ");
            sb.append("WHERE A.UserId = B.EmployeeId AND CardGroup LIKE '%");
            sb.append(String.format("%s", cardGroup));
            sb.append("%' AND CardCategory LIKE '%");
            sb.append(String.format("%s", cardCategory));
            sb.append("%' AND CardStatus LIKE '%");
            sb.append(String.format("%s", cardStatus));
            sb.append("%' AND EmployeeName LIKE '%");
            sb.append(String.format("%s", userName));
            sb.append("%' AND CardName LIKE '%");
            sb.append(String.format("%s", cardName));
            sb.append("%' AND CardCode LIKE '%");
            sb.append(String.format("%s", cardCode));
            sb.append("%';");
            dt = dbHelper.executeToTable(sb.toString());
            
            return Card.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String getCardDataItem(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "SELECT * FROM TBL_DataItem WHERE EntryId = 47;";
            dt = dbHelper.executeToTable(sql);
            ArrayList<DataItem> cardCategory = DataItem.fromDataTable(dt);
            
            sql = "SELECT * FROM TBL_DataItem WHERE EntryId = 200;";
            dt = dbHelper.executeToTable(sql);
            ArrayList<DataItem> cardTypes = DataItem.fromDataTable(dt);

            sql = "SELECT * FROM TBL_Employee;";
            dt = dbHelper.executeToTable(sql);
            ArrayList<Employee> empList = Employee.fromDataTable(dt);

            sql = "SELECT * FROM TBL_DoorCard;";
            dt = dbHelper.executeToTable(sql);
            ArrayList<DoorCard> doorCards = DoorCard.fromDataTable(dt);
            
            StringBuffer sb = new StringBuffer();
            sb.append("{");
            sb.append(String.format("\"CardCategory\":%s", JsonHelper.ListjsonArray(cardCategory).toString()));
            sb.append(String.format(",\"CardType\":%s", JsonHelper.ListjsonArray(cardTypes).toString()));
            sb.append(String.format(",\"Users\":%s", JsonHelper.ListjsonArray(empList).toString()));
            sb.append(String.format(",\"DoorCard\":%s", JsonHelper.ListjsonArray(doorCards).toString()));
            sb.append("}");
            
            return sb.toString();
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public int insertCard(String cardCode,String cardName,String cardCategory,String cardGroup,
			String userId,String cardStatus,String endTime,String desciption){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT StationId FROM tbl_station;";
			dt = dbHelper.executeToTable(sql);
			int cardId = getMaxCardId();
			if(dt.getRows()!=null && dt.getRows().get(0)!=null){
				String stationId = dt.getRows().get(0).getValueAsString("StationId");
				
				sql = String.format("INSERT INTO TBL_Card VALUES (%s,'%s','%s',%s,%s,%s,%s,%s,SYSDATE(),'%s',SYSDATE(),NULL,NULL,'%s');",
						cardId,cardCode,cardName,cardCategory,cardGroup,userId,stationId,
						cardStatus,endTime,desciption);
				dbHelper.executeNoQuery(sql);
			}
			return cardId;
		} catch (Exception e) {
			log.error("insertDoor failed.", e);
			return -1;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	private int getMaxCardId(){
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            String sql = "select MAX(CardId) from tbl_card;";
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = cEquipmentId;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					cEquipmentId = ++iMaxId;
				}

			} catch (Exception e) {
				log.error("getMaxEquipmentId failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
	}
	
	public ArrayList<Card> getCardByCardId(String cardId){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		DataTable dts = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	CardId,CardCode,CardType,CardName,CardCategory,CardGroup,UserId,EmployeeName,");
            sb.append("	StationId,CardStatus,StartTime,EndTime,RegisterTime,UnRegisterTime,A.Description ");
            sb.append("FROM TBL_Card A ");
            sb.append("LEFT JOIN TBL_Employee B ON A.UserId = B.EmployeeId ");
            sb.append(String.format("WHERE CardId = %s;", cardId));
            dt = dbHelper.executeToTable(sb.toString());
            
            String sql = String.format("SELECT TimeGroupId,DoorId,`Password` FROM TBL_DoorCard WHERE CardId = %s;", cardId);
            dts = dbHelper.executeToTable(sql);
            
            return Card.fromDataTable(dt,dts);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean checkoutCardCode(String cardCode){
    	DatabaseHelper dbHelper = null;
		Object res = null;
    	try {
    		dbHelper = new DatabaseHelper();
    		StringBuffer sb = new StringBuffer();
    		sb.append("SELECT COUNT(1) FROM TBL_Card WHERE CardCode = '%s';");
			String sql = String.format(sb.toString(),cardCode);
			res = dbHelper.executeScalar(sql);
			
			if(Integer.parseInt(res.toString())>0)
				return true;
			else 
				return false;
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return false;
	}
	
	public boolean updateCard(String cardId,String cardType,String cardName,String cardCategory,
			String userId,String cardStatus,String endTime,String desciption){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("UPDATE TBL_Card ");
			sb.append("SET CardType = %s,CardName = '%s',CardCategory = %s,UserId = %s,CardStatus = %s,EndTime = '%s' ");
			if(cardStatus.equals("3"))
				sb.append(" ,UnRegisterTime = SYSDATE() ");
			sb.append(" ,LostTime = SYSDATE(),Description = '%s' WHERE CardId = %s;");
			String sql = String.format(sb.toString(),cardType,cardName,cardCategory,userId,cardStatus,endTime,desciption,cardId);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean updateCard(String cardId,String userId,String endTime){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("UPDATE TBL_Card ");
			if(userId != null)
				sb.append(String.format("SET UserId = %s,EndTime = '%s',LostTime = SYSDATE() WHERE CardId = %s;", userId,endTime,cardId));
			else
				sb.append(String.format("SET EndTime = '%s',LostTime = SYSDATE() WHERE CardId = %s;", endTime,cardId));
			dbHelper.executeNoQuery(sb.toString());
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean deleteCard(String cardId){
    	DatabaseHelper dbHelper = null;
    	try {
    		dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM TBL_Card WHERE CardId = %s;", cardId);
			dbHelper.executeNoQuery(sql);

			sql = String.format("DELETE FROM TBL_DoorCard WHERE CardId = %s;", cardId);
			dbHelper.executeNoQuery(sql);
			
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return false;
	}
	
	public ArrayList<Card> getLimitCard(int index,int size,String cardCategory,String cardName,String cardType){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Card ");
            sb.append(String.format("WHERE CardCategory LIKE '%s' ", cardCategory));
            sb.append("AND CardName LIKE '%");
            sb.append(String.format("%s", cardName));
            sb.append("%' AND CardType LIKE ");
            sb.append(String.format("'%s' ", cardType));
            sb.append(" ORDER BY CardId ");
            sb.append(String.format("LIMIT %s,%s;", index,size));
            dt = dbHelper.executeToTable(sb.toString());

            return Card.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read limit equipment", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public int getCardNums(String cardCategory,String cardName,String cardType){		
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT ");
            sb.append("	COUNT(*) FROM TBL_Card ");
            sb.append(String.format("WHERE CardCategory LIKE '%s' ", cardCategory));
            sb.append("AND CardName LIKE '%");
            sb.append(String.format("%s", cardName));
            sb.append("%' AND CardType LIKE ");
            sb.append(String.format("'%s';", cardType));
            String sql = sb.toString();
            
            res = dbHelper.executeScalar(sql);
            if(res == null)
			{
            	iNums = 0;
			}
			else
			{
				iNums = Integer.parseInt(res.toString());
			}
		} catch (Exception e) {
			log.error("GetEquipmentNums() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return iNums;
	}
	
	public ArrayList<DoorCard> getDoorIdAndCardCodeByCardId(String cardId){
		ArrayList<DoorCard> doorCards = null;
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            doorCards = new ArrayList<DoorCard>();
            String sql = String.format("SELECT CardCode FROM TBL_Card WHERE CardId = %s;", cardId);
            dt = dbHelper.executeToTable(sql);
            String cardCode = dt.getRows().get(0).getValueAsString("CardCode");
            
            
            sql = String.format("SELECT DoorId FROM TBL_DoorCard WHERE CardId = %s;", cardId);
            dt = dbHelper.executeToTable(sql);
            for(int i = 0;i < dt.getRowCount();i++){
            	DoorCard dc = new DoorCard();
            	dc.doorId = CabinetDeviceMap.parseInt(dt.getRows().get(i).getValueAsString("DoorId"));
            	dc.cardCode = cardCode;
            	doorCards.add(dc);
            }
            
            return doorCards;
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public int insertCard(String cardCode,String cardName,int cardCategory,String cardGroup,
			String userId,String cardStatus,String endTime,String desciption,int cardType){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT StationId FROM tbl_station;";
			dt = dbHelper.executeToTable(sql);
			int cardId = getMaxCardId();
			if(dt.getRows()!=null && dt.getRows().get(0)!=null){
				String stationId = dt.getRows().get(0).getValueAsString("StationId");
				
				sql = String.format("INSERT INTO TBL_Card VALUES (%s,'%s','%s',%s,%s,%s,%s,%s,%s,SYSDATE(),'%s',SYSDATE(),NULL,NULL,'%s');",
						cardId,cardCode,cardName,cardCategory,cardGroup,cardType,
						userId,stationId,cardStatus,endTime,desciption);
				dbHelper.executeNoQuery(sql);
			}
			return cardId;
		} catch (Exception e) {
			log.error("insertDoor failed.", e);
			return -1;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/** 修改TBL_Card表非控制的数据 */
	public boolean UpdateCardNotActionData(String cardName, int cardCategory, int cardGroup, int cardType,
			int cardStatus, String description, int cardId){
		DatabaseHelper dbHelper = null;
    	try {
    		dbHelper = new DatabaseHelper();
			String sql = String.format("UPDATE TBL_Card SET CardName = '%s',CardCategory = %s,CardGroup = %s,CardType = %s,CardStatus = %s,Description = '%s' WHERE CardId = %s;",
					cardName,cardCategory,cardGroup,cardType,cardStatus,description,cardId);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return false;
	}
}
