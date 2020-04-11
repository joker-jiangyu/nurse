package nurse.logic.providers;

 
 
import java.util.ArrayList;
import java.util.Date;

import org.apache.log4j.Logger;
import nurse.common.DataTable;
import nurse.entity.persist.CardRecode;
import nurse.utility.DatabaseHelper;

public class CardRecordProvider {
	private static CardRecordProvider instance = new CardRecordProvider();
	private static Logger log = Logger.getLogger(CardRecordProvider.class);
	
	public CardRecordProvider() {
	}
	

	
	public static CardRecordProvider getInstance(){
		return instance;
	}

	public ArrayList<CardRecode> getHisCardByTimeSpan(String startTime, String endTime)
	{
		ArrayList<CardRecode> res = new ArrayList<CardRecode>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			 StringBuilder sb= new StringBuilder();
	         sb.append("SELECT B.DoorNo,B.DoorName,A.CardCode,C.CardName,D.EmployeeName,A.RecordTime,E.ItemValue,E.ItemAlias ");
	         sb.append("FROM TBL_SwapCardRecord A ");
	         sb.append("LEFT JOIN TBL_Door B ON A.EquipmentId = B.EquipmentId AND A.DoorNo = B.DoorNo ");
	         sb.append("LEFT JOIN TBL_Card C ON A.CardCode = C.CardCode ");
	         sb.append("LEFT JOIN TBL_Employee D ON C.UserId = D.EmployeeId ");
	         sb.append("LEFT JOIN TBL_DataItem E ON E.EntryId = 49 AND E.ItemId = A.Valid ");
	         sb.append("WHERE A.RecordTime >= CONCAT('%s',' 00:00:00') AND A.RecordTime <= CONCAT('%s',' 23:59:59') ");
	         sb.append(" ORDER BY A.RecordTime DESC  LIMIT 3000;");
	         DataTable dt = dbHelper.executeToTable(String.format(sb.toString(), startTime,endTime));   
	         return CardRecode.GetListFromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all his cards", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		return res;
	}
	
	public ArrayList<CardRecode> likeHisCards(int index,int size,String startTime,String endTime,
			String doorNo,String doorName,String cardCode,String cardName,String employeeName,
			String itemValue,String itemAlias){
		ArrayList<CardRecode> res = new ArrayList<CardRecode>();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String result = " ";
			result = resultCond(result,"B.DoorNo",doorNo);
			result = resultCond(result,"B.DoorName",doorName);
			result = resultCond(result,"A.CardCode",cardCode);
			result = resultCond(result,"C.CardName",cardName);
			result = resultCond(result,"D.EmployeeName",employeeName);
			result = resultCond(result,"E.ItemValue",itemValue);
			result = resultCond(result,"E.ItemAlias",itemAlias);
			
			 StringBuilder sb= new StringBuilder();
			 sb.append("SELECT A.* FROM (");
	         sb.append("	SELECT B.DoorNo,B.DoorName,A.CardCode,C.CardName,D.EmployeeName,A.RecordTime,E.ItemValue,E.ItemAlias ");
	         sb.append("	FROM TBL_SwapCardRecord A ");
	         sb.append("	LEFT JOIN TBL_Door B ON A.EquipmentId = B.EquipmentId AND A.DoorNo = B.DoorNo ");
	         sb.append("	LEFT JOIN TBL_Card C ON A.CardCode = C.CardCode ");
	         sb.append("	LEFT JOIN TBL_Employee D ON C.UserId = D.EmployeeId ");
	         sb.append("	LEFT JOIN TBL_DataItem E ON E.EntryId = 49 AND E.ItemId = A.Valid ");
	         sb.append(String.format("	WHERE A.RecordTime >= CONCAT('%s',' 00:00:00') AND A.RecordTime <= CONCAT('%s',' 23:59:59') ", startTime,endTime));
	         sb.append(String.format("	%s ", result));
	         sb.append(" 	ORDER BY A.RecordTime DESC  LIMIT 3000 ");
	         sb.append(String.format(") A LIMIT %s,%s;", index,size));

	         DataTable dt = dbHelper.executeToTable(sb.toString());
	         //System.out.println("1:"+sb.toString());
	         return CardRecode.GetListFromDataTable(dt);
		} catch (Exception e) {
			log.error("likeHisCards Exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		return res;
	}
	
	public String likeHisCardTotals(String startTime,String endTime,
			String doorNo,String doorName,String cardCode,String cardName,String employeeName,
			String itemValue,String itemAlias){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String result = " ";
			result = resultCond(result,"B.DoorNo",doorNo);
			result = resultCond(result,"B.DoorName",doorName);
			result = resultCond(result,"A.CardCode",cardCode);
			result = resultCond(result,"C.CardName",cardName);
			result = resultCond(result,"D.EmployeeName",employeeName);
			result = resultCond(result,"E.ItemValue",itemValue);
			result = resultCond(result,"E.ItemAlias",itemAlias);
			
			 StringBuilder sb= new StringBuilder();
			 sb.append("SELECT COUNT(*) FROM (");
	         sb.append("	SELECT B.DoorNo,B.DoorName,A.CardCode,C.CardName,D.EmployeeName,A.RecordTime,E.ItemValue ");
	         sb.append("	FROM TBL_SwapCardRecord A ");
	         sb.append("	LEFT JOIN TBL_Door B ON A.EquipmentId = B.EquipmentId AND A.DoorNo = B.DoorNo ");
	         sb.append("	LEFT JOIN TBL_Card C ON A.CardCode = C.CardCode ");
	         sb.append("	LEFT JOIN TBL_Employee D ON C.UserId = D.EmployeeId ");
	         sb.append("	LEFT JOIN TBL_DataItem E ON E.EntryId = 49 AND E.ItemId = A.Valid ");
	         sb.append(String.format("	WHERE A.RecordTime >= CONCAT('%s',' 00:00:00') AND A.RecordTime <= CONCAT('%s',' 23:59:59') ", startTime,endTime));
	         sb.append(String.format("	%s ", result));
	         sb.append(" 	ORDER BY A.RecordTime DESC  LIMIT 3000 ");
	         sb.append(") A ;");  
	         Object res = dbHelper.executeScalar(sb.toString());
			//System.out.println("2:"+sb.toString());

			if(res == null){
            	return "0";
			}else{
				return res.toString();
			}
		} catch (Exception e) {
			log.error("likeHisCardTotals Exception:", e);
			return "0";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
	}
	
	/** 根据值返回合理SQL条件 */
	private String resultCond(String result,String colName,String value){
		String logic = "WHERE";
		if(result.length() > 0)
			logic = "AND";
			
		if(value == null || value.equals("") || value.equals("undefined")){
			//result += "";
		}else if(value.equals("notNull"))
			result += String.format(" %s %s IS NOT NULL ", logic,colName);
		else if(value.equals("null"))
			result += String.format(" %s %s IS NULL ", logic,colName);
		else
			result += String.format(" %s %s LIKE '%s' ", logic,colName,"%"+value+"%");
		return result;
	}
}
