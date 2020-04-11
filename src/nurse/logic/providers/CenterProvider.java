package nurse.logic.providers;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import org.apache.log4j.Logger;
import nurse.common.DataTable;
import nurse.entity.persist.Center;
import nurse.utility.DatabaseHelper;

public class CenterProvider {

	private static CenterProvider instance = new CenterProvider();
	private static Logger log = Logger.getLogger(CenterProvider.class);
	
	public CenterProvider() {
	}
	
	public static CenterProvider getInstance(){
		return instance;
	}

	public ArrayList<Center> GetAllCenters() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT center.*, ws.IPAddress FROM TBL_SyncCenter center, TBL_WorkStation ws\r\n");       
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return Center.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all centers", e);	
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
        return null;
	}
	
	public boolean UpdateCenterInfo(int centerId, String centerIP, int centerPort, boolean centerEnable)
	{
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sbStation=new StringBuilder();
            sbStation.append("UPDATE TBL_SyncCenter center\r\n");
            sbStation.append("SET center.CenterIP = '%s', center.centerPort = %d, center.Enable = %b\r\n");
            sbStation.append("WHERE center.CenterId = %d");

            String sqlStation = sbStation.toString();
            sqlStation = String.format(sqlStation, centerIP, centerPort, centerEnable, centerId);
            
            dbHelper.executeNoQuery(sqlStation);
            
            return true;
		} catch (Exception e) {
			log.error("UpdateCenterInfo() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
	
	public int GetCenterNums() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT COUNT(*) FROM TBL_SyncCenter");
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
			log.error("GetCenterNums() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return iNums;
	}
	
	public boolean InitCenterInfo()
	{
		DatabaseHelper dbHelper = null;
		try
        {
			//插入中心信息
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("INSERT INTO TBL_SyncCenter (CenterId, CenterIP, CenterPort, Enable, IsNeedSync, SyncTime, Description, ExtendField1, ExtendField2)\r\n");
            sbInsert.append("VALUES (%d, '%s', %d, %d, %d, NULL, NULL, NULL, NULL)\r\n");

            String sqlCenter = sbInsert.toString();
            sqlCenter = String.format(sqlCenter, 1, "", 15001, 0, 0);
            
            dbHelper.executeNoQuery(sqlCenter);
            
            return true;
		} catch (Exception e) {
			log.error("InitCenterInfo() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
}
