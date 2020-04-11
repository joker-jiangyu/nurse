package nurse.logic.providers;

import java.util.Date;

import org.apache.log4j.Logger;
import nurse.common.DataTable;
import nurse.utility.DatabaseHelper;

public class SamplerProvider {

	private static SamplerProvider instance = new SamplerProvider();
	private static Logger log = Logger.getLogger(SamplerProvider.class);
	private static int gSamplerId = 755000001;
	
	public SamplerProvider() {
	}
	
	public static SamplerProvider getInstance(){
		return instance;
	}

	public boolean InsertSampler(int SamplerId,
            String SamplerName,
            int SamplerType,
            String ProtocolCode,
            String DLLCode,
            String DLLVersion,
            String ProtocolFilePath,
            String DLLFilePath,
            String DllPath,
            String Setting,
            String Description,
            String SoCode,
            String SoPath) {

		DatabaseHelper dbHelper = null;
		try
	        {
				if (ProtocolCode == null) ProtocolCode = "";
	            if (DLLCode == null) DLLCode = "";
	            if (DLLVersion == null) DLLVersion = "";
	            if (ProtocolFilePath == null) ProtocolFilePath = "";
	            if (DLLFilePath == null) DLLFilePath = "";
	            if (Description == null) Description = "";
	            if (SoCode == null) SoCode = "";
	            if (SoPath == null) SoPath = "";
            
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TSL_Sampler");
	            sb.append("(SamplerId, SamplerName, SamplerType, ProtocolCode, DLLCode, DLLVersion, ");
	            sb.append("ProtocolFilePath, DLLFilePath, DllPath, Setting, Description, SoCode, SoPath)");
	            sb.append("VALUES (%d, '%s', %d, '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')");

	            String sql = sb.toString();
	            sql = String.format(sql, SamplerId, SamplerName.trim(), SamplerType, ProtocolCode.trim(), DLLCode.trim(), DLLVersion.trim(), ProtocolFilePath.trim(), DLLFilePath.trim(), DllPath.trim(), Setting.trim(), Description.trim(), SoCode.trim(), SoPath.trim());
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertSampler() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
	
	public int GetMaxSamplerId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(SamplerId) FROM TSL_Sampler");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = gSamplerId++;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					iMaxId++;
					gSamplerId = iMaxId;
				}

			} catch (Exception e) {
				log.error("GetMaxSamplerId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
	//根据时间戳生成ID
	public int GenerateSamplerId()
	{
		Date date=new Date();  
		long lTime = date.getTime();
		int samplerId = (int)(lTime % 1000000000);
		
		return samplerId;
	}
		
	public DataTable GetSamplerByInfo(String SamplerName,
            int SamplerType,
            String ProtocolCode,
            String DllPath,
            String Setting)
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM TSL_Sampler WHERE SamplerName='%s' AND SamplerType=%d AND DllPath='%s' AND Setting='%s' AND ProtocolCode='%s'";
			sql = String.format(sql, SamplerName, SamplerType, DllPath, Setting, ProtocolCode);
			dt = dbHelper.executeToTable(sql);
			

		} catch (Exception e) {
			log.error("GetSamplerByInfo() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return dt;
	}
	
	public DataTable GetSamplersByEquipTemplate(int equipmentTemplateId)
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = String.format("SELECT a.* FROM TSL_Sampler a,TBL_EquipmentTemplate b WHERE a.ProtocolCode=b.ProtocolCode AND b.EquipmentTemplateId=%d", equipmentTemplateId);
			dt = dbHelper.executeToTable(sql);
			

		} catch (Exception e) {
			log.error("GetSamplersByEquipTemplate() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return dt;
	}
}
