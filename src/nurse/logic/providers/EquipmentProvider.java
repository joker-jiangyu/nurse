package nurse.logic.providers;

import java.io.File;
import java.sql.CallableStatement;
import java.sql.Types;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import nurse.entity.persist.Port;
import nurse.utility.BasePath;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.Equipment;
import nurse.entity.persist.EquipmentTemplate;
import nurse.utility.DatabaseHelper;


public class EquipmentProvider {

	private static EquipmentProvider instance = new EquipmentProvider();
	private static Logger log = Logger.getLogger(EquipmentProvider.class);
	private static int gEquipmentId = 100000001;
	//需要备份的表名
	private static final String[] backupNameList = new String[]{
			"tbl_signal","tbl_signalbaseconfirm","tbl_signalbasedic","tbl_signalbasemap",
			"tbl_signalmeanings","tbl_signalproperty","tbl_signalstatistics","tbl_signalstatisticsmid",
			"tbl_equipment","tbl_equipmenttemplate","tbl_event","tbl_eventbaseconfirm",
			"tbl_eventbasedic","tbl_eventbasemap","tbl_eventcondition","tbl_eventmask",
			"tbl_eventmaskhistory","tbl_control","tbl_controlbaseconfirm","TBL_EventLogAction",
			"tbl_controllogaction","tbl_controlmeanings","TBL_Station","TSL_Sampler","TSL_SamplerUnit","TSL_Port"};
	
	public EquipmentProvider() {
	}
	
	public static EquipmentProvider getInstance(){
		return instance;
	}

	public ArrayList<Equipment> GetDefaultEquipment(int monitorUnitId, int equipmentTemplateId) {
		DatabaseHelper dbHelper = null;
		String equipName = "";
		int equipmentType = -1;
		ArrayList<Equipment> ds = new ArrayList<Equipment>();
		
        try
        {
            dbHelper = new DatabaseHelper();
            Equipment d = new Equipment();
            
            ArrayList<EquipmentTemplate> equipTemplate = EquipmentTemplateProvider.getInstance().GetEquipmentTemplate(equipmentTemplateId);
            if (null != equipTemplate && equipTemplate.size() > 0)
            {
            	for(EquipmentTemplate a : equipTemplate)
        		{
            		equipName = a.EquipmentTemplateName;
            		
            		if(a.EquipmentBaseType != null)
            		{
            			equipmentType = a.EquipmentBaseType;
            		}
            		else
            		{
            			equipmentType = a.EquipmentType;
            		}
        		}
                		
                int equipCounts = GetDistinctEquipCountsByMUId(monitorUnitId, equipmentTemplateId);
                if (equipCounts > 0)
                {
                    equipName = String.format("%s%d", equipName, equipCounts+1);
                }
            }
            
            d.EquipmentName = equipName;
            d.EquipmentId = -1;
            d.EquipmentType = equipmentType;
            
            ds.add(d);
            
		} catch (Exception e) {
			log.error("GetDefaultEquipment() failed.", e);
			
			return null;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        
        return ds;
	}
	
	
	public ArrayList<Equipment> GetAllEquipments() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT equipment.*, su.Address, su.DllPath, port.PortNo, port.Setting FROM TBL_Equipment equipment\r\n");  
            sb.append("LEFT JOIN TSL_SamplerUnit su ON su.SamplerUnitId = equipment.SamplerUnitId\r\n"); 
            sb.append("LEFT JOIN TSL_Port port ON su.PortId = port.PortId\r\n"); 
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return Equipment.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all equipment", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<Equipment> GetLimitEquipments(int index, int size){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT equipment.*, su.Address, su.DllPath, port.PortNo, port.PortType, port.Setting FROM TBL_Equipment equipment\r\n");  
            sb.append("LEFT JOIN TSL_SamplerUnit su ON su.SamplerUnitId = equipment.SamplerUnitId\r\n"); 
            sb.append("LEFT JOIN TSL_Port port ON su.PortId = port.PortId\r\n"); 
            sb.append("ORDER BY equipment.UpdateTime DESC\r\n");
            sb.append("LIMIT %d,%d\r\n");
            String sql = sb.toString();
            
            sql = String.format(sql, index, size);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return Equipment.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read limit equipment", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public int GetEquipmentNums(){
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT COUNT(*) FROM TBL_Equipment");
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
	
