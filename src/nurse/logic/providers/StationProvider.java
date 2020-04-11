package nurse.logic.providers;

import java.text.DateFormat;
import java.util.ArrayList;
import org.apache.log4j.Logger;
import nurse.common.DataTable;
import nurse.entity.persist.Station;
import nurse.utility.DatabaseHelper;
import java.util.Date;
import java.text.SimpleDateFormat; 

public class StationProvider {

	private static StationProvider instance = new StationProvider();
	private static Logger log = Logger.getLogger(StationProvider.class);
	
	public StationProvider() {
	}
	
	public static StationProvider getInstance(){
		return instance;
	}

	public ArrayList<Station> GetAllStations() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Station\r\n");       
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return Station.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all stations", e);	
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
        return null;
	}
	
	public ArrayList<Station> GetStationByContactId(int ContactId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Station WHERE ContactId = %d\r\n");
            String sql = sb.toString();
            sql = String.format(sql, ContactId);
                        
            DataTable dt = dbHelper.executeToTable(sql);
            
            return Station.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to station by contactId", e);	
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
        return null;
	}
	
	public boolean UpdateStationInfo(int stationId, String stationName, int contactId, String remark)
	{
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sbStation=new StringBuilder();
            sbStation.append("UPDATE TBL_Station station\r\n");
            sbStation.append("SET station.StationName = '%s', station.Description = '%s', station.ContactId = %d\r\n");
            sbStation.append("WHERE station.StationId = %d");

            String sqlStation = sbStation.toString();
            sqlStation = String.format(sqlStation, stationName, remark, contactId, stationId);
            
            dbHelper.executeNoQuery(sqlStation);
            
            return true;
		} catch (Exception e) {
			log.error("UpdateStationInfo() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
	
	public int GetStationNums() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT COUNT(*) FROM TBL_Station");
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
			log.error("GetStationNums() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return iNums;
	}
	
	public boolean InitStationInfo()
	{
		DatabaseHelper dbHelper = null;
		try
        {
			Date date=new Date();  
			DateFormat format=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
			String time=format.format(date);
			long lTime = date.getTime();
			int stationId = (int)(lTime % 1000000000);
			
			//插入管理员信息
            int EmployeeId = EmployeeProvider.getInstance().InsertEmployee("默认管理员", "","");
            
			//插入局站信息
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("INSERT INTO TBL_Station (StationId, StationName, Latitude, Longitude, SetupTime, CompanyId, ConnectState, UpdateTime, StationCategory, \r\n");
            sbInsert.append("StationGrade, StationState, ContactId, SupportTime, OnWayTime, SurplusTime, FloorNo, PropList, Acreage, BuildingType, ContainNode, Description, \r\n");
            sbInsert.append("BordNumber, CenterId, Enable, StartTime, EndTime, ProjectName, ContractNo, InstallTime) \r\n");
            sbInsert.append("VALUES (%d, '默认局站', 0, 0, NULL, NULL, 2, '%s', 2, 1, 1, %d, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '', NULL, 755, 1, NULL, NULL, NULL, NULL, NULL)\r\n");

            String sqlStation = sbInsert.toString();
            sqlStation = String.format(sqlStation, stationId, time, EmployeeId);
            
            dbHelper.executeNoQuery(sqlStation);

            //插入局房
            StringBuilder sbHouse=new StringBuilder();
            sbHouse.append("INSERT INTO TBL_House (HouseId, StationId, HouseName, Description)\r\n");
            sbHouse.append("VALUES (1, %d, '默认房间', '默认房间')");
            String sqlHouse = sbHouse.toString();
            sqlHouse = String.format(sqlHouse, stationId);
            
            dbHelper.executeNoQuery(sqlHouse);
            
            //插入监控单元
            StringBuilder sbMonitorUnit=new StringBuilder();
            sbMonitorUnit.append("INSERT INTO TSL_MonitorUnit (MonitorUnitId, MonitorUnitName, MonitorUnitCategory, MonitorUnitCode, WorkStationId, StationId, IpAddress, RunMode,  \r\n");
            sbMonitorUnit.append("ConfigFileCode, ConfigUpdateTime, SampleConfigCode, SoftwareVersion, Description, StartTime, HeartbeatTime, ConnectState, UpdateTime, \r\n");
            sbMonitorUnit.append("IsSync, SyncTime, IsConfigOK, ConfigFileCode_Old, SampleConfigCode_Old, AppCongfigId, CanDistribute, Enable, ProjectName, ContractNo, InstallTime)\r\n");
            sbMonitorUnit.append("VALUES (%d, '监控单元', 2, '%d', NULL, %d, '127.0.0.1', 1, NULL, NULL, NULL, '', '', NULL, NULL, 2, '%s', 0, NULL, 0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL)");
		
            String sqlMonitorUnit = sbMonitorUnit.toString();
            sqlMonitorUnit = String.format(sqlMonitorUnit, stationId, stationId, stationId, time);
            
            dbHelper.executeNoQuery(sqlMonitorUnit);
            
            return true;
		} catch (Exception e) {
			log.error("InitStationInfo() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
}
