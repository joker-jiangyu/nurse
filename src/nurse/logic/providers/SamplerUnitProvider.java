package nurse.logic.providers;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import org.apache.log4j.Logger;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.SamplerUnit;
import nurse.utility.DatabaseHelper;


public class SamplerUnitProvider {

	private static SamplerUnitProvider instance = new SamplerUnitProvider();
	private static Logger log = Logger.getLogger(SamplerUnitProvider.class);
	private static int gSamplerUnitId = 755000001;
	
	public SamplerUnitProvider() {
	}
	
	public static SamplerUnitProvider getInstance(){
		return instance;
	}

	public ArrayList<SamplerUnit> GetDefaultSamplerUnit(int equipmentTemplateId, int portId, int portNo, int monitorUnitId) {
		DatabaseHelper dbHelper = null;

		ArrayList<SamplerUnit> ds = new ArrayList<SamplerUnit>();
		
        try
        {
            dbHelper = new DatabaseHelper();
            SamplerUnit d = new SamplerUnit();
            
            DataTable samplerTable = SamplerProvider.getInstance().GetSamplersByEquipTemplate(equipmentTemplateId);
            int rowCount = samplerTable.getRowCount();
            
            if (rowCount > 0)
            {
            	int samplerId = -1;
            	int samplerType = -1;
            	String samplerName = "";
            	String dllPath = "";
            	String soPath = "";
            	String dllPathPrefix = "";
            	
            	Date date=new Date();  
            	DataRowCollection drs = samplerTable.getRows();
            	
            	for(int i=0;i<rowCount;i++)
        		{
            		samplerId = (int) drs.get(i).getValue("SamplerId");
            		samplerType = (int) drs.get(i).getValue("SamplerType");
            		samplerName = (String) drs.get(i).getValue("SamplerName");
            		dllPath = (String) drs.get(i).getValue("DllPath");
            		soPath = (String) drs.get(i).getValue("SoPath");
        		}	

            	if (dllPath.trim().length() >0)
                {
                    dllPathPrefix = dllPath.substring(0, dllPath.indexOf("."));
                }
                else
                {
                    dllPathPrefix = soPath.substring(0, soPath.indexOf("."));
                }
            	
                d.SamplerUnitId = -1;
    			d.PortId = portId;
    			d.MonitorUnitId = monitorUnitId;
    			d.SamplerId = samplerId;
    			d.ParentSamplerUnitId = 0;
    			d.SamplerType = samplerType;
    			d.SamplerUnitName = GetDefaultSPUnitName(monitorUnitId, portNo, samplerName, samplerId);
    			d.Address = GetMaxDefaultAddress(monitorUnitId, portId);
    			d.SpUnitInterval = Float.parseFloat("2");
    			d.DllPath = dllPathPrefix + ".so";
    			d.ConnectState = 0;
    			d.UpdateTime = date;
    			d.PhoneNumber = "";
    			d.Description = "";
            }
            
            ds.add(d);
     
		} catch (Exception e) {
			log.error("GetDefaultSamplerUnit() failed.", e);
			
			return null;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        
        return ds;
	}
	
	private String GetDefaultSPUnitName(int monitorUnitId, int portNo, String samplerName, int samplerId)
    {
        String spUnitName = "";
        int counts = 1;

        counts = GetSPUnitCountsBySamplerInfo(monitorUnitId, portNo, samplerId);
        spUnitName = String.format("%d#%s", counts, samplerName);

        return spUnitName;
    }
	
	private int GetMaxDefaultAddress(int monitorUnitId, int portId)
    {
        DatabaseHelper dbHelper = null;
		Object res = null;
		int address = 1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT max(Address) FROM TSL_SamplerUnit WHERE MonitorUnitId=%d AND PortId=%d");
	            String sql = sb.toString();
	            sql = String.format(sql, monitorUnitId, portId);
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	address = 1;
				}
				else
				{
					address = Integer.parseInt(res.toString()) + 1;
				}

			} catch (Exception e) {
				log.error("GetMaxSamplerUnitId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return address;
    }
	
    public int GetSPUnitCountsBySamplerInfo(int MonitorUnitId, int PortNo, int SamplerId)
    {
    	DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT count(*) FROM TSL_SamplerUnit \r\n");
	            sb.append("WHERE MonitorUnitId=%d AND SamplerId=%d \r\n");
	            sb.append("AND PortId IN(SELECT PortId FROM TSL_Port WHERE PortNo=%d)");
	            String sql = sb.toString();
	            sql = String.format(sql, MonitorUnitId, SamplerId, PortNo);
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iNums = 1;
				}
				else
				{
					iNums = Integer.parseInt(res.toString()) + 1;
				}

			} catch (Exception e) {
				log.error("GetSPUnitCountsBySamplerInfo() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iNums;
    }
    
  //根据时间戳生成ID
  	public int GenerateSamplerUnitId()
  	{
  		Date date=new Date();  
  		long lTime = date.getTime();
  		int samplerUnitId = (int)(lTime % 1000000000);
  		
  		return samplerUnitId;
  	}
  	
	public int GetMaxSamplerUnitId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(SamplerUnitId) FROM TSL_SamplerUnit");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = gSamplerUnitId++;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					iMaxId++;
					gSamplerUnitId = iMaxId;
				}

			} catch (Exception e) {
				log.error("GetMaxSamplerUnitId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
	public boolean InsertSamplerUnit(int SamplerUnitId,
            int PortId,
            int MonitorUnitId,
            int SamplerId,
            int ParentSamplerUnitId,
            int SamplerType,
            String SamplerUnitName,
            int Address,
            Float SpUnitInterval,
            String DllPath,
            int ConnectState,
            Date UpdateTime,
            String PhoneNumber,
            String Description)
        {
            DatabaseHelper dbHelper = null;
    		try
            {		
                dbHelper = new DatabaseHelper();
                StringBuilder sbInsert=new StringBuilder();
                sbInsert.append("INSERT INTO TSL_SamplerUnit (SamplerUnitId, PortId, MonitorUnitId, SamplerId, ParentSamplerUnitId, SamplerType, SamplerUnitName, Address, SpUnitInterval,\r\n");
                sbInsert.append("DllPath, ConnectState, UpdateTime, PhoneNumber, Description)\r\n");
                sbInsert.append("VALUES (%d, %d, %d, %d, %d, %d, '%s', %d, %f, '%s', %d, '%s', '%s', '%s')");

                DateFormat format=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
                String time=format.format(UpdateTime);
                
                String sql = sbInsert.toString();
                sql = String.format(sql, SamplerUnitId, PortId, MonitorUnitId, SamplerId,
                        ParentSamplerUnitId, SamplerType, SamplerUnitName, Address, SpUnitInterval,
                        DllPath, ConnectState, time, PhoneNumber, Description);
                
                dbHelper.executeNoQuery(sql);
                
                return true;
    		} catch (Exception e) {
    			log.error("InsertSamplerUnit() failed.", e);
    		} finally {
    			if(dbHelper != null) dbHelper.close();
    		}
    		
    		return false;
        }
	
	
	
	public boolean UpdateSamplerUnit(int SamplerUnitId,
            int PortId,
            int MonitorUnitId,       
            int Address,
            String DllPath)
        {
            DatabaseHelper dbHelper = null;
    		try
            {		
                dbHelper = new DatabaseHelper();
                StringBuilder sbInsert=new StringBuilder();
                sbInsert.append("UPDATE TSL_SamplerUnit SET Address = %d, DllPath = '%s'\r\n");
                sbInsert.append("WHERE MonitorUnitId = %d AND SamplerUnitId = %d AND PortId = %d\r\n");

                String sql = sbInsert.toString();
                sql = String.format(sql, Address, DllPath, MonitorUnitId, SamplerUnitId, PortId);
                
                dbHelper.executeNoQuery(sql);
                
                return true;
    		} catch (Exception e) {
    			log.error("UpdateSamplerUnit() failed.", e);
    		} finally {
    			if(dbHelper != null) dbHelper.close();
    		}
    		
    		return false;
        }

}
