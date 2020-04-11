package nurse.logic.providers;

import java.sql.CallableStatement;
import java.sql.Types;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import nurse.entity.persist.*;
import org.apache.log4j.Logger;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.DatabaseHelper;
import nurse.utility.DoorGovernHelper;

public class DoorProvider {

	private static DoorProvider instance = new DoorProvider();
	private static Logger log = Logger.getLogger(DoorProvider.class);
	//private static int dEquipmentId = 100000001;
	private static int timeGroupType = 10;
	private static String DelDoorCardStr = "";
	private static HashMap<String, String> userCardMap = new HashMap<String, String>();
	
	public static DoorProvider getInstance(){
		return instance;
	}
	
	public boolean insertDoor(int stationId,int equipmentId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" CALL PCT_GetDoorByEquipment(%s,%s)", stationId,equipmentId);
			/*************************************************************************************/
			log.info(String.format("InsertDoor CALL PCT_GetDoorByEquipment(%s,%s)", stationId,equipmentId));
			/*************************************************************************************/
			
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("insertDoor failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	/**
	 * 根据设备编号删除门禁相关数据
	 */
	public boolean deleteDoorByEquipmentId(int equipmentId){
    	DatabaseHelper dbHelper = null;
    	DataTable dt = null;
    	try {
    		dbHelper = new DatabaseHelper();
			String sql = String.format("select DoorId from tbl_door WHERE EquipmentId = %s; ", equipmentId); 
			dt = dbHelper.executeToTable(sql);
			System.out.println("Select TBL_Door SQL:"+sql);
			
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			for(int i=0;i<rowCount;i++){
				String doorId = drs.get(i).getValueAsString("DoorId");
				//门禁和准进时间组关联表
				sql = String.format("DELETE FROM tbl_doortimegroup WHERE DoorId = %s;", doorId);
				dbHelper.executeNoQuery(sql);
				System.out.println("Delete TBL_DoorTimeGroup SQL:"+sql);
			}
			//门禁表
			/*sql = String.format("DELETE FROM tbl_door WHERE EquipmentId = %s;", equipmentId);
			dbHelper.executeNoQuery(sql);
			System.out.println("Delete TBL_Door SQL:"+sql);*/
			
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return false;
	}
	
	/**
	 * 根据模板编号判断是否是门禁设备
	 */
	public boolean isDoorDeviceByEmpTempId(int equipmentTemplateId){
    	DatabaseHelper dbHelper = null;
		Object res = null;
    	try {
    		dbHelper = new DatabaseHelper();
    		StringBuffer sb = new StringBuffer();
    		sb.append("SELECT ");
    		sb.append("	COUNT(1) ");
    		sb.append("FROM TBL_EquipmentTemplate ");
    		sb.append(String.format("WHERE EquipmentTemplateId = %s ", equipmentTemplateId));
    		sb.append("AND (EquipmentCategory = 82 OR EquipmentTemplateName LIKE '%门禁%' OR EquipmentTemplateName LIKE '%door%' OR EquipmentBaseType = 1001);");
			res = dbHelper.executeScalar(sb.toString());
			
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
	
	public ArrayList<Door> getDoorListByDoorName(String doorName){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	DoorId,DoorNo,DoorName,A.StationId,");
            sb.append("	A.EquipmentId,EquipmentName,A.SamplerUnitId,Category,");
            sb.append("	Address,WorkMode,Infrared,Password,");
            sb.append("	DoorControlId,DoorInterval,OpenDelay,");
            sb.append("	Encryption,A.Description ");
            sb.append("FROM tbl_door A,tbl_equipment B ");
            sb.append("where A.EquipmentId=B.EquipmentId;");
            /*sb.append(String.format("%s", doorName.trim()));
            sb.append("%';");*/
            dt = dbHelper.executeToTable(sb.toString());
            
            return Door.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<Door> getDoorListByDoorId(String doorId){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	DoorId,DoorNo,DoorName,StationId,");
            sb.append("	EquipmentId,SamplerUnitId,Category,");
            sb.append("	Address,WorkMode,Infrared,Password,");
            sb.append("	DoorControlId,DoorInterval,OpenDelay,");
            sb.append("	Description ");
            sb.append("FROM tbl_door ");
            sb.append(String.format("where DoorId = %s;", doorId));
            dt = dbHelper.executeToTable(sb.toString());
            
            ArrayList<TimeGroup> list = TimeGroupProvider.getInstance().getTimeGroupByDoorId(CabinetDeviceMap.parseInt(doorId));
            return Door.fromDataTable(dt,list);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean updateDoor(String doorId,String doorName,String doorNo,String password,String openDelay,
			String infrared,String address,String doorControlId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("UPDATE tbl_door ");
			sb.append("	SET DoorName = '%s',DoorNo='%s',`Password` = '%s',");
			sb.append("	OpenDelay = '%s',Infrared = '%s',Address = '%s',doorControlId = %s ");
			sb.append("WHERE DoorId = %s;");
			if(doorControlId.equals("") || doorControlId.equals("undefined"))
				doorControlId = "-1";
			String sql = String.format(sb.toString(),doorName,doorNo,password,openDelay,infrared,address,doorControlId,doorId);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public int insertDoorTimeGroup(String doorId,String timeGroupId){
		DatabaseHelper dbHelper = new DatabaseHelper();
		try {
			String sql = String.format("SELECT TimeGroupType FROM TBL_DoorTimeGroup WHERE DoorId = %s AND TimeGroupId = %s;",
					doorId,timeGroupId);
			
			Object scalar = dbHelper.executeScalar(sql);
			if(scalar == null){
				int timeGroupType = getTimeGroupType(doorId);
				sql = String.format("INSERT INTO tbl_doortimegroup VALUES (%s,%s,%s);",
						doorId,timeGroupId,timeGroupType);
				dbHelper.executeNoQuery(sql);
				return timeGroupType;
			}else
				return CabinetDeviceMap.parseInt(scalar);
		} catch (Exception e) {
			log.error("insert failed.", e);
			return -1;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	private int getTimeGroupType(String doorId){
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            String sql = String.format("select MAX(TimeGroupType) from tbl_doortimegroup where DoorId = %s;",
	            		doorId);
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = timeGroupType;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					++iMaxId;
				}

			} catch (Exception e) {
				log.error("getMaxEquipmentId failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
	}
	
	public boolean deleteDoorTimeGroup(int timeGroupId){
    	DatabaseHelper dbHelper = null;
    	try {
    		dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM tbl_doortimegroup WHERE TimeGroupId = %s;", timeGroupId);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return false;
	}
	
	public String controlDoor(String stationId,String equipmentId,String command){
		try {
			if(command.equals("timing")){//校时
				Date d = new Date();   
		        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");  
		        String dateNowStr = sdf.format(d);
				
				//[CmdToken],[Password],{Date}
				String[] values = new String[]{"{Date:"+dateNowStr+"}"};
				//ArrayList<String> list = DoorGovernHelper.getInstance().getDoorNoList(equipmentId);
				//for(String DoorNo : list){
					String control = DoorGovernHelper.getInstance().SendDoorControl("AccessControlTimingSetting", equipmentId,
							"-1", "1001307001", "1", values);
					if(!control.equals("OK")) return "Timing Not Exist";
				//}
			}else if(command.equals("removeCard")){//删除准进卡
				//[CmdToken],[Password]
				String[] values = new String[]{};
				//ArrayList<String> list = DoorGovernHelper.getInstance().getDoorNoList(equipmentId);
				//for(String DoorNo : list){
					String control = DoorGovernHelper.getInstance().SendDoorControl("DeleteAllCard", equipmentId,
							"-1", "1001102001", "1", values);
					if(!control.equals("OK")) return "RemoveAllCard Not Exist";
				//}
			}else if(command.indexOf("encryption") != -1){//encryption&1    刷卡加密码，1需要密码，0不需要密码
				String value = command.split("\\&")[1];
				//[CmdToken],[DoorPassword],{Value}
				String[] values = new String[]{"{Value:"+value+"}"};
				//ArrayList<String> list = DoorGovernHelper.getInstance().getDoorNoList(equipmentId);
				//for(String DoorNo : list){
					String control = DoorGovernHelper.getInstance().SendDoorControl("DoorEncryption", equipmentId,
							"-1", "1001308001", "1", values);
					if(!control.equals("OK")) return "Encryption Not Exist";
				//}
				//修改TBL_Door的Encryption状态
				updateDoorEncryption(equipmentId,stationId,value);
			}
			
			//删除准进时间段数据
			if(command.equals("removeAllTimeGroup")){
				//[优化 1]根据TBL_TimeGroup表获取删除的时间组
				for(int i = 0;i <= 15;i++){
					//判断当前的TimeGroupId是否在门禁的取值范围内
					boolean is = DoorGovernHelper.getInstance().isTimeGroupNo(equipmentId, i);
					if(!is) continue;
					
					for(int j = 1;j <= 7;j++){
						//[CmdToken],[DoorPassword],{DoorNo},{HEX(TimeGroupId)},{TimeSpanChar}
						ArrayList<String> list = DoorGovernHelper.getInstance().getDoorNoList(equipmentId);
						for(String DoorNo : list){
							String TimeSpanChar = String.format("000000000000000000000000000000000000%s", j);
							String[] values = new String[]{"{DoorNo:"+DoorNo+"}","{HEX(TimeGroupId):"+i+"}","{TimeSpanChar:"+TimeSpanChar+"}"};
							String control = DoorGovernHelper.getInstance().SendDoorControl("AccessTimeSetting", equipmentId,
									"-1", "1001305001", DoorNo, values);
							
							if(!control.equals("OK")) return "AccessTimeSetting Not Exist";
						}
					}
				}
			}

			return "SUCCEED";
		} catch (Exception e) {
			log.error("insertDoor failed.", e);
			return "FAILURE";
		}
	}
	
	/** 根据基类编号获取绑定了基类的控制编号 */
	public int getControlIdByBaseTypeId(String equipmentId,int baseTypeId){
		DatabaseHelper dbHelper = null;
		int controlId = 0;
    	try {
    		dbHelper = new DatabaseHelper();
    		StringBuffer sb = new StringBuffer();
    		sb.append("SELECT ControlId FROM TBL_Control A ");
    		sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
    		sb.append(String.format("WHERE B.EquipmentId = %s AND A.BaseTypeId = %s;", 
					equipmentId,baseTypeId));
    		
			DataTable dt = dbHelper.executeToTable(sb.toString());
			
			if(dt.getRowCount() > 0)
				controlId = Integer.parseInt(dt.getRows().get(0).getValueAsString("ControlId"));
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return controlId;
	}
	
	private boolean updateDoorEncryption(String equipment,String stationId,String encryption){
		DatabaseHelper dbHelper = null;
    	try {
    		dbHelper = new DatabaseHelper();
			String sql = String.format("UPDATE TBL_Door SET Encryption = %s WHERE EquipmentId = %s AND StationId = %s;",
					encryption,equipment,stationId);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return false;
	}
	
	public ArrayList<DoorCard> getDoorCardList(String cardGroup,String timeGroupId,String endTime,String employeeName,
			String doorName,String cardCode,String cardName){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	C.DoorId,C.DoorName,C.DoorNo,B.TimeGroupId,B.TimeGroupName,D.CardId,");
            sb.append("	D.CardCode,D.CardName,E.EmployeeName,A.StartTime,A.EndTime,F.TimeGroupType  ");
            sb.append("FROM	TBL_DoorCard A,TBL_TimeGroup B,TBL_Door C,TBL_Card D,TBL_Employee E,TBL_DoorTimeGroup F ");
            sb.append("WHERE A.TimeGroupId = B.TimeGroupId AND A.DoorId = C.DoorId ");
            sb.append("AND A.CardId = D.CardId AND D.UserId = E.EmployeeId AND F.DoorId = A.DoorId AND F.TimeGroupId = B.TimeGroupId ");
            sb.append("AND D.CardGroup LIKE '%");
            sb.append(String.format("%s", cardGroup));
            sb.append("%' AND B.TimeGroupId LIKE '%");
            sb.append(String.format("%s", timeGroupId));
            sb.append("%' AND A.EndTime <=  '");
            sb.append(String.format("%s", endTime));
            sb.append("' AND E.EmployeeName LIKE '%");
            sb.append(String.format("%s", employeeName));
            sb.append("%' AND  C.DoorName LIKE '%");
            sb.append(String.format("%s", doorName));
            sb.append("%' AND D.CardCode LIKE '%");
            sb.append(String.format("%s", cardCode));
            sb.append("%' AND D.CardName LIKE '%");
            sb.append(String.format("%s", cardName));
            sb.append("%';");
            dt = dbHelper.executeToTable(sb.toString());
            
            return DoorCard.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<DoorCard> getDoorByTimeGroup(String timeGroupId){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	B.TimeGroupId,A.DoorId,A.DoorName,B.TimeGroupType ");
            sb.append("FROM TBL_Door A,TBL_DoorTimeGroup B ");
            sb.append(String.format("WHERE A.DoorId = B.DoorId AND TimeGroupId = %s;", timeGroupId));
            dt = dbHelper.executeToTable(sb.toString());
            
            return DoorCard.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String insDoorCardCommand(String[] doorIds,ArrayList<DoorCard> doorCards,String userId,Card card){
		try {
			if(doorIds != null)
				insertDoorCard(doorIds, "FF", doorCards.get(0).timeGroupId, null, null, "");
			
			String control = "ERROR";
			for(DoorCard doorCard : doorCards){
				
				/*if(dcs != null && dcs.containsKey(doorCard.doorId))
					card.cardCode = dcs.get(doorCard.doorId);*/
				
				Door door = DoorGovernHelper.getInstance().getEquipmenAndDoorByDoorId(String.valueOf(doorCard.doorId));
				
				int category = door.category;
				int no = doorCard.timeGroupId == null ? 0 : Integer.parseInt(doorCard.timeGroupId);
				if(category > 1 && no != 99999999 && (no < 1 || Integer.parseInt(doorCard.timeGroupId) > 4))
					continue;//return "Many Door Time Group 1-4";
				
				String doorNo = String.valueOf(door.doorNo);
				String equipmentId = String.valueOf(door.equipmentId);
				//返回合法的卡号
				card.cardCode = DoorGovernHelper.getInstance().getLegitCard(equipmentId, card.cardCode);
				String UId = String.valueOf((DoorProvider.getInstance().GetCardId(card,userId)%10000));
				
				//[CmdToken],[DoorPassword],{UserId}+{CardCode},{HEX(TimeGroupId)},{UserPassword},{EndTime},{DoorNo}
				String userPassword = (doorCard.password == null || doorCard.password.equals(""))?"0000":doorCard.password;
				String[] values = new String[]{"{UserId:"+UId+"}","{CardCode:"+card.cardCode+"}",
						"{HEX(TimeGroupId):"+doorCard.timeGroupId+"}","{UserPassword:"+userPassword+"}",
						"{EndTime:"+card.endTime+"}","{DoorNo:"+doorNo+"}"};
				control = DoorGovernHelper.getInstance().SendDoorControl("AddCard", equipmentId,
						"-1", "1001301001", doorNo, values);
				
				if(!control.equals("OK")) return control;
			}

			return "SUCCEED";
		} catch (Exception e) {
			log.error("insertDoor failed.", e);
			return "Database Exception";
		}
	}
	
	/** 将十进制转为十六进制 */
	public static String toHexString(int decimal) { 
        String hex = ""; 
        while(decimal != 0) { 
            int hexValue = decimal % 16; 
            hex = toHexChar(hexValue) + hex; 
            decimal = decimal / 16; 
        } 
        return  hex; 
    } 
	/** 将十进制转为3位的十六进制 */
	public static String toThreeHexString(int decimal) { 
        String hex = toHexString(decimal);
    	int rem = 3 - hex.length();
    	for(int i = 0;i < rem;i++){
    		hex = "0"+hex;
    	}
        return  hex; 
    } 
    //将0~15的十进制数转换成0~F的十六进制数 
    private static char toHexChar(int hexValue) { 
        if(hexValue <= 9 && hexValue >= 0) 
            return (char)(hexValue + '0'); 
        else 
            return (char)(hexValue - 10 + 'A'); 
    } 
    
	public boolean delDoorCardCommand(ArrayList<DoorCard> cardCodes,boolean isDelCard){
		try {
			DoorProvider.DelDoorCardStr = "";
			for(DoorCard dc : cardCodes){
				if(!isDelCard)
					DoorProvider.DelDoorCardStr += dc.doorId+"|";
				Door door = DoorGovernHelper.getInstance().getEquipmenAndDoorByDoorId(String.valueOf(dc.doorId));
				
				//[CmdToken],[DoorPassword],0+{CardCode},{DoorNo}
				String[] values = new String[]{"{CardCode:"+dc.cardCode+"}","{DoorNo:"+door.doorNo+"}"};
				String control = DoorGovernHelper.getInstance().SendDoorControl("DeleteCard", String.valueOf(door.equipmentId),
						"-1", "1001302001", String.valueOf(door.doorNo), values);
				
				if(!control.equals("OK")) return false;
			}
			DoorProvider.DelDoorCardStr = DelDoorIdStr(DoorProvider.DelDoorCardStr);
		
			return true;
		} catch (Exception e) {
			log.error("insertDoor failed.", e);
			return false;
		} 
	}
	
	private String DelDoorIdStr(String doorIds){
		String[] split = doorIds.split("\\|");
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		String result = "";
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT DoorId FROM TBL_Door;";
			dt = dbHelper.executeToTable(sql);
			for(int i = 0;i < dt.getRowCount();i++){
				String id = dt.getRows().get(i).getValueAsString("DoorId");
				boolean  is = false;
				for(String s : split){
					if(s.equals(id))
						is = true;
				}
				if(!is)
					result += id+"|";
			}
		} catch (Exception e) {
			log.error("DelDoorIdStr failed.", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return result;
	}
	
	public ArrayList<DoorCard> getLimitDoorCard(String index,String size,String cardGroup,String timeGroupId,String endTime,String employeeName,
			String doorName,String cardCode,String cardName){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	C.DoorId,C.DoorName,C.DoorNo,B.TimeGroupId,B.TimeGroupName,D.CardId,");
            sb.append("	D.CardCode,D.CardName,E.EmployeeName,A.StartTime,A.EndTime,F.TimeGroupType  ");
            sb.append("FROM	TBL_DoorCard A,TBL_TimeGroup B,TBL_Door C,TBL_Card D,TBL_Employee E,TBL_DoorTimeGroup F ");
            sb.append("WHERE A.TimeGroupId = B.TimeGroupId AND A.DoorId = C.DoorId ");
            sb.append("AND A.CardId = D.CardId AND D.UserId = E.EmployeeId AND F.DoorId = A.DoorId AND F.TimeGroupId = B.TimeGroupId ");
            sb.append("AND D.CardGroup LIKE '%");
            sb.append(String.format("%s", cardGroup));
            sb.append("%' AND B.TimeGroupId LIKE '%");
            sb.append(String.format("%s", timeGroupId));
            sb.append("%' AND A.EndTime <=  '");
            sb.append(String.format("%s", endTime));
            sb.append("' AND E.EmployeeName LIKE '%");
            sb.append(String.format("%s", employeeName));
            sb.append("%' AND  C.DoorName LIKE '%");
            sb.append(String.format("%s", doorName));
            sb.append("%' AND D.CardCode LIKE '%");
            sb.append(String.format("%s", cardCode));
            sb.append("%' AND D.CardName LIKE '%");
            sb.append(String.format("%s", cardName));
            sb.append("%' ");
            sb.append(String.format(" LIMIT %s,%s;", index,size));
            dt = dbHelper.executeToTable(sb.toString());
            
            return DoorCard.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public int getDoorCardNums(String cardGroup,String timeGroupId,String endTime,String employeeName,
			String doorName,String cardCode,String cardName){
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT ");
            sb.append("	COUNT(*) ");
            sb.append("FROM	TBL_DoorCard A,TBL_TimeGroup B,TBL_Door C,TBL_Card D,TBL_Employee E,TBL_DoorTimeGroup F ");
            sb.append("WHERE A.TimeGroupId = B.TimeGroupId AND A.DoorId = C.DoorId ");
            sb.append("AND A.CardId = D.CardId AND D.UserId = E.EmployeeId AND F.DoorId = A.DoorId AND F.TimeGroupId = B.TimeGroupId ");
            sb.append("AND D.CardGroup LIKE '%");
            sb.append(String.format("%s", cardGroup));
            sb.append("%' AND B.TimeGroupId LIKE '%");
            sb.append(String.format("%s", timeGroupId));
            sb.append("%' AND A.EndTime <=  '");
            sb.append(String.format("%s", endTime));
            sb.append("' AND E.EmployeeName LIKE '%");
            sb.append(String.format("%s", employeeName));
            sb.append("%' AND  C.DoorName LIKE '%");
            sb.append(String.format("%s", doorName));
            sb.append("%' AND D.CardCode LIKE '%");
            sb.append(String.format("%s", cardCode));
            sb.append("%' AND D.CardName LIKE '%");
            sb.append(String.format("%s", cardName));
            sb.append("%';");
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
	
	public Door getStationIdAndEquipmentIdByDoorId(String doorId){
		return DoorGovernHelper.getInstance().getEquipmenAndDoorByDoorId(doorId);
	}
	
	public boolean updateDoorOpenDelay(Door door,String openDelay){
		try {
			//[CmdToken],1,[DoorPassword],1,{OpenDelay}
			String[] values = new String[]{"{OpenDelay:"+openDelay+"}"};
			String control = DoorGovernHelper.getInstance().SendDoorControl("DoorOpenOvertimeSetting", String.valueOf(door.equipmentId),
					"-1", "1001306001", String.valueOf(door.doorNo), values);
			
			if(!control.equals("OK")) return false;
			
			return true;
		} catch (Exception e) {
			log.error("insertDoor failed.", e);
			return false;
		}
	}
	
	public ArrayList<DataItem> GetCardCodeTypes(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "SELECT * FROM TBL_CardCodeType;";
            dt = dbHelper.executeToTable(sql);
            return DataItem.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String insertDoorCard(String[] doorIds,String doorNo,String timeGroupId,Card card, String userId,String password){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			for(String doorId : doorIds){
				/*if(dcs != null && dcs.containsKey(doorId))
					card.cardCode = dcs.get(doorId);*/
				
				int cardId = GetCardId(card,userId);//不存在新增，存在修改
				if(cardId == -1) continue;
				
				//判断TBL_DoorCard是否存在，不存在新增，存在修改，TBL_DoorTimeGroup不存在返回TimeSpanChar
				CallableStatement stem = dbHelper.prepareProcedure("PRO_InsertDoorCard","?,?,?,?,?,?");
				stem.setInt(1, cardId);
				stem.setInt(2, Integer.parseInt(timeGroupId));
				stem.setInt(3, Integer.parseInt(doorId));
				stem.setString(4, card == null ? "2099-01-01" : card.endTime);
				stem.setString(5, password.equals("") ? "0000" : password);
				stem.registerOutParameter(6,Types.VARCHAR);
				stem.execute();
				
				String timeSpanChar = stem.getString(6);
				if(timeSpanChar != null && !timeSpanChar.equals("")){
					if(timeGroupId.equals("99999999"))
						initDoorTimeGroup(doorId,timeGroupId);
					else{
						String result = TimeGroupProvider.getInstance().initTimeGroupCommand(doorId,timeGroupId,doorNo,timeSpanChar);
						if(!result.equals("OK")) return result;
					}
				}
			}
			return "SUCCEED";
		} catch (Exception e) {
			log.error("insertDoorCard failed.", e);
			return "Database Exception";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean initDoorTimeGroup(String doorId,String timeGroupId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT COUNT(*) FROM TBL_DoorTimeGroup WHERE DoorId = %s AND TimeGroupId = %s;",
					doorId,timeGroupId); 
			Object scalr = dbHelper.executeScalar(sql);
			if(scalr != null){
				String count = String.valueOf(scalr);
				if(count.equals("0")){
					sql = String.format("SELECT TimeGroupType FROM TBL_TimeGroup WHERE TimeGroupId = %s;", timeGroupId);
					scalr = dbHelper.executeScalar(sql);
					if(scalr != null){
						String timeGroupType = String.valueOf(scalr);
						sql = String.format("INSERT INTO TBL_DoorTimeGroup VALUES(%s,%s,%s);", doorId,timeGroupId,timeGroupType);
						dbHelper.executeNoQuery(sql);
					}
				}
			}
			return true;
		}catch(Exception e) {
			log.error("GetDoorIdByEquipmentId exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/** 不存在则新增，存在则修改，返回卡编号 */
	public int GetCardId(Card card,String userId){
		int cardId = -1;
		if(card == null) return cardId;

		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT CardId FROM TBL_Card WHERE CardCode = '%s' LIMIT 1;", card.cardCode); 
			dt = dbHelper.executeToTable(sql);
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			for(int i=0;i<rowCount;i++){
				cardId = Integer.parseInt(drs.get(i).getValueAsString("CardId"));
			}

			if(cardId == -1){//不存在
				cardId = CardProvider.getInstance().insertCard(card.cardCode, card.cardName, 1, "1", userId, "1",
					card.endTime, card.description, card.cardType);
			}else{//存在
				CardProvider.getInstance().updateCard(String.valueOf(cardId),userId, card.endTime);
			}

			return cardId;
		}catch(Exception e) {
			log.error("GetDoorIdByEquipmentId exception:",e);
			return -1;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	
	/** 定时调用，检测门相关命令下发是否成功，成功添加到门相关表的数据，否则不操作 **/
	public synchronized boolean SaveDoorCardData(){
		try {
			ArrayList<ActiveControl> acs = GetControlByDoor();
			if(acs == null || acs.size() <= 0) return false;
			for(ActiveControl ac : acs){
				synchronized(ac){
					if(ac.Result == 1){
						//要大改，根据CmdToken+ParamterValues的参数，按照门禁规制表获取指定位置的值
						String param = "";
						if(ac.ParameterValues == null || ac.ParameterValues.length() == 0)
							param = ac.CmdToken;
						else
							param = String.format("%s,%s", ac.CmdToken,ac.ParameterValues);
						switch(ac.BaseTypeId)
						{
							case 1001301001://加卡  param=36,000000,1+DDCA45619,C0,0000,20990101,1
								addDoorCard(param,ac);
								userCardMap.clear();
								break;
							case 1001302001://删卡 param=37,000000,0+00005734C0,1
								delDoorCard(param,ac);
								userCardMap.clear();
								break;
							case 1001305001://加时限 param=42,000000,FF,02,00012C1902582BC3E84B05145786406A47D01
								addTimeGroup(param,ac);
								addDoorTimeGroup(param,ac);
								break;
							case 1001102001://删除所有有效卡 param=45,000000
								delAllDoorCard(param,ac);
								break;
							default:
								continue;
						}
						log.info("SaveDoorCardData() CmdToken:"+ac.CmdToken+" Success!");
					}
				}
			}
			return true;
		} catch (Exception e) {
			log.error("SaveDoorCardData Exception:", e);
			return false;
		}
	}
	//获取门禁的控制命令
	private ArrayList<ActiveControl> GetControlByDoor(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuffer sb = new StringBuffer();
            sb.append("SELECT A.StationId,A.EquipmentId,A.ControlId,A.SerialNo,A.ActionId,A.CmdToken,A.ParameterValues,A.ControlResultType,A.BaseTypeId ");
            sb.append("FROM TBL_ActiveControl A ");
            sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentId = B.EquipmentId AND B.EquipmentCategory = 82;");
            
            dt = dbHelper.executeToTable(sb.toString());
            return ActiveControl.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	private void addDoorCard(String param,ActiveControl ac){
		//加卡  split=000000,1+DDCA45619,C0,0000,20990101,1
		String equipmenId = String.valueOf(ac.EquipmentId);
		DoorControlGovern dcg = DoorGovernHelper.getInstance().getDoorControlGovern(equipmenId);
		
		Card card = new Card();
		String timeGroupId = DoorGovernHelper.getInstance().getValueByKey(equipmenId,"AddCard",param,"TimeGroupId");//String.valueOf(GetTimeGroupId(split[2]));
		String timeGroup = String.valueOf(DoorGovernHelper.getInstance().getDoorDecimal(timeGroupId,dcg.CardSystem));
		String password = DoorGovernHelper.getInstance().getValueByKey(equipmenId,"AddCard",param,"UserPassword");//split[3];
		card.endTime = DoorGovernHelper.getInstance().getValueByKey(equipmenId,"AddCard",param,"EndTime");//split[4];
		String No = DoorGovernHelper.getInstance().getValueByKey(equipmenId,"AddCard",param,"DoorNo");
		int doorNo = No.equals("") ? 0 : Integer.parseInt(No);//Integer.parseInt(split[5]);

		String[] doors = new String[]{String.valueOf(GetDoorIdByEquipmentId(ac.EquipmentId,doorNo))};
		
		String userId = null;
		card.cardCode = DoorGovernHelper.getInstance().getValueByKey(equipmenId,"AddCard",param,"CardCode");//split2[1];
		card.cardName = String.format("门禁卡%s", card.cardCode);
		card.cardType = 1;
		card.cardCategory = 1;
		card.description = "";
		
		//HashMap<Integer, String> dcs = DoorProvider.getInstance().checkCardCode(card.cardCode,doors);
		
		//card.cardCode = DoorGovernHelper.getInstance().getLegitCard(equipmenId, card.cardCode);
		DoorProvider.getInstance().insertDoorCard(doors,String.valueOf(doorNo),timeGroup,card,userId,password);
	}
	
	private int GetDoorIdByEquipmentId(int equipmentId,int doorNo){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("select DoorId from tbl_door WHERE EquipmentId = %s AND DoorNo = %s;",
					equipmentId,doorNo); 
			dt = dbHelper.executeToTable(sql);
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			int doorId = 0;
			for(int i=0;i<rowCount;i++){
				doorId = Integer.parseInt(drs.get(i).getValueAsString("DoorId"));
			}
			return doorId;
		}catch(Exception e) {
			log.error("GetDoorIdByEquipmentId exception:",e);
			return -1;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	private void delDoorCard(String param,ActiveControl ac){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            
            StringBuffer sb = new StringBuffer();
            sb.append("SELECT CardId ");
            sb.append("FROM TBL_DoorCard ");
            sb.append("WHERE CardId NOT IN ");
            sb.append("(SELECT CardId FROM TBL_Card) GROUP BY CardId;");
            dt = dbHelper.executeToTable(sb.toString());
            if(dt.getRowCount() == 0){
            	String equipmentId = String.valueOf(ac.EquipmentId);
            	String cardCode = DoorGovernHelper.getInstance().getValueByKey(equipmentId, "DeleteCard", param, "CardCode");// split[1].split("\\+")[1];
            	
            	sb = new StringBuffer();
            	sb.append("SELECT A.CardId ");
            	sb.append("FROM TBL_DoorCard A ");
            	sb.append("LEFT JOIN TBL_Card B ON A.CardId = B.CardId ");
            	sb.append("LEFT JOIN TBL_Door C ON A.DoorId = C.DoorId ");
            	sb.append("WHERE C.EquipmentId = %s AND B.CardCode LIKE '%s' GROUP BY CardId;");
            	dt = dbHelper.executeToTable(String.format(sb.toString(), equipmentId,"%"+cardCode+"%"));
            }

            DataRowCollection drs = dt.getRows();
    		for(int i=0;i<dt.getRowCount();i++)
    		{
    			String cardId = drs.get(i).getValueAsString("CardId");
    			String[] doorIds = DoorProvider.DelDoorCardStr.split("\\|");
    			for(String doorId : doorIds){
    				if(doorId == null || doorId.equals("")) break;
                    deleteDoorCard(cardId,doorId);
    			}
    		}
        }catch (Exception e) {
			log.error("delDoorCard exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean deleteDoorCard(String cardId,String doorId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM TBL_DoorCard WHERE CardId = %s AND DoorId = %s;",
					cardId,doorId); 
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("deleteDoorCard failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	public boolean deleteDoorTimeGroupByDeviceId(int equipmentId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT DoorId FROM TBL_Door WHERE EquipmentId = %s;",
					equipmentId); 
			DataTable dt = dbHelper.executeToTable(sql);
			for(int i = 0;i < dt.getRowCount();i++){
				String doorId = dt.getRows().get(i).getValueAsString("DoorId");
				sql = String.format("DELETE FROM TBL_DoorTimeGroup WHERE DoorId = %s;", doorId);
				dbHelper.executeNoQuery(sql);
			}
			return true;
		} catch (Exception e) {
			log.error("deleteDoorCard failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	private void addTimeGroup(String param,ActiveControl ac){
		//split=000000,FF,02,00012C1902582BC3E84B05145786406A47D01
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
    		
			TimeGroupSpan tgs = new TimeGroupSpan();
			
			String equipmentId = String.valueOf(ac.EquipmentId);
			String timeGroup = DoorGovernHelper.getInstance().getValueByKey(equipmentId, "AccessTimeSetting", param, "TimeGroupId");
			DoorControlGovern dcg = DoorGovernHelper.getInstance().getDoorControlGovern(equipmentId);
			
			if(timeGroup.equals("C0"))
				tgs.timeGroupId = 99999999;
			else if(timeGroup.equals("40"))
				tgs.timeGroupId = 0;
			else
				tgs.timeGroupId = Integer.parseUnsignedInt(timeGroup, dcg.CardSystem);//CardSystem:门禁的卡号进制
			
			String timeSpanChar = DoorGovernHelper.getInstance().getValueByKey(equipmentId, "AccessTimeSetting", param, "TimeSpanChar");
			tgs.week = Integer.parseInt(timeSpanChar.substring(timeSpanChar.length()-1));
			tgs.timeSpanChar = timeSpanChar.substring(0,timeSpanChar.length()-1);
            
			String sql = String.format("SELECT COUNT(*) Conut FROM TBL_TimeGroupSpan WHERE TimeGroupId = %s AND `Week` = %s;",
					tgs.timeGroupId,tgs.week);
			dt = dbHelper.executeToTable(sql);
			DataRowCollection drs = dt.getRows();
			int count = Integer.parseInt(drs.get(0).getValueAsString("Conut"));

			if(count > 0){//修改
				TimeGroupProvider.getInstance().updateTimeGroupSpan(tgs.timeGroupId, tgs.week, tgs.timeSpanChar);
			}else{//新增
				TimeGroupProvider.getInstance().InsertTimeGroupSpan(tgs.timeGroupId, tgs.week, tgs.timeSpanChar);
			}
        }catch (Exception e) {
			log.error("addTimeGroup exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	private void addDoorTimeGroup(String param,ActiveControl ac){
		DatabaseHelper dbHelper = null;
		try {
			String equipmentId = String.valueOf(ac.EquipmentId);
			String timeGroup = DoorGovernHelper.getInstance().getValueByKey(equipmentId, "AccessTimeSetting", param, "TimeGroupId");
			DoorControlGovern dcg = DoorGovernHelper.getInstance().getDoorControlGovern(equipmentId);
			
			int timeGroupId = 0;
			if(timeGroup.equals("C0"))
				timeGroupId = 99999999;
			else if(timeGroup.equals("40"))
				timeGroupId = 0;
			else
				timeGroupId = Integer.parseUnsignedInt(timeGroup, dcg.CardSystem);
			String doorNo = DoorGovernHelper.getInstance().getValueByKey(equipmentId, "AccessTimeSetting", param, "DoorNo");
			
			String timeSpanChar = DoorGovernHelper.getInstance().getValueByKey(equipmentId, "AccessTimeSetting", param, "TimeSpanChar");
			int week = Integer.parseInt(timeSpanChar.substring(timeSpanChar.length()-1));

			if(week == 1){
				dbHelper = new DatabaseHelper();
				String sql = String.format(" CALL PRO_InsertDoorTimeGroup(%s,'%s',%s)", 
						timeGroupId,doorNo,equipmentId);
				
				dbHelper.executeNoQuery(sql);
			}
		} catch (Exception e) {
			log.error("addDoorTimeGroup exception:",e);
		}finally{
			
		}
	}
	
	private void delAllDoorCard(String param,ActiveControl ac){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "DELETE FROM TBL_Card;"; 
			dbHelper.executeNoQuery(sql);
			
			sql = "DELETE FROM TBL_DoorCard;"; 
			dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("delAllDoorCard failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/** 根据门控制类型给卡号填充 */
	/*public HashMap<Integer, String> checkCardCode(String cardCode,String[] doors){
		HashMap<Integer, String> map = new HashMap<Integer, String>();//key:DoorId,value:CardCode
		DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuffer sb = new StringBuffer();
            sb.append("SELECT B.CardLength ");
            sb.append("FROM TBL_Door A ");
            sb.append("LEFT JOIN TBL_DoorController B ");
            sb.append("ON A.DoorControlId = B.DoorControlId ");
            sb.append("WHERE A.DoorId = %s;");
            
            for(String doorId : doors){
            	String sql = String.format(sb.toString(), doorId);
            	Object obj = dbHelper.executeScalar(sql);
            	if(obj != null){
            		int cardLen = Integer.parseInt(String.valueOf(obj));
            		if(cardCode.length() < cardLen){
            			int count = cardLen - cardCode.length();
            			for(int i = 0;i < count;i++){
            				cardCode = "0"+cardCode;
            			}
            		}
            	}
            	map.put(Integer.parseInt(doorId), cardCode);
            }
        }catch (Exception e) {
			log.error("checkCardCode exception:",e);
		}finally{
			dbHelper.close();
		}
        return map;
	}*/
	
	public String GetUserNameByCardCode(String cardCode){
		DatabaseHelper dbHelper = null;
		try {
			if(userCardMap.containsKey(cardCode)){
				return userCardMap.get(cardCode);
			}
			 dbHelper = new DatabaseHelper();
	         StringBuffer sb = new StringBuffer();
	         sb.append("SELECT CardCode,EmployeeName FROM TBL_Card A ");
	         sb.append("LEFT JOIN  TBL_Employee B ON A.UserId = B.EmployeeId;");
	         DataTable dt = dbHelper.executeToTable(sb.toString());
	         for(int i = 0;i < dt.getRowCount();i++){
	        	 DataRow dr = dt.getRows().get(i);
	        	 userCardMap.put(dr.getValueAsString("CardCode"), dr.getValueAsString("EmployeeName"));
	         }
		} catch (Exception e) {
			log.error("GetUserNameByCardCode exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return userCardMap.get(cardCode);
	}
	
	public ArrayList<DoorControlGovern> getDoorControls(){
		DatabaseHelper dbHelper = null;
		try {
			 dbHelper = new DatabaseHelper();
	         String sql = "SELECT * FROM TBL_DoorControlGovern;";
	         DataTable dt = dbHelper.executeToTable(sql);
	         
	         return DoorControlGovern.getTemperatures(dt);
		} catch (Exception e) {
			log.error("GetDoorControls exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return new ArrayList<DoorControlGovern>();
	}

	/**
	 * 根据设备查询最后一个刷卡记录的时间
	 * @param deviceId
	 * @param baseTypeId
	 * @param value
	 * @return
	 */
	public float FinalSwapCardDate(int deviceId, int baseTypeId, float value){
		if(value != 0) return value;

		String foramt = "";
		if(baseTypeId == 1001306001){//刷卡时间-年
			foramt = "yyyy";
		}else if(baseTypeId == 1001307001){//刷卡时间-月
			foramt = "MM";
		}else if(baseTypeId == 1001308001){//刷卡时间-日
			foramt = "dd";
		}else if(baseTypeId == 1001309001){//刷卡时间-时
			foramt = "HH";
		}else if(baseTypeId == 1001310001){//刷卡时间-分
			foramt = "mm";
		}else if(baseTypeId == 1001311001){//刷卡时间-秒
			foramt = "ss";
		}else return value;

		//log.info("FinalSwapCardDate DeviceId:"+deviceId+", BaseTypeId:"+baseTypeId+", Value:"+value);

		CardRecode recode = FinalCardRecode(deviceId);
		if(recode == null) return value;
		//log.info("FinalSwapCardDate CardRecode:"+recode);

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		try{
			Date date = sdf.parse(recode.RecordTime);
			sdf = new SimpleDateFormat(foramt);
			float floatValue = Float.parseFloat(sdf.format(date));
			//log.info("FinalSwapCardDate floatValue:"+recode);
			return floatValue;
		}catch (Exception ex){}
		return value;
	}

	/**
	 * 根据设备查询最后一个刷卡记录的卡号
	 * @param deviceId
	 * @param value
	 * @return
	 */
	public String FinalSwapCardCode(int deviceId, String value){
		if(value != null && value.replaceAll("0","").equals("")){
            //log.info("FinalSwapCardCode DeviceId:"+deviceId+", Value:"+value);
            CardRecode recode = FinalCardRecode(deviceId);
            if(recode == null) return value;
            //log.info("FinalSwapCardCode floatValue:"+recode.CardCode);
            return recode.CardCode;
        }
		return value;
	}

	private CardRecode FinalCardRecode(int deviceId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT * FROM TBL_SwapCardRecord WHERE EquipmentId = %s ORDER BY RecordTime DESC LIMIT 1;",deviceId);
			DataTable dt = dbHelper.executeToTable(sql);

			ArrayList<CardRecode> list = CardRecode.GetListFromDataTable(dt);
			if(list.size() > 0) return list.get(0);
		} catch (Exception e) {
			log.error("FinalCardRecode exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return null;
	}
}
