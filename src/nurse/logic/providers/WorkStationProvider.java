package nurse.logic.providers;


import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.log4j.Logger;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.DatabaseHelper;


public class WorkStationProvider {

	private static WorkStationProvider instance = new WorkStationProvider();
	private static Logger log = Logger.getLogger(WorkStationProvider.class);
	
	public WorkStationProvider() {
	}
	
	public static WorkStationProvider getInstance(){
		return instance;
	}
	
	public boolean UpdateWorkStationInfo(String DSIP, boolean isUsed)
	{
		try
        {
			int dsNums = GetDSNums();
			if(dsNums <= 0)
			{
				//没有ds信息，需要插入ds
				InsertDS(DSIP, isUsed);
			}
			else
			{
				//更新DSIP
				UpdateDS(DSIP, isUsed);
			}

            return true;
		} catch (Exception e) {
			log.error("UpdateWorkStationInfo() failed.", e);
		} finally {
		}
		
		return false;
	}
	
	public int GetDSNums() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT COUNT(*) FROM TBL_WorkStation WHERE WorkStationType = 2");
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
			log.error("GetDSNums() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return iNums;
	}
	
	public boolean InsertDS(String DSIP, boolean isUsed)
	{
		DatabaseHelper dbHelper = null;
		try
        {
			dbHelper = new DatabaseHelper();
			Date date=new Date();  
			DateFormat format=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
			String time=format.format(date);
			long lTime = date.getTime();
			int workStationId = (int)(lTime % 1000000000);

            //插入WorkStation
            StringBuilder sbDS=new StringBuilder();
            sbDS.append("INSERT INTO TBL_WorkStation (WorkStationId, WorkStationName, WorkStationType, IPAddress, ParentId, ConnectState,   \r\n");
            sbDS.append("UpdateTime, IsUsed, CPU, Memory, ThreadCount, DiskFreeSpace, DBFreeSpace, LastCommTime)\r\n");
            sbDS.append("VALUES (%d, '数据服务器', 2, '%s', 0, 2, '%s', %b, NULL, NULL, NULL, NULL, NULL, NULL)");
		
            String sqlDS = sbDS.toString();
            sqlDS = String.format(sqlDS, workStationId, DSIP, time, isUsed);
            
            dbHelper.executeNoQuery(sqlDS);
            
            return true;
		} catch (Exception e) {
			log.error("InsertDS() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
	
	public DataTable GetAllWorkStationByType(int type)
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROm TBL_WorkStation WHERE WorkStationType=%d";
			sql = String.format(sql, type);
			dt = dbHelper.executeToTable(sql);
			

		} catch (Exception e) {
			log.error("GetAllWorkStationByType() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return dt;
	}
	
	public void UpdateDS(String DSIP, boolean isUsed)
	{
		DataTable dtDS = GetAllWorkStationByType(2);
		int rowCount = dtDS.getRowCount();
		DataRowCollection drs = dtDS.getRows();
    	
    	if(rowCount > 0)
		{
    		int workStationId = (int) drs.get(0).getValue("WorkStationId");
    		UpdateDSIP(workStationId, DSIP, isUsed);
		}
	}
	
	public boolean UpdateDSIP(int WorkStationId, String DSIP, boolean isUsed)
	{
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sbStation=new StringBuilder();
            sbStation.append("UPDATE TBL_WorkStation ws\r\n");
            sbStation.append("SET ws.IPAddress = '%s', ws.IsUsed = %b\r\n");
            sbStation.append("WHERE ws.WorkStationId = %d");

            String sqlStation = sbStation.toString();
            sqlStation = String.format(sqlStation, DSIP, isUsed, WorkStationId);
            
            dbHelper.executeNoQuery(sqlStation);
            
            return true;
		} catch (Exception e) {
			log.error("UpdateDSIP() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
}
