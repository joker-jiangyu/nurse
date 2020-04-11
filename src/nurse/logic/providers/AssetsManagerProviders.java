package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.AssetsManager;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.utility.DatabaseHelper;

public class AssetsManagerProviders {
	private static Logger log = Logger.getLogger(AssetsManagerProviders.class);
	private static final AssetsManagerProviders instance = new AssetsManagerProviders();
	private static Integer assetsId = 0;

	private AssetsManagerProviders() {
	}

	public static AssetsManagerProviders getInstance() {
		return instance;
	}

	public int editSelectSameCodeAmount(String code, long id) {
		DatabaseHelper dbHelper = null;
		Object res = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer buf = new StringBuffer();
			buf.append("SELECT AssetsCode FROM TBL_AssetsManager WHERE AssetsId = ").append(id).append(";");
			res = dbHelper.executeScalar(buf.toString());
			if (code.equals(res.toString())) {
				return 0;
			} else {
				StringBuffer sb = new StringBuffer();
				sb.append("SELECT COUNT(*) FROM TBL_AssetsManager WHERE AssetsCode = '").append(code).append("';");
				res = dbHelper.executeScalar(sb.toString());
				if (Integer.parseInt(res.toString()) > 0) {
					return 1;
				}
				return 0;
			}
		} catch (Exception e) {
			log.error("getSameAssetsInfo Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return -1;
	}

	public int selectSameCodeAmountByCode(String code) {
		DatabaseHelper dbHelper = null;
		Object res = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer buf = new StringBuffer();
			buf.append("SELECT COUNT(*) FROM TBL_AssetsManager WHERE AssetsCode ='").append(code).append("';");
			res = dbHelper.executeScalar(buf.toString());
			return Integer.parseInt(res.toString());
		} catch (Exception e) {
			log.error("getSameAssetsInfo Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return -1;
	}

	public String selectMDCCabinetUHeight() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		try {
			dbHelper = new DatabaseHelper();
			String str = "SELECT CabinetUHeight from mdc ";
			res = dbHelper.executeScalar(str);
			return res.toString();
		} catch (Exception e) {
			log.error("getCabinetNameInfo Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return null;
	}

	public boolean impoertMDCAssets() {
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = " call PRO_BatchAssetsManager()";
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("importMDCAssetsInfo Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return false;
	}

	public ArrayList<CabinetDeviceMap> getCabinetInfo() {
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT * FROM cabinet ;");
			DataTable dt = dbHelper.executeToTable(sb.toString());
			return CabinetDeviceMap.fromCabinetDataTable(dt);
		} catch (Exception e) {
			log.error("GetCabinetInfo Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return null;
	}

	public boolean updateAssetsAssetsById(AssetsManager as) {
		boolean flag = false;
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			StringBuffer sb = new StringBuffer();
			sb.append("UPDATE TBL_AssetsManager ");
			sb.append(String.format("SET AssetsCode='%s',AssetsName = '%s',AssetType = %s,AssetStyle = %s,", 
					as.assetsCode,as.assetsName,getStringOrNull(as.assetType),getStringOrNull(as.assetStyle)));
			sb.append(String.format("	EquipmentId = %s,Vendor = %s,UsedDate = '%s',Responsible = %s,", 
					as.equipmentId,getStringOrNull(as.vendor),as.usedDate,getStringOrNull(as.responsible)));
			sb.append(String.format("	Position = %s,Status = %s,Description = %s ", 
					getStringOrNull(as.position),getStringOrNull(as.status),getStringOrNull(as.description)));
			sb.append(String.format("WHERE AssetsId = %s;", getIntOrNull(as.assetsId)));
			dbHelper.executeNoQuery(sb.toString());
			flag = true;
		} catch (Exception e) {
			log.error("updateAssets Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return flag;
	}

	public boolean removeAssetsByAssetsId(int id) {
		boolean flag = false;
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM TBL_AssetsManager WHERE AssetsId = %d;", id);
			dbHelper.executeNoQuery(sql);
			flag = true;
		} catch (Exception e) {
			log.error("removeAssets Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return flag;
	}

	public ArrayList<AssetsManager> getAllAssets() {
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT * FROM TBL_AssetsManager;");
			DataTable dt = dbHelper.executeToTable(sb.toString());
			return AssetsManager.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetAllAssetsInfo Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return null;
	}

	public boolean insertAssetsManager(AssetsManager as) {
		boolean flag = false;
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			String sql = String.format("INSERT INTO TBL_AssetsManager VALUES (%s,'%s',NULL,'%s',%s,%s,%s,%s,'%s',%s,%s,NULL,NULL,%s,%s);",
					getMaxAssetsId(),as.assetsCode,as.assetsName,getStringOrNull(as.assetType),getStringOrNull(as.assetStyle),
					getIntOrNull(as.equipmentId),getStringOrNull(as.vendor),as.usedDate,getStringOrNull(as.responsible),getStringOrNull(as.position),
					getStringOrNull(as.status),getStringOrNull(as.description));
			dbHelper.executeNoQuery(sql);
			flag = true;
		} catch (Exception e) {
			log.error("insertAssets Error  : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return flag;
	}
	
	private String getStringOrNull(String str){
		if(str == null || str.equals("") || str.equals("undefined")) return "NULL";
		else return String.format("'%s'", str);
	}

	private String getIntOrNull(int number){
		if(number == -1) return "NULL";
		return String.valueOf(number);
	}

	@SuppressWarnings("static-access")
	private int getMaxAssetsId() {
		DatabaseHelper dbHelper = null;
		try {
			if(this.assetsId == 0){
				dbHelper = new DatabaseHelper();
				StringBuilder sb = new StringBuilder();
				sb.append("SELECT MAX(AssetsId) AS MaxAssetsId FROM TBL_AssetsManager;");
				DataTable dt = dbHelper.executeToTable(sb.toString());
				if(dt.getRowCount() > 0){
					this.assetsId = Integer.parseInt(dt.getRows().get(0).getValueAsString("MaxAssetsId"));
					this.assetsId += 1;
				}else{
					this.assetsId = 100000001;
				}
			}else
				this.assetsId += 1;
			return this.assetsId;
		} catch (Exception e) {
			log.error("getMaxAssetsId Error : " + e);
			return 999000001;
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
	}
	
	public ArrayList<AssetsManager> likeLimitAssetsInfo(int index,int size,String param){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			//AssetsCode&AssetsName&AssetType&AssetStyle&EquipmentId&Vendor&UsedDate&Responsible&Position&Status
			String[] split = param.split("\\&");
			
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT A.* FROM (SELECT * FROM TBL_AssetsManager ");
			String result = "";
			if(split.length > 0) result = resultCond(result,"AssetsCode",split[0]);
			if(split.length > 1) result = resultCond(result,"AssetsName",split[1]);
			if(split.length > 2) result = resultCond(result,"AssetType",split[2]);
			if(split.length > 3) result = resultCond(result,"AssetStyle",split[3]);
			if(split.length > 4) result = resultCond(result,"EquipmentId",split[4]);
			if(split.length > 5) result = resultCond(result,"Vendor",split[5]);
			if(split.length > 6) result = resultCond(result,"UsedDate",split[6]);
			if(split.length > 7) result = resultCond(result,"Responsible",split[7]);
			if(split.length > 8) result = resultCond(result,"Position",split[8]);
			if(split.length > 9) result = resultCond(result,"Status",split[9]);
			
			sb.append(String.format("%s", result));
			sb.append(String.format(" ORDER BY AssetsCode) A LIMIT %s,%s;", index,size));
			
			DataTable dt = dbHelper.executeToTable(sb.toString());
			
			return AssetsManager.fromDataTable(dt);
		} catch (Exception e) {
			log.error("LikeLimitAssetsInfo Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return null;
	}
	
	public String getLikeAssetsTotals(String param){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String[] split = param.split("\\&");
			
			String result = "";
			if(split.length > 0) result = resultCond(result,"AssetsCode",split[0]);
			if(split.length > 1) result = resultCond(result,"AssetsName",split[1]);
			if(split.length > 2) result = resultCond(result,"AssetType",split[2]);
			if(split.length > 3) result = resultCond(result,"AssetStyle",split[3]);
			if(split.length > 4) result = resultCond(result,"EquipmentId",split[4]);
			if(split.length > 5) result = resultCond(result,"Vendor",split[5]);
			if(split.length > 6) result = resultCond(result,"UsedDate",split[6]);
			if(split.length > 7) result = resultCond(result,"Responsible",split[7]);
			if(split.length > 8) result = resultCond(result,"Position",split[8]);
			if(split.length > 9) result = resultCond(result,"Status",split[9]);

			StringBuffer sql = new StringBuffer();
			sql.append(String.format("SELECT COUNT(*) FROM TBL_AssetsManager %s ;", result));

			Object res = dbHelper.executeScalar(sql.toString());

			if(res == null){
            	return "0";
			}else{
				return res.toString();
			}
		} catch (Exception e) {
			log.error("GetLikeAssetsTotals Error : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return "0";
	}
	
	/** 根据值返回合理SQL条件 */
	private String resultCond(String result,String colName,String value){
		String logic = "WHERE";
		if(result.length() > 0)
			logic = "AND";
			
		if(value == null || value.equals("") || value.equals("undefined")){
			//result += "";
		}else if(value.equals("notNull"))
			result += String.format(" %s %s IS NOT NULL ", logic,colName);
		else if(value.equals("null"))
			result += String.format(" %s %s IS NULL ", logic,colName);
		else
			result += String.format(" %s %s LIKE '%s' ", logic,colName,"%"+value+"%");
		return result;
	}
}
