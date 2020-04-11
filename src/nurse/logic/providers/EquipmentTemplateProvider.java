package nurse.logic.providers;

import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.AisleThermalHumidity;
import nurse.entity.persist.EquipmentTemplate;
import nurse.utility.DatabaseHelper;

public class EquipmentTemplateProvider {

	private static EquipmentTemplateProvider instance = new EquipmentTemplateProvider();
	private static Logger log = Logger.getLogger(EquipmentTemplateProvider.class);
	private static int gEquipmentTemplateId = 100000001;
	private static String os = null;//保存当前系统类型
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
	
	public EquipmentTemplateProvider() {
	}
	
	public static EquipmentTemplateProvider getInstance(){
		return instance;
	}

	public boolean InsertEquipmentTemplate(int EquipmentTemplateId,
            String EquipmentTemplateName,
            int ParentTemplateId,
            String Memo,
            String ProtocolCode,
            int EquipmentCategory,
            int EquipmentType,
            String Property,
            String Description,
            String EquipmentStyle,
            String Unit,
            String Vendor,
            Integer EquipmentBaseType,
            Integer stationCategory) {
		//return MockHelper.getActiveSignals();	
		DatabaseHelper dbHelper = null;
		try
	        {
				//�޸�ģ�峧��
				if(Vendor == "")
				{
					if (EquipmentTemplateName.contains("艾默生"))
	                {
	                    Vendor = "艾默生";
	                }
	                else if (EquipmentTemplateName.contains("雅达"))
	                {
	                    Vendor = "雅达";
	                }
	                else if (EquipmentTemplateName.contains("中兴"))
	                {
	                    Vendor = "中兴";
	                }
	                else if (EquipmentTemplateName.contains("中恒"))
	                {
	                    Vendor = "中恒";
	                }
	                else if (EquipmentTemplateName.contains("中达"))
	                {
	                    Vendor = "中达";
	                }
	                else if (EquipmentTemplateName.contains("普天"))
	                {
	                    Vendor = "普天";
	                }
	                else if (EquipmentTemplateName.contains("IO"))
	                {
	                    Vendor = "GT";
	                }
	                else 
	                {
	                	Vendor = "";
	                }
				}
				
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_EquipmentTemplate(EquipmentTemplateId,EquipmentTemplateName,ParentTemplateId,");
	            sb.append("Memo,ProtocolCode,EquipmentCategory,EquipmentType,Property,");
	            sb.append("Description,EquipmentStyle,Unit,Vendor,EquipmentBaseType, StationCategory)");
	            //sb.append("VALUES ({0},'{1}',{2},'{3}','{4}',{5},{6},'{7}','{8}','{9}','{10}','{11}',{12}, {13})");
	            sb.append("VALUES (%d,'%s',%d,'%s','%s',%d, %d,'%s','%s','%s','%s','%s',%s, %s)");

	            String sql = sb.toString();
	            sql = String.format(sql, EquipmentTemplateId, EquipmentTemplateName.trim(), ParentTemplateId,
	                    Memo.trim(), ProtocolCode.trim(), EquipmentCategory, EquipmentType, Property.trim(),
	                    Description.trim(), EquipmentStyle, Unit.trim(), Vendor.trim(), EquipmentBaseType==null ? "NULL" : EquipmentBaseType,
	                    stationCategory==null ? "NULL" : stationCategory);
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertEquipmentTemplate() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
	
	public boolean DelEquipmentTemplate(int EquipmentTemplateId) {
		
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format(" call PCT_DeleteEquipmentTemplate(%d)", EquipmentTemplateId);
            dbHelper.executeNoQuery(sql);
			
			return true;

		} catch (Exception e) {
			log.error("DelEquipmentTemplate() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return false;
				
	}
	
	//根据时间戳生成ID
	public int GenerateEquipmentTemplateId()
	{
		Date date=new Date();  
		long lTime = date.getTime();
		int equipmentTemplateId = (int)(lTime % 1000000000);
		
		return equipmentTemplateId;
	}
		
	public int GetMaxEquipmentTemplateId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(EquipmentTemplateId) FROM TBL_EquipmentTemplate");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = gEquipmentTemplateId++;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					iMaxId++;
					gEquipmentTemplateId = iMaxId;
				}

			} catch (Exception e) {
				log.error("GetMaxEquipmentTemplateId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
	public ArrayList<EquipmentTemplate> GetAllEquipmentTemplates() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT A.*,B.DllPath FROM TBL_EquipmentTemplate A ");
            sb.append("LEFT JOIN TSL_Sampler B ON A.ProtocolCode = B.ProtocolCode ");
            sb.append(" ORDER BY EquipmentTemplateId desc;");
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return EquipmentTemplate.fromDataTables(dt);
		} catch (Exception e) {
			log.error("fail to read all equipmentTemplate", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
	}
	
	public ArrayList<EquipmentTemplate> GetEquipmentTemplate(int EquipmentTemplateId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_EquipmentTemplate WHERE EquipmentTemplateId = %d");               
            String sql = sb.toString();
            sql = String.format(sql, EquipmentTemplateId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return EquipmentTemplate.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetEquipmentTemplate() failed.", e);
			
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		
	}
	
	public int GetEquipmentTemplateNums() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT COUNT(*) FROM TBL_EquipmentTemplate");
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
				log.error("GetEquipmentTemplateNums() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iNums;
				
	}
	
	public int GetEquipmentCountsByTemplateId(int EquipmentTemplateId) {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
	        {
	            dbHelper = new DatabaseHelper();

	            String sql=String.format("SELECT COUNT(*) FROM TBL_Equipment WHERE EquipmentTemplateId = %d", EquipmentTemplateId);
	            
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
				log.error("GetEquipmentCountsByTemplateId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iNums;
				
	}
	
	public ArrayList<EquipmentTemplate> GetLimitEquipmentTemplates(int index, int size) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_EquipmentTemplate ORDER BY EquipmentTemplateId desc LIMIT %d,%d");               
            String sql = sb.toString();
            
            sql = String.format(sql, index, size);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return EquipmentTemplate.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read limit equipmentTemplate", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		
	}
	
	public boolean existEquipmentTemplate(String equipmentTemplateName,String protocolCode){
		DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("select * FROM tbl_equipmenttemplate where EquipmentTemplateName = '%s' and ProtocolCode = '%s'");               
            String sql = sb.toString();
            
            sql = String.format(sql, equipmentTemplateName, protocolCode);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return dt.getRowCount()>0;
		} catch (Exception e) {
			log.error("fail to read limit equipmentTemplate", e);
			return false;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<EquipmentTemplate> GetIOEquipmentTemplates() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_EquipmentTemplate WHERE EquipmentCategory = 51 ORDER BY EquipmentTemplateId desc");               
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return EquipmentTemplate.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read io equipmentTemplates", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
	}

	public boolean DelSo(int equipmentTemplateId) {
		if(!os.equals("Linux") && !os.equals("linux")){
			return false;
		}
		
		DatabaseHelper dbHelper = null;
		Object res = null; 
		String soName = "";
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT a.DllPath FROM TSL_Sampler a,TBL_EquipmentTemplate b WHERE a.ProtocolCode=b.ProtocolCode AND b.EquipmentTemplateId=%d LIMIT 1;",
					equipmentTemplateId);
			res = dbHelper.executeScalar(sql);

	        if(res != null)
			{
	        	//name.s.so
	        	soName = String.valueOf(res.toString());
	        	soName = soName.substring(0, soName.lastIndexOf("."));

	        	//不存在其他协议使用相同名称的SO
	        	sql = "SELECT COUNT(*) FROM TSL_Sampler WHERE DllPath LIKE '"+soName+".%';";
				Object count = dbHelper.executeScalar(sql);
				if(!count.toString().equals("1")) return false;

				//采集单元中没有使用相同名称的SO
				sql ="SELECT COUNT(*) FROM TSL_SamplerUnit WHERE DllPath LIKE '"+soName+".%';";
                count = dbHelper.executeScalar(sql);
                if(!count.toString().equals("0")) return false;

				//删除so库    rm -f /home/app/samp/SO/%s.so
				String[] cmd_date = new String[]{"/bin/sh", "-c","rm -f /home/app/samp/SO/"+soName+".so"};
				SystemSettingProvider.getInstance().updateSystemSetting(cmd_date);
				log.info("Delete So Name:"+soName+".so");
				return true;
			}
			return false;
		} catch (Exception e) {
			log.error("DelEquipmentTemplate() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return false;
	}

	public ArrayList<EquipmentTemplate> GetHostEquipmentTemplates(){
		DatabaseHelper dbHelper = null;

		try
		{
			dbHelper = new DatabaseHelper();
			StringBuilder sb= new StringBuilder();
			sb.append("SELECT * FROM TBL_EquipmentTemplate WHERE EquipmentCategory = 51 AND EquipmentBaseType = 2001 ORDER BY EquipmentTemplateId desc");

			DataTable dt = dbHelper.executeToTable(sb.toString());

			return EquipmentTemplate.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read io equipmentTemplates", e);
			return null;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