	//����MonitorUnitId��ѯTBL_Equipment
    public DataTable GetEquipmentsByMUId(int monitorUnitId)
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM TBL_Equipment WHERE MonitorUnitId=%d";
			sql = String.format(sql, monitorUnitId);
			dt = dbHelper.executeToTable(sql);
			

		} catch (Exception e) {
			log.error("GetEquipmentsByMUId() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return dt;
	}
    
    public boolean DelEquipment(int StationId, int EquipmentId) {
		
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format(" call PCT_DeleteEquipment(%d, %d)", StationId, EquipmentId);
            dbHelper.executeNoQuery(sql);
			
			return true;

		} catch (Exception e) {
			log.error("DelEquipment() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return false;
				
	}

    //重新加载设备，使配置生效
    public boolean ReloadEquipment(int StationId, String StationName) {

    	DatabaseHelper dbHelper = null;
		try {
			Date date=new Date();  
			DateFormat format=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
			String time=format.format(date);
			
			dbHelper = new DatabaseHelper();

			StringBuilder sb = new StringBuilder();
            sb.append("INSERT INTO TBL_ActiveControl (StationId, StationName, EquipmentId, EquipmentName, ControlId, ControlName, ControlSeverity, CmdToken, ControlPhase, StartTime, ParameterValues)\r\n");  
            sb.append("VALUES (%d, '%s', 9999, '', 9999, '配置生效', -1, '', -1, '%s', '')\r\n"); 
            String sql = sb.toString();
            sql = String.format(sql, StationId, StationName, time);
            
            dbHelper.executeNoQuery(sql);

			return true;

		} catch (Exception e) {
			log.error("ReloadEquipment() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

		return false;
    }
    
	public int GetMaxEquipmentId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(EquipmentId) FROM TBL_Equipment");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = gEquipmentId++;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					iMaxId++;
					gEquipmentId = iMaxId;
				}

			} catch (Exception e) {
				log.error("GetMaxEquipmentId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
	//根据时间戳生成ID
	public int GenerateEquipmentId()
	{
		Date date=new Date();  
		long lTime = date.getTime();
		int equipmentId = (int)(lTime % 1000000000);
		
		return equipmentId;
	}
		
	//��ѯͬһ��ص�Ԫ�£���ͬ���豸��
    public int GetDistinctEquipCountsByMUId(int monitorUnitId, int equipTemplateId)
    {
    	DatabaseHelper dbHelper = null;
		Object res = null;
		int iCounts = 0;
		
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT count(*) FROM TBL_Equipment WHERE MonitorUnitId=%d AND EquipmentTemplateId=%d");
            String sql = sb.toString();
            sql = String.format(sql, monitorUnitId, equipTemplateId);
            
            res = dbHelper.executeScalar(sql);
            if(res == null)
			{
            	iCounts = 0;
			}
			else
			{
				iCounts = Integer.parseInt(res.toString());
			}

		} catch (Exception e) {
			log.error("GetDistinctEquipCountsByMUId() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return iCounts;

    }
    
    public boolean InsertEquipment(int StationId,
            int EquipmentId,
            String EquipmentName,
            String EquipmentNo,
            String EquipmentModule,
            String EquipmentStyle,
            int EquipmentCategory,
            int EquipmentType,
            int EquipmentClass,
            int EquipmentState,
            String EventExpression,
            String Property,
            String Description,
            int EquipmentTemplateId,
            int HouseId,
            int MonitorUnitId,
            int SamplerUnitId,
            int DisplayIndex,
            int ConnectState,
            String UpdateTime,
            String Vendor,
            String Unit,
            String InstalledModule)
	{
		DatabaseHelper dbHelper = null;
		try
        {	
			//�����豸
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("INSERT INTO TBL_Equipment (StationId, EquipmentId, EquipmentName, EquipmentNo, EquipmentModule, \r\n");
            sbInsert.append("EquipmentStyle, EquipmentCategory, EquipmentType, EquipmentClass, EquipmentState, EventExpression, \r\n");
            sbInsert.append("StartDelay, EndDelay, Property, Description, EquipmentTemplateId, HouseId, MonitorUnitId, WorkStationId, \r\n");
            sbInsert.append("SamplerUnitId, DisplayIndex, ConnectState, UpdateTime, ParentEquipmentId, Vendor, Unit, InstalledModule, InstallTime)\r\n");
            sbInsert.append("VALUES (%d, %d, '%s', '%s', '%s', '%s', %d, %d, %d, %d, '%s', %s, %s, '%s', '%s', \r\n");
            sbInsert.append("%d, %d, %d, %s, %d, %d, %d, '%s', %s, '%s', '%s', '%s', SYSDATE())");

            String sql = sbInsert.toString();
            sql = String.format(sql, StationId, EquipmentId, EquipmentName, EquipmentNo, EquipmentModule,
            		EquipmentStyle, EquipmentCategory, EquipmentType, EquipmentClass,
            		EquipmentState, EventExpression, "null", "null", Property, Description, EquipmentTemplateId,
            		HouseId, MonitorUnitId, "null", SamplerUnitId,
            		DisplayIndex, ConnectState, UpdateTime,  "null", Vendor, Unit, InstalledModule);
            
            dbHelper.executeNoQuery(sql);
            
            return true;
		} catch (Exception e) {
			log.error("InsertEquipment() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}

    public boolean deleteActiveeventByEquipmentId(int equipmentId){
    	DatabaseHelper dbHelper = null;
    	try {
    		dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM tbl_activeevent WHERE EquipmentId = %s;", equipmentId);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return false;
    }
    
    public ArrayList<Equipment> GetIOEquipmentsByStationId(int stationId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
        	dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT equipment.* FROM TBL_Equipment equipment \r\n");      
            sb.append("LEFT JOIN TSL_SamplerUnit samplerUnit ON equipment.MonitorUnitId = samplerUnit.MonitorUnitId AND equipment.SamplerUnitId = samplerUnit.SamplerUnitId \r\n");
            sb.append("LEFT JOIN TSL_Port port ON port.MonitorUnitId = samplerUnit.MonitorUnitId AND port.PortId = samplerUnit.PortId \r\n");
            sb.append("WHERE equipment.StationId = %d AND port.Setting = 'comm_io_dev.so'");
            String sql = sb.toString();
            sql = String.format(sql, stationId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return Equipment.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetIOEquipmentsByStationId() failed.", e);	
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
        return null;
	}
    
    public int GetPortIdByEquipmentId(int EquipmentId) {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int portId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT port.PortId FROM TBL_Equipment equipment \r\n");
	            sb.append("LEFT JOIN TSL_SamplerUnit samplerUnit ON equipment.SamplerUnitId = samplerUnit.SamplerUnitId AND equipment.MonitorUnitId = samplerUnit.MonitorUnitId \r\n");
	            sb.append("LEFT JOIN TSL_Port port ON samplerUnit.PortId = port.PortId AND samplerUnit.MonitorUnitId = port.MonitorUnitId \r\n");
	            sb.append("WHERE equipment.EquipmentId = %d ");
	            String sql = sb.toString();
	            sql = String.format(sql, EquipmentId);
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	portId = -1;
				}
				else
				{
					portId = Integer.parseInt(res.toString());
				}

			} catch (Exception e) {
				log.error("GetPortIdByEquipmentId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return portId;		
	}
    
    public int GetEquipmentsBySamplerUnitId(int SamplerUnitId) {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int equipments = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT COUNT(*) FROM TBL_Equipment WHERE SamplerUnitId = %d");
	            String sql = sb.toString();
	            sql = String.format(sql, SamplerUnitId);
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	equipments = -1;
				}
				else
				{
					equipments = Integer.parseInt(res.toString());
				}

			} catch (Exception e) {
				log.error("GetEquipmentsBySamplerUnitId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return equipments;
				
	}
    
    public int GetSmaplerUnitsByPortId(int PortId) {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int samplerUnits = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT COUNT(*) FROM TSL_SamplerUnit WHERE PortId = %d");
	            String sql = sb.toString();
	            sql = String.format(sql, PortId);
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	samplerUnits = -1;
				}
				else
				{
					samplerUnits = Integer.parseInt(res.toString());
				}

			} catch (Exception e) {
				log.error("GetSmaplerUnitsByPortId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return samplerUnits;
				
	}
    
  //删除端口
    public boolean DelPort(int PortId){
    	DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format(" call PCT_DeletePort(%d)", PortId);
            dbHelper.executeNoQuery(sql);
			
			return true;

		} catch (Exception e) {
			log.error("DelPort() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}			
		
		return false;
    }
    
  //删除采集单元
    public boolean DelSamplerUnit(int SamplerUnitId){
    	DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format(" call PCT_DeleteSamplerUnit(%d)", SamplerUnitId);
            dbHelper.executeNoQuery(sql);
			
			return true;

		} catch (Exception e) {
			log.error("DelSamplerUnit() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}			
		
		return false;
			
    }
    
    /**
     * 备份设备配置数据
     */
    public void BackupEquipmentData(){
    	DatabaseHelper dbHelper = null;
    	try {
			dbHelper = new DatabaseHelper();
			
			int number = 0;
			String sql = "";
			for(int i = 0;i < backupNameList.length; i++){
				sql = String.format("SELECT COUNT(*) FROM %s;", backupNameList[i]);
				number = Integer.parseInt(dbHelper.executeScalar(sql).toString());
				//清除原来备份数据
				sql = String.format("DELETE FROM %sbak;", backupNameList[i]);
				dbHelper.executeNoQuery(sql);
				if(number > 0){
					sql = String.format("INSERT INTO %sbak SELECT * FROM %s;", 
							backupNameList[i],backupNameList[i]);
					dbHelper.executeNoQuery(sql);
				}
			}
		} catch (Exception e) {
			log.error("Database access exception:"+e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
    }
    /**
     * 还原设备配置数据
     */
    public void RestoreEquipmentData(){
    	DatabaseHelper dbHelper = null;
    	try {
			dbHelper = new DatabaseHelper();
			
			int number = 0;
			String sql = "";
			for(int i = 0;i < backupNameList.length; i++){
				sql = String.format("SELECT COUNT(*) FROM %s;", backupNameList[i]);
				number = Integer.parseInt(dbHelper.executeScalar(sql).toString());
				if(number == 0){
					sql = String.format("INSERT INTO %s SELECT * FROM %sbak;", 
							backupNameList[i],backupNameList[i]);
					int insertNum = dbHelper.executeNoQuery(sql);
					if(insertNum > 0) log.info(backupNameList[i]+" Restore Number:"+insertNum);
				}
			}
		} catch (Exception e) {
			log.error("Database access exception:"+e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
    }
    
    public String updateEquipment(int equipmentId,String equipmentName,String vendor,int samplerUnitId){
    	DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			/*String sql = String.format(" call PRO_UpdateEqupment(%d,'%s','%s',%d,'%s','%s','%s')",
					equipmentId,equipmentName,vendor,portNo,portType,setting,address);
            dbHelper.executeNoQuery(sql);*/
			Date date = new Date();
			DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			String updateTime = format.format(date);

			String sql = String.format("UPDATE TBL_Equipment SET EquipmentName = '%s' , Vendor = '%s' , SamplerUnitId = %s , UpdateTime = '%s' WHERE EquipmentId = %s;",
					equipmentName,vendor,samplerUnitId,updateTime,equipmentId);
			dbHelper.executeNoQuery(sql);

			//清理未使用的TSL_Port与TSL_SamplerUnit
			CleanExtraSamplerUnit();//因为根据设备判断，所有先修改Equipment后再清理
			CleanExtraPort();//因为根据采集单元判断，所有先修改SamplerUnit后再清理

			return "OK";
		} catch (Exception e) {
			log.error("UpdateEquipment() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		return "ERROR";
    }

    private void CleanExtraPort(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("DELETE FROM TSL_Port WHERE TSL_Port.PortId IN ( ");
			sb.append("	SELECT * FROM ( ");
			sb.append("		SELECT A.PortId FROM TSL_Port A ");
			sb.append("		LEFT JOIN TSL_SamplerUnit B ON A.PortId = B.PortId ");
			sb.append("		WHERE B.PortId IS NULL ");
			sb.append(" ) D ");
			sb.append(");");
			dbHelper.executeNoQuery(sb.toString());
			System.out.println(sb.toString());

		} catch (Exception e) {
			log.error("CleanExtraPort() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	private void CleanExtraSamplerUnit(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("DELETE FROM TSL_SamplerUnit WHERE TSL_SamplerUnit.SamplerUnitId IN ( ");
			sb.append("	SELECT * FROM ( ");
			sb.append("		SELECT A.SamplerUnitId FROM TSL_SamplerUnit A  ");
			sb.append("		LEFT JOIN TBL_Equipment B ON A.SamplerUnitId = B.SamplerUnitId ");
			sb.append("		WHERE B.SamplerUnitId IS NULL ");
			sb.append(" ) D ");
			sb.append(");");
			dbHelper.executeNoQuery(sb.toString());
			System.out.println(sb.toString());

		} catch (Exception e) {
			log.error("CleanExtraSamplerUnit() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
    
    public String checkEquipmentConfig(int equipmentId,String equipmentName,int portNo,String address){
    	DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
            
            CallableStatement stat = dbHelper.prepareProcedure("PRO_CheckEqupmentConfig","?,?,?,?,?");
			stat.setInt(1, equipmentId);
			stat.setString(2, equipmentName);
			stat.setInt(3, portNo);
			stat.setString(4, address);
			stat.registerOutParameter(5,Types.VARCHAR);
			stat.execute();
			
			String result = stat.getString(5);
			return result;
		} catch (Exception e) {
			log.error("checkEquipmentConfig() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		return "ERROR";
    }

    public String rebindingEquipmentTemplate(int equipmentId,int equipmentTemplateId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			ArrayList<EquipmentTemplate> equipmentTemplates = EquipmentTemplateProvider.getInstance().GetEquipmentTemplate(equipmentTemplateId);

			String Vendor = "";
			String Unit = "";
			int EquipmentCategory = 99;
			int EquipmentType = 1;
			String Property = "";

			if(equipmentTemplates.size() > 0){
				EquipmentTemplate equipmentTemplate = equipmentTemplates.get(0);
				Vendor = equipmentTemplate.Vendor == null ? "" : equipmentTemplate.Vendor;
				Unit = equipmentTemplate.Unit == null ? "" : equipmentTemplate.Unit;
				EquipmentCategory = equipmentTemplate.EquipmentCategory;
				EquipmentType = equipmentTemplate.EquipmentType;
				Property = equipmentTemplate.Property == null ? "" : equipmentTemplate.Property;
			}

			Date date = new Date();
			DateFormat format=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			String UpdateTime=format.format(date);

			String sql = String.format("UPDATE TBL_Equipment SET Vendor = '%s',Unit = '%s',EquipmentCategory = %s,EquipmentType = %s,Property = '%s',EquipmentTemplateId = %s,UpdateTime = '%s' WHERE EquipmentId = %s;",
					Vendor,Unit,EquipmentCategory,EquipmentType,Property,equipmentTemplateId,UpdateTime,equipmentId);
			// --------------------------------------------------
			System.out.println("SQL:"+sql);
			// --------------------------------------------------
			dbHelper.executeNoQuery(sql);

			return "OK";
		}catch (Exception ex){
    		return "DataBase Error";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	public ArrayList<Equipment> GetHostEquipmentsByStationId(int stationId) {
		DatabaseHelper dbHelper = null;

		try
		{
			dbHelper = new DatabaseHelper();
			StringBuilder sb= new StringBuilder();
			sb.append("SELECT equipment.* FROM TBL_Equipment equipment \r\n");
			sb.append("LEFT JOIN TSL_SamplerUnit samplerUnit ON equipment.MonitorUnitId = samplerUnit.MonitorUnitId AND equipment.SamplerUnitId = samplerUnit.SamplerUnitId \r\n");
			sb.append("LEFT JOIN TSL_Port port ON port.MonitorUnitId = samplerUnit.MonitorUnitId AND port.PortId = samplerUnit.PortId \r\n");
			sb.append("WHERE equipment.StationId = %d AND port.Setting = 'comm_host_dev.so'");
			String sql = sb.toString();
			sql = String.format(sql, stationId);

			DataTable dt = dbHelper.executeToTable(sql);

			return Equipment.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetHostEquipmentsByStationId() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

		return null;
	}


	public void removeEquipmentDependentFile(int equipmentId){
		//删除生成的<EquipmentId>.json文件
		String filePath = String.format("%s/diagrams/instances/%s.json", BasePath.getPath(),equipmentId);
		File file = new File(filePath);
		if(file.exists())
			file.delete();

		//删除生产的<EquipmentId>.html文件
		filePath = String.format("%s\\%s.html", BasePath.getWebDirByEnv("/web/partials/templates"),equipmentId);
		file = new File(filePath);
		if(file.exists())
			file.delete();
	}
}
