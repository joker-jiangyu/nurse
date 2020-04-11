package nurse.logic.providers;

import java.util.ArrayList;
import java.util.Date;

import org.apache.log4j.Logger;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.Port;
import nurse.entity.persist.SmsPort;
import nurse.utility.DatabaseHelper;


public class PortProvider {

	private static PortProvider instance = new PortProvider();
	private static Logger log = Logger.getLogger(PortProvider.class);
	private static int gPortId = 755000001;
	
	public PortProvider() {
	}
	
	public static PortProvider getInstance(){
		return instance;
	}

	public ArrayList<Port> GetDefaultPort(int monitorUnitId, int portNo) {
		DatabaseHelper dbHelper = null;

		ArrayList<Port> ds = new ArrayList<Port>();
		
        try
        {
            dbHelper = new DatabaseHelper();
            Port d = new Port();
            
            boolean findPort = false;
            DataTable tbPort = GetPortsInfoByMUId(monitorUnitId);
            int rowCount = tbPort.getRowCount();
            
            if (rowCount > 0)
            {
            	DataRowCollection drs = tbPort.getRows();
        		
        		for(int i=0;i<rowCount;i++)
        		{
        			int findPortNo = (int) drs.get(i).getValue("PortNo");
        			if(findPortNo == portNo)
        			{
        				findPort = true;
        				d.PortId = (int) drs.get(i).getValue("PortId");
        				d.MonitorUnitId = (int) drs.get(i).getValue("MonitorUnitId");
        				d.PortNo = (int) drs.get(i).getValue("PortNo");
        				d.PortName = (String) drs.get(i).getValue("PortName");
        				d.PortType = (int) drs.get(i).getValue("PortType");
        				d.Setting = (String) drs.get(i).getValue("Setting");
        				d.PhoneNumber = (String) drs.get(i).getValue("PhoneNumber");
        				d.LinkSamplerUnitId = (Integer) drs.get(i).getValue("LinkSamplerUnitId");
        				d.Description = (String) drs.get(i).getValue("Description");
        				
                        break;
        			}
        		}	
            }
            if (!findPort)
            {
            	d.PortId = -1;
                d.MonitorUnitId = monitorUnitId;
                d.PortName = "COM" + portNo;
                d.PortNo = portNo;
                
                if(portNo == 106){// IO设备
                	//虚拟口
                	d.Setting = "comm_io_dev.so";
                	d.PortType = 5;
                }else if(portNo == 31){//自诊断设备
					//虚拟口
					d.Setting = "comm_host_dev.so";
					d.PortType = 5;
				}else if(portNo > 200){
                	//一般逻辑串口
                	d.Setting = "127.0.0.1:7070";
                	d.PortType = 19;
                }
                else if(portNo >= 100)
                {
                	//网口
                	d.Setting = "127.0.0.1:7070";
                	d.PortType = 6;
                }
                else
                {
                	d.PortType = 1;
                	d.Setting = "9600,n,8,1";
                }
                d.PhoneNumber = "";
                d.LinkSamplerUnitId = 0;
                d.Description = "";
            }
            
            ds.add(d);
            
		} catch (Exception e) {
			log.error("GetDefaultPort() failed.", e);
			
			return null;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        
        return ds;
	}
	
	//根据时间戳生成ID
	public int GeneratePortId()
	{
		Date date=new Date();  
		long lTime = date.getTime();
		int portId = (int)(lTime % 1000000000);
		
		return portId;
	}
	
	public int GetMaxPortId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(PortId) FROM TSL_Port");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = gPortId++;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					iMaxId++;
					gPortId = iMaxId;
				}

			} catch (Exception e) {
				log.error("GetMaxPortId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}

	public DataTable GetPortsInfoByMUId(int monitorUnitId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TSL_Port WHERE MonitorUnitId= %d");               
            String sql = sb.toString();
            sql = String.format(sql, monitorUnitId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return dt;
		} catch (Exception e) {
			log.error("GetPortsInfoByMUId() failed.", e);
			
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		
	}
	
	public boolean InsertPort(int PortId,
            int MonitorUnitId,
            int PortNo,
            String PortName,
            int PortType,
            String Setting,
            String PhoneNumber,
            int LinkSamplerUnitId,
            String Description)
	{
		DatabaseHelper dbHelper = null;
		try
        {		
			//����˿�
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("INSERT INTO TSL_Port (PortId, MonitorUnitId, PortNo, PortName, PortType, Setting, PhoneNumber, LinkSamplerUnitId, Description)\r\n");
            sbInsert.append("VALUES (%d, %d, %d, '%s', %d, '%s', '%s', %d, '%s')");

            if(PortType == 3)
            	PhoneNumber = Setting;
            
            String sql = sbInsert.toString();
            sql = String.format(sql, PortId, MonitorUnitId, PortNo, PortName, PortType, Setting, PhoneNumber,
                    LinkSamplerUnitId, Description);
            
            dbHelper.executeNoQuery(sql);
            
            return true;
		} catch (Exception e) {
			log.error("InsertPort() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
	
	public boolean UpdatePort(int PortId,
            int MonitorUnitId,
            int PortType,
            String Setting,
            String PhoneNumber
            )
	{
		DatabaseHelper dbHelper = null;
		try
        {		
			//����˿�
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("UPDATE TSL_Port SET PortType = %d, Setting = '%s', PhoneNumber = '%s'\r\n");
            sbInsert.append("WHERE MonitorUnitId = %d AND PortId = %d");

            if(PortType == 3)
            	PhoneNumber = Setting;
            
            String sql = sbInsert.toString();
            sql = String.format(sql, PortType, Setting,PhoneNumber, MonitorUnitId, PortId);
            
            dbHelper.executeNoQuery(sql);
            
            return true;
		} catch (Exception e) {
			log.error("UpdatePort() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
	
	public ArrayList<SmsPort> GetDefaultSmsPort() {
		DatabaseHelper dbHelper = null;

		ArrayList<SmsPort> ds = new ArrayList<SmsPort>();
		
        try
        {
            dbHelper = new DatabaseHelper();
            SmsPort d = new SmsPort();
            
            //boolean findPort = false;
            DataTable tbSmsPort = GetSmsPort();
            int rowCount = tbSmsPort.getRowCount();
            
            if (rowCount > 0)
            {
            	DataRowCollection drs = tbSmsPort.getRows();
        		
            	d.PortNo = (String) drs.get(0).getValue("PortNo");
				d.BaudRate = (String) drs.get(0).getValue("BaudRate");
				d.SmsType = (int) drs.get(0).getValue("SmsType");	
            }
            else
            {
            	d.PortNo = "COM1";
            	d.BaudRate = "9600,n,8,1";
				d.SmsType = 1;	
            }
            
            ds.add(d);
            
		} catch (Exception e) {
			log.error("GetDefaultSmsPort() failed.", e);
			
			return null;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        
        return ds;
	}
	
	public DataTable GetSmsPort() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM nt_smsport");               
            String sql = sb.toString();
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return dt;
		} catch (Exception e) {
			log.error("GetSmsPort() failed.", e);
			
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}	
	}
	
	public int GetSmsPortNums(){
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT COUNT(*) FROM nt_smsport");
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
				log.error("GetSmsPortNums() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iNums;
	}
	
	public boolean InsertSmsPort(String portNo,
            String baudRate,
            int smsType)
	{
		DatabaseHelper dbHelper = null;
		try
        {		
			//����˿�
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("INSERT INTO nt_smsport (PortNo, BaudRate, SmsType)\r\n");
            sbInsert.append("VALUES ('%s', '%s', %d)");

            String sql = sbInsert.toString();
            sql = String.format(sql, portNo, baudRate, smsType);
            
            dbHelper.executeNoQuery(sql);
            
            return true;
		} catch (Exception e) {
			log.error("InsertSmsPort() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
	
	public boolean UpdateSmsPort(String portNo,
            String baudRate,
            int smsType)
	{
		DatabaseHelper dbHelper = null;
		try
        {		
			//����˿�
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("UPDATE nt_smsport SET PortNo = '%s', BaudRate = '%s', SmsType = '%d'\r\n");

            String sql = sbInsert.toString();
            sql = String.format(sql, portNo, baudRate, smsType);
            
            dbHelper.executeNoQuery(sql);
            
            return true;
		} catch (Exception e) {
			log.error("UpdateSmsPort() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
}
