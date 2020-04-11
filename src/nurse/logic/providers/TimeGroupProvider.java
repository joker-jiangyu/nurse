package nurse.logic.providers;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.TimeGroup;
import nurse.entity.persist.TimeGroupSpan;
import nurse.utility.DatabaseHelper;
import nurse.utility.DoorGovernHelper;

public class TimeGroupProvider {

	private static TimeGroupProvider instance = new TimeGroupProvider();
	private static Logger log = Logger.getLogger(TimeGroupProvider.class);
	private static int timeSpanId = 0;

	
	public static TimeGroupProvider getInstance(){
		return instance;
	}
	
	public ArrayList<TimeGroup> getTimeGroupList(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	TimeSpanId,TimeGroupId,`Week`,TimeSpanChar,LastUpdateDate ");
            sb.append("FROM TBL_TimeGroupSpan WHERE `Week` = 1;");
            dt = dbHelper.executeToTable(sb.toString());
            ArrayList<TimeGroupSpan> gtss = TimeGroupSpan.fromDataTable(dt);
            
            sb = new StringBuilder();
            sb.append("SELECT ");
            sb.append("	TimeGroupId,TimeGroupCategory,TimeGroupName,TimeGroupType,");
            sb.append("	TimeGroupException,StartTime,EndTime,LastUpdateDate ");
            sb.append("FROM tbl_TimeGroup;");
            dt = dbHelper.executeToTable(sb.toString());
            
            return TimeGroup.fromDataTable(dt, gtss);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<TimeGroup> getTimeGroupsById(int timeGroupId){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	TimeSpanId,TimeGroupId,`Week`,TimeSpanChar,LastUpdateDate ");
            sb.append("FROM TBL_TimeGroupSpan ");
            sb.append(String.format("WHERE TimeGroupId = %s;", timeGroupId));
            dt = dbHelper.executeToTable(sb.toString());
            ArrayList<TimeGroupSpan> gtss = TimeGroupSpan.fromDataTable(dt);
            
            sb = new StringBuilder();
            sb.append("SELECT ");
            sb.append("	TimeGroupId,TimeGroupCategory,TimeGroupName,TimeGroupType,");
            sb.append("	TimeGroupException,StartTime,EndTime,LastUpdateDate ");
            sb.append("FROM tbl_TimeGroup ");
            sb.append(String.format("WHERE TimeGroupId = %s;", timeGroupId));
            dt = dbHelper.executeToTable(sb.toString());
            
            return TimeGroup.fromDataTable(dt, gtss);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<TimeGroup> getTimeGroupByDoorId(int doorId){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	B.TimeGroupId,B.TimeGroupName,B.TimeGroupType ");
            sb.append("FROM tbl_doortimegroup A,tbl_timegroup B ");
            sb.append("WHERE A.TimeGroupId = B.TimeGroupId AND A.DoorId = %s;");
            String sql = String.format(sb.toString(), doorId);
            dt = dbHelper.executeToTable(sql);
            
            return TimeGroup.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<TimeGroup> getTimeGroupType(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT ");
            sb.append("	TimeGroupId,TimeGroupName ");
            sb.append("FROM TBL_TimeGroup;");
            dt = dbHelper.executeToTable(sb.toString());
            
            return TimeGroup.fromDataTable(dt);
        }catch (Exception e) {
			log.error("Database exception:",e);
			return null;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	private int getMaxTimeSpanId(){
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            String sql = "select MAX(TimeSpanId) from TBL_TimeGroupSpan;";
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = timeSpanId;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					timeSpanId = ++iMaxId;
				}

			} catch (Exception e) {
				log.error("getMaxTimeSpanId failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
	}
	
	public boolean insertTimeGroup(String timeGroupName){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" CALL PRO_InsertTimeGroup('%s')", timeGroupName);
			
			dbHelper.executeNoQuery(sql);
			//下发命令
			/*RealDataProvider();
			initTimeGroupCommand(String.valueOf(timeGroupId),"FF","111111111111111111111111");*/
			return true;
		} catch (Exception e) {
			log.error("insertTimeGroup failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	public boolean InsertTimeGroupSpan(int timeGroupId, int week,String timeSpanChar){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			int timeSpanId = getMaxTimeSpanId();
			String sql = String.format("INSERT INTO TBL_TimeGroupSpan VALUES (%s,%s,NULL,NULL,%s,'%s',SYSDATE());",
						timeSpanId,timeGroupId,week,HexToChar(timeSpanChar));
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("InsertTimeGroupSpan failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean updateTimeGroup(String timeGroupId,String timeGroupName){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("UPDATE TBL_TimeGroup SET TimeGroupName = '%s',LastUpdateDate = SYSDATE() WHERE TimeGroupId = %s;",
					timeGroupName,timeGroupId);
			dbHelper.executeNoQuery(sql);

			return true;
		} catch (Exception e) {
			log.error("updateTimeGroup failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean updateTimeGroupSpan(int timeGroupId, int week,String timeSpanChar){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("UPDATE TBL_TimeGroupSpan SET TimeSpanChar = '%s',LastUpdateDate = SYSDATE() WHERE TimeGroupId = %s AND `Week` = %s;",
					HexToChar(timeSpanChar),timeGroupId,week);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("updateTimeGroupSpan failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean deleteTimeGroup(String timeGroupId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM TBL_TimeGroup WHERE TimeGroupId = %s;",timeGroupId);
			dbHelper.executeNoQuery(sql);

			sql = String.format("DELETE FROM TBL_TimeGroupSpan WHERE TimeGroupId = %s;",timeGroupId);
			dbHelper.executeNoQuery(sql);

			sql = String.format("DELETE FROM TBL_DoorTimeGroup WHERE TimeGroupId = %s;",timeGroupId);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("deleteTimeGroup failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String initTimeGroupCommand(String doorId,String timeGroupId,String doorNo,String timeSpanStr){
		try {
			Set<String> equipmentIds = null;
			if(doorId == null)
				equipmentIds = DoorGovernHelper.getInstance().getDoorEquipmentIds();
			else
				equipmentIds = GetEquipmentsByDoorIds(doorId);
			
			System.out.println("Equipmen Number:"+equipmentIds.size());
			for(String equipmentId : equipmentIds){
				//判断当前的TimeGroupId是否在门禁的取值范围内
				boolean is = DoorGovernHelper.getInstance().isTimeGroupNo(equipmentId, Integer.parseInt(timeGroupId));
				if(!is){
					log.error("TimeGroupNo Not Null");
					continue;
				}
				
				for(int i = 1; i <= 7; i++){
					//[CmdToken],[DoorPassword],{DoorNo},{HEX(TimeGroupId)},{TimeSpanChar}
					String TimeSpanChar = String.format("%s%s", CharToHex(timeSpanStr),i);
					String[] values = new String[]{"{DoorNo:"+doorNo+"}","{HEX(TimeGroupId):"+timeGroupId+"}","{TimeSpanChar:"+TimeSpanChar+"}"};
					String control = DoorGovernHelper.getInstance().SendDoorControl("AccessTimeSetting", equipmentId,
							"-1", "1001305001", "1", values);
					if(!control.equals("OK")) return "AccessTimeSetting Not Exist";
				}
			}
			return "OK";
		} catch (Exception e) {
			log.error("initTimeGroupCommand failed.", e);
			return "Database Exception";
		}
	}
	
	private Set<String> GetEquipmentsByDoorIds(String DoorId){
		DatabaseHelper dbHelper = null;
		Object res = null;
		Set<String> EIds = new HashSet<String>();
		try{
            dbHelper = new DatabaseHelper();
            String sql = String.format("SELECT EquipmentId FROM TBL_Door WHERE DoorId = %s;", DoorId);
            
            res = dbHelper.executeScalar(sql);
            if(res != null){
				EIds.add(res.toString());
			}
            return EIds;
		} catch (Exception e) {
			log.error("GetEquipmentsByDoorIds failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return EIds;
	}
	
	//000111101111111111101110 => 12C2933207437D08D3FFFFFFFFFFFFFFFFFF
	public static String CharToHex(String ch){
		String str = "";
		int count = 0;
		int last = 0;
		while(true){
			int min = ch.indexOf("1");
			if(min == -1) return "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
			ch = ch.substring(min);
			int max = ch.indexOf("0");
			if(max == -1)
				max = ch.length();
			ch = ch.substring(max);
			
			count ++;
            if(count == 1){
            	str += String.format("%s%s", DoorProvider.toThreeHexString(min*100),
            			DoorProvider.toThreeHexString(((min - 1 + max))*100+59));
                last = (min + max);
            }else{
            	str += String.format("%s%s", DoorProvider.toThreeHexString((last+min)*100),
            			DoorProvider.toThreeHexString(((last+min) - 1 + max)*100+59));
                last = ((last+min) + max);
            }
			if(count >= 6) break;

			if(ch.indexOf("1") == -1)
                break;
		}
		int rem = (36 - str.length()) / 6;
		for(int i = 0; i < rem; i++){
			str += "FFFFFF";
		}
		return str;
	}
	
	//12C2933207437D08D3FFFFFFFFFFFFFFFFFF => 000111101111111111101110
	public static String HexToChar(String he){
		String str = "";
		int index = 0;
		String hex = "";
		while(true){
			if(he.length() < 6) break;
			hex = he.substring(0,3);
			if(hex.equals("FFF")) break;
			he = he.substring(3);
			int min = Integer.valueOf(hex, 16)/100;
			hex = he.substring(0,3);
			he = he.substring(3);
			int max = Integer.valueOf(hex, 16)/100;
		
			//几个0
			for(int i = index;i < min; i++){
				str += "0";
			}
			//几个1
			for(int i = min;i <= max; i++){
				str += "1";
			}
			index = max+1;
			if(he.length() <= 3 || str.length() >= 24)
				break;
		}
		int length = 24 - str.length();
		for(int x = 0;x < length;x++){
			str += "0";
		}
		return str;
	}
}
