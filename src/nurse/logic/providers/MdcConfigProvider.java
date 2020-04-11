package nurse.logic.providers;

import java.sql.CallableStatement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Pattern;

import nurse.entity.persist.*;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.utility.DatabaseHelper;

public class MdcConfigProvider {
	private static MdcConfigProvider instance = new MdcConfigProvider();
	private static Logger log = Logger.getLogger(MdcConfigProvider.class);
	private static int mdcId = 100000001;

	public static MdcConfigProvider getInstance() {
		return instance;
	}
	
	public boolean insertMdcAndDictionary(Mdc mdc){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			mdc.id = String.valueOf(getMaxMdcId());
			sql.append(String.format("INSERT INTO mdc VALUES(%s,'%s',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s",
					mdc.id,
					mdc.name,
					mdc.line1PhaseACurrentDeviceId,
					mdc.line1PhaseACurrentSignalId,
					mdc.line1PhaseAVoltageDeviceId,
					mdc.line1PhaseAVoltageSignalId,
					mdc.line1PhaseBCurrentDeviceId,
					mdc.line1PhaseBCurrentSignalId,
					mdc.line1PhaseBVoltageDeviceId,
					mdc.line1PhaseBVoltageSignalId,
					mdc.line1PhaseCCurrentDeviceId,
					mdc.line1PhaseCCurrentSignalId,
					mdc.line1PhaseCVoltageDeviceId,
					mdc.line1PhaseCVoltageSignalId));
			if(mdc.lineNumber == 2){
				sql.append(String.format(",%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s",
						mdc.line2PhaseACurrentDeviceId,
						mdc.line2PhaseACurrentSignalId,
						mdc.line2PhaseAVoltageDeviceId,
						mdc.line2PhaseAVoltageSignalId,
						mdc.line2PhaseBCurrentDeviceId,
						mdc.line2PhaseBCurrentSignalId,
						mdc.line2PhaseBVoltageDeviceId,
						mdc.line2PhaseBVoltageSignalId,
						mdc.line2PhaseCCurrentDeviceId,
						mdc.line2PhaseCCurrentSignalId,
						mdc.line2PhaseCVoltageDeviceId,
						mdc.line2PhaseCVoltageSignalId));
			}else{
				sql.append(",NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL");
			}
			sql.append(String.format(",%s,%s,%s,%s,%s,NULL);", 
					mdc.powerConsumptionDeviceId,mdc.powerConsumptionSignalId,
					mdc.cabinetNumber,mdc.cabinetUHeight,mdc.type));
			dbHelper.executeNoQuery(sql.toString());
				
			return true;
		} catch (Exception e) {
			log.error("Database exception:", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return false;
	}
	
	public boolean updateMdcAndDictionary(Mdc mdc){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("UPDATE mdc SET ");
			sql.append(String.format("Name = '%s',", mdc.name));
			sql.append(String.format("Line1PhaseACurrentDeviceId = %s,", mdc.line1PhaseACurrentDeviceId));
			sql.append(String.format("Line1PhaseACurrentSignalId = %s,", mdc.line1PhaseACurrentSignalId));
			sql.append(String.format("Line1PhaseAVoltageDeviceId = %s,", mdc.line1PhaseAVoltageDeviceId));
			sql.append(String.format("Line1PhaseAVoltageSignalId = %s,", mdc.line1PhaseAVoltageSignalId));
			sql.append(String.format("Line1PhaseBCurrentDeviceId = %s,", mdc.line1PhaseBCurrentDeviceId));
			sql.append(String.format("Line1PhaseBCurrentSignalId = %s,", mdc.line1PhaseBCurrentSignalId));
			sql.append(String.format("Line1PhaseBVoltageDeviceId = %s,", mdc.line1PhaseBVoltageDeviceId));
			sql.append(String.format("Line1PhaseBVoltageSignalId = %s,", mdc.line1PhaseBVoltageSignalId));
			sql.append(String.format("Line1PhaseCCurrentDeviceId = %s,", mdc.line1PhaseCCurrentDeviceId));
			sql.append(String.format("Line1PhaseCCurrentSignalId = %s,", mdc.line1PhaseCCurrentSignalId));
			sql.append(String.format("Line1PhaseCVoltageDeviceId = %s,", mdc.line1PhaseCVoltageDeviceId));
			sql.append(String.format("Line1PhaseCVoltageSignalId = %s,", mdc.line1PhaseCVoltageSignalId));
			sql.append(String.format("PowerConsumptionDeviceId   = %s,", mdc.powerConsumptionDeviceId  ));
			sql.append(String.format("PowerConsumptionSignalId   = %s, ", mdc.powerConsumptionSignalId  ));
			sql.append(String.format("CabinetNumber   = %s, ", mdc.cabinetNumber  ));
			sql.append(String.format("CabinetUHeight   = %s, ", mdc.cabinetUHeight  ));
			sql.append(String.format("Type   = %s ", mdc.type  ));
			
			if(mdc.lineNumber == 2){
				sql.append(String.format(",Line2PhaseACurrentDeviceId = %s,",mdc.line2PhaseACurrentDeviceId));
				sql.append(String.format("Line2PhaseACurrentSignalId  = %s,",mdc.line2PhaseACurrentSignalId));
				sql.append(String.format("Line2PhaseAVoltageDeviceId  = %s,",mdc.line2PhaseAVoltageDeviceId));
				sql.append(String.format("Line2PhaseAVoltageSignalId  = %s,",mdc.line2PhaseAVoltageSignalId));
				sql.append(String.format("Line2PhaseBCurrentDeviceId  = %s,",mdc.line2PhaseBCurrentDeviceId));
				sql.append(String.format("Line2PhaseBCurrentSignalId  = %s,",mdc.line2PhaseBCurrentSignalId));
				sql.append(String.format("Line2PhaseBVoltageDeviceId  = %s,",mdc.line2PhaseBVoltageDeviceId));
				sql.append(String.format("Line2PhaseBVoltageSignalId  = %s,",mdc.line2PhaseBVoltageSignalId));
				sql.append(String.format("Line2PhaseCCurrentDeviceId  = %s,",mdc.line2PhaseCCurrentDeviceId));
				sql.append(String.format("Line2PhaseCCurrentSignalId  = %s,",mdc.line2PhaseCCurrentSignalId));
				sql.append(String.format("Line2PhaseCVoltageDeviceId  = %s,",mdc.line2PhaseCVoltageDeviceId));
				sql.append(String.format("Line2PhaseCVoltageSignalId  = %s ",mdc.line2PhaseCVoltageSignalId));
			}
			sql.append(String.format(" WHERE Id = %s;", mdc.id));
			dbHelper.executeNoQuery(sql.toString());
				
			return true;
		} catch (Exception e) {
			log.error("Database exception:", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return false;
	}
	
	/*private int getNewMdcId(){
		  Date date=new Date();  
		  long lTime = date.getTime();
		  int i = (int)(lTime % 1000000000);
		  return i;
	}*/
	private int getMaxMdcId(){
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            String sql = "select MAX(Id) from mdc;";
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = mdcId;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					mdcId = ++iMaxId;
				}

			} catch (Exception e) {
				log.error("getMaxEquipmentId failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
	}
	
	public boolean InitThermalSensors(int cabinetNumber,int type){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" call PRO_InitThermalSensors(%s,%s)",cabinetNumber,type);
			
            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("Database exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	
	public ArrayList<CabinetSignalMap> GetOtherEvents(String mdcId){
		DatabaseHelper dbHelper = null;
		ArrayList<CabinetSignalMap> csms = new ArrayList<CabinetSignalMap>();
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT A.CabinetId,D.`Name`,A.DeviceId,B.EquipmentName,A.SignalId,C.EventName ");
			sql.append("FROM Cabinet_Signal_Map A,TBL_Equipment B,TBL_Event C,Cabinet D ");
			sql.append("WHERE A.DeviceId = B.EquipmentId AND A.SignalId = C.SignalId ");
			sql.append("AND B.EquipmentTemplateId = C.EquipmentTemplateId ");
			sql.append(String.format("AND A.CabinetId = D.Id AND D.MDCId = %s;", mdcId));
			DataTable dt = dbHelper.executeToTable(sql.toString());
			csms = CabinetSignalMap.fromEventDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return csms;
	}
	
	public ArrayList<Environment> GetOtherSignal(){
		DatabaseHelper dbHelper = null;
		ArrayList<Environment> ments = new ArrayList<Environment>();
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT * FROM MDC_Environment;";
			DataTable dt = dbHelper.executeToTable(sql);
			ments = Environment.fromDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return ments;
	}
	
	public int SetOtherSignal(String mdcId,String type,String deviceId,String signalId){
		DatabaseHelper dbHelper = null;
		try {
			String regNum = "[^0-9]";//匹配指定范围内的数字
			String regStr = "[0-9]";//匹配指定范围内的字符
			
			String si = Pattern.compile(regNum).matcher(type).replaceAll("").trim();
			String ty = Pattern.compile(regStr).matcher(type).replaceAll("").trim();
			
			dbHelper = new DatabaseHelper();
			/*String sql = String.format(" call PRO_InitMdcEnvironment(%s,'%s',%s,%s,%s,NULL)",
					mdcId,ty,si,deviceId,signalId);
			
            dbHelper.executeNoQuery(sql);*/

			CallableStatement stat = dbHelper.prepareProcedure("PRO_InitMdcEnvironment","?,?,?,?,?,?");
			stat.setInt(1, Integer.parseInt(mdcId));
	        stat.setString(2, ty);
	        stat.setInt(3, Integer.parseInt(si));
	        stat.setInt(4, Integer.parseInt(deviceId == null ? "0" : deviceId));
	        stat.setInt(5, Integer.parseInt(signalId == null ? "0" : signalId));
	        stat.setString(6, null);
	        
	        DataTable dt = dbHelper.executeQuery(stat);
	        if(dt.getRowCount() > 0){
				String tableId = dt.getRows().get(0).getValueAsString(0);
				return Integer.parseInt(tableId);
	        }
			return -1;
		} catch (Exception e) {
			log.error("Database exception:", e);
			return -1;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<CabinetSignalMap> GetAllEvents(){
		DatabaseHelper dbHelper = null;
		ArrayList<CabinetSignalMap> csms = new ArrayList<CabinetSignalMap>();
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT A.EquipmentId,A.EquipmentName,B.SignalId,B.EventName ");
			sql.append("FROM TBL_Equipment A,TBL_Event B ");
			sql.append("WHERE A.EquipmentTemplateId = B.EquipmentTemplateId AND SignalId <> -3;");
			DataTable dt = dbHelper.executeToTable(sql.toString());
			csms = CabinetSignalMap.fromAllEventDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return csms;
	}
	
	public boolean UpdateOtherEvent(String mdcId,String cabinetId,ArrayList<CabinetSignalMap> csmList){
		if(csmList.size() == 0) return true;
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM Cabinet_Signal_Map WHERE CabinetId = %s;", cabinetId);
			dbHelper.executeNoQuery(sql);
			for(CabinetSignalMap csm : csmList){
				sql = String.format("INSERT INTO Cabinet_Signal_Map VALUES(%s,%s,%s);", cabinetId,csm.deviceId,csm.signalId);
				dbHelper.executeNoQuery(sql);
			}
		} catch (Exception e) {
			log.error("Database exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	public String InitCabinet(String mdcId,CabinetDeviceMap cdm){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" call PRO_InitCabinet(%s,'%s',%s,'%s','%s',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'%s')",
					cdm.cabinetId,cdm.cabinetName,mdcId,cdm.cabinetType,cdm.side,
					cdm.PhaseACurrentDeviceId,cdm.PhaseACurrentSignalId,cdm.PhaseAVoltageDeviceId,cdm.PhaseAVoltageSignalId,
					cdm.PhaseBCurrentDeviceId,cdm.PhaseBCurrentSignalId,cdm.PhaseBVoltageDeviceId,cdm.PhaseBVoltageSignalId,
					cdm.PhaseCCurrentDeviceId,cdm.PhaseCCurrentSignalId,cdm.PhaseCVoltageDeviceId,cdm.PhaseCVoltageSignalId,
					cdm.ratedVoltage,cdm.ratedCurrent,cdm.description);
            dbHelper.executeNoQuery(sql);
            
            StringBuffer sb = new StringBuffer();
            sb.append("SELECT Id FROM Cabinet WHERE Id LIKE CONCAT('%',");
            if(Integer.parseInt(cdm.cabinetId) > 10)
            	sb.append(String.format("%s) AND MDCId = %s;", cdm.cabinetId,mdcId));
            else
            	sb.append(String.format("'0%s') AND MDCId = %s;", cdm.cabinetId,mdcId));
			DataTable dt = dbHelper.executeToTable(sb.toString());
			if(dt.getRowCount() == 0) return "ERROR";
            return dt.getRows().get(0).getValueAsString("Id");
		} catch (Exception e) {
			log.error("Database exception:", e);
			return "ERROR";
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean InitCabinetThermalSensors(HashMap<Integer, MdcTemperature> tempMap){
		if(tempMap.size() == 0) return true;
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "";
			for(int key : tempMap.keySet()){
				MdcTemperature mt = tempMap.get(key);
				sql = String.format(" call PRO_InitCabinetThermalSensors(%s,%s,%s,%s,%s)",
						mt.mdcId,mt.cabinetId,mt.deviceId <= 0 ? "NULL" : mt.deviceId,
						mt.signalId <= 0 ? "NULL" : mt.signalId,key);
	            dbHelper.executeNoQuery(sql);
			}
		} catch (Exception e) {
			log.error("Database exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	public boolean UpdateCabinetDevice(String cabinetId,ArrayList<CabinetDeviceMap> cdms){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM MDC_CabinetDeviceMap WHERE CabinetId = %s;", cabinetId);
			dbHelper.executeNoQuery(sql);
			for(CabinetDeviceMap cdm : cdms){
				sql = String.format("INSERT INTO MDC_CabinetDeviceMap(CabinetId,DeviceName,DeviceId,UIndex,UHeight) VALUES(%s,'%s',%s,%s,%s);",
						cabinetId,cdm.equipmentName,cdm.equipmentId.equals("") ? "NULL" : cdm.equipmentId,cdm.UIndex,cdm.UHeight);
				dbHelper.executeNoQuery(sql);
			}
		} catch (Exception e) {
			log.error("Database exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	public String getCabinetNumber(String MdcId){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT CabinetNumber FROM mdc WHERE Id = %s;", MdcId);
			dt = dbHelper.executeToTable(sql.toString());
			if(dt.getRowCount() > 0)
				return dt.getRows().get(0).getValueAsString("CabinetNumber");
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return "0";
	}
	
	public List<CabinetAsset> GetCabinetAssetInfo(String cabinetId,String mdcId){
		List<CabinetAsset> list = new ArrayList<CabinetAsset>();
		if(cabinetId.equals("") || cabinetId.equals("undefined")) return list;
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" call PRO_SelectCabinetAssets(%s,%s)",mdcId,cabinetId);			
            dt = dbHelper.executeToTable(sql);
            list = CabinetAsset.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetCabinetAssetInfo Exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return list;
	}
	
/*	public String UpdateCabinetAsset(CabinetAsset ca){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" call PRO_UpdateCabinetAsset(%s,%s,%s,'%s','%s','%s','%s','%s',%s,'%s');",
					ca.assetId,ca.mdcId,ca.cabinetId,ca.assetCode,ca.date,ca.vendor,ca.model,
					ca.responsible,ca.employeeId,ca.description);			
	        dbHelper.executeNoQuery(sql);
			return "OK";
		} catch (Exception e) {
			log.error("Database exception:", e);
			return "ERROR";
		}finally{
			dbHelper.close();
		}
	}*/

	public ArrayList<AisleThermalHumidity> getAllAisleThermalHumidity(String mdcId){
		DatabaseHelper dbHelper = null;
		ArrayList<AisleThermalHumidity> list = new ArrayList<AisleThermalHumidity>();
		if(mdcId == null) return list;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM MDC_AisleThermalHumidity WHERE MDCId = %s;");
            
            DataTable dt = dbHelper.executeToTable(String.format(sb.toString(), mdcId));
            
            list = AisleThermalHumidity.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetAllAisleThermalHumidity() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
        return list;
	}

	public int setAisleThermalHumidity(String mdcId, String type, String site, String deviceId, String signalId) {
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			CallableStatement stat = dbHelper.prepareProcedure("PRO_InitAisleThermalHumidity","?,?,?,?,?,?");
			stat.setInt(1, Integer.parseInt(mdcId));
	        stat.setString(2, type);
	        stat.setInt(3, Integer.parseInt(site));
	        stat.setInt(4, Integer.parseInt(deviceId));
	        stat.setInt(5, Integer.parseInt(signalId));
	        stat.setString(6, null);
			/*String sql = String.format(" CALL PRO_InitAisleThermalHumidity(%s,'%s',%s,%s,%s,NULL);",
					mdcId,type,site,deviceId,signalId);
			dbHelper.executeNoQuery(sql);*/

	        DataTable dt = dbHelper.executeQuery(stat);
	        if(dt.getRowCount() > 0){
				String tableId = dt.getRows().get(0).getValueAsString(0);
				return Integer.parseInt(tableId);
	        }
			return -1;
		} catch (Exception e) {
			log.error("SetAisleThermalHumidity() failed.", e);
			return -1;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
	}
	
	public boolean deleteCabinetDeviceByEquipmentId(int equipmentId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("DELETE FROM MDC_CabinetDeviceMap WHERE DeviceId = %s;", equipmentId);
			dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("DeleteCabinetDeviceByEquipmentId exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	public ArrayList<AisleDeviceLocation> getAisleDeviceLocation(){
		DatabaseHelper dbHelper = null;
		ArrayList<AisleDeviceLocation> list = new ArrayList<AisleDeviceLocation>();
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM MDC_AisleDeviceLocation;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            list = AisleDeviceLocation.fromDataTable(dt);
		} catch (Exception e) {
			log.error("getAisleDeviceLocation() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
        return list;
	}
	
	/**
	 * 根据表格位置设置冷通道设备，存在修改，不存在新增
	 */
	public boolean setAisleDeviceLocation(int id,int tableId, String tableName, String deviceType, int rows,int cols){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			String sql = String.format(" CALL PRO_InitAisleDeviceLocation(%s,%s,'%s','%s',%s,%s);",
					(id == -1)? null : id,tableId,tableName,deviceType,rows,cols);
			
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("SetAisleDeviceLocation() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return false;
	}
	
	/**
	 * 删除通道设备
	 */
	public boolean delAisleDeviceLocation(String id){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			String sql = String.format(" CALL PRO_DeleteAisleDeviceLocation(%s);",id);
			
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("SetAisleDeviceLocation() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return false;
	}


	public ArrayList<MdcControl> getMdcControlByName(String mdcId,String controlName){
		DatabaseHelper dbHelper = null;
		ArrayList<MdcControl> list = new ArrayList<MdcControl>();
		try
		{
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append(String.format("SELECT * FROM MDC_Control WHERE ControlName = '%s'",controlName));
			if(mdcId == null)
				sb.append(" AND MdcId IS NULL;");
			else
				sb.append(String.format(" AND MdcId = %s;",mdcId));


			DataTable dt = dbHelper.executeToTable(sb.toString());
			//System.out.println("SQL:"+sb.toString());

			list = MdcControl.fromDataTable(dt);

			if(list.size() == 0)
				return new ArrayList<MdcControl>();
		} catch (Exception e) {
			log.error("getMdcControlByName() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return list;
	}

	public boolean settingMdcControl(MdcControl mc){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql = String.format(" CALL PRO_SettingMdcControl(%s,'%s',%s,%s,'%s',%s);",
					mc.getMdcId() == null ? "NULL" : mc.getMdcId(),
					mc.getControlName(),mc.getEquipmentId(),mc.getBaseTypeId(),mc.getParameterValues(),
					mc.getPassword() == null ? "NULL" : String.format("'%s'",mc.getPassword()));

			dbHelper.executeNoQuery(sql);
			//System.out.println("SQL:"+sql);
			return true;
		} catch (Exception e) {
			log.error("SetAisleDeviceLocation() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return false;
	}

	public boolean removeMdcControl(String mdcId,String controlName){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			StringBuffer sb = new StringBuffer();
			sb.append(String.format("DELETE FROM MDC_Control WHERE ControlName = '%s'",controlName));
			if(mdcId == null)
				sb.append(" AND MdcId IS NULL;");
			else
				sb.append(String.format(" AND MdcId = %s;",mdcId));

			dbHelper.executeNoQuery(sb.toString());
			//System.out.println("SQL:"+sb.toString());
			return true;
		} catch (Exception e) {
			log.error("SetAisleDeviceLocation() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return false;
	}


	public ArrayList<AisleDeviceLocation> getAllAisleDeviceList(){
		DatabaseHelper dbHelper = null;
		ArrayList<AisleDeviceLocation> list = new ArrayList<AisleDeviceLocation>();
		try
		{
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();

			sb.append("SELECT A.DeviceType,A.TableRow,A.TableCol,CONCAT(B.Type,B.Site) AS Site,C.EquipmentId,C.EquipmentName ");
			sb.append("FROM MDC_AisleDeviceLocation A ");
			sb.append("LEFT JOIN MDC_Environment B ON A.TableId = B.Id ");
			sb.append("LEFT JOIN TBL_Equipment C ON B.EquipmentId = C.EquipmentId ");
			sb.append("WHERE A.TableName = 'MDC_Environment' ");
			sb.append("UNION ");
			sb.append("SELECT A.DeviceType,A.TableRow,A.TableCol,'thermalHumidity' AS Site,C.EquipmentId,C.EquipmentName ");
			sb.append("FROM MDC_AisleDeviceLocation A ");
			sb.append("LEFT JOIN MDC_AisleThermalHumidity B ON A.TableId = B.Id ");
			sb.append("LEFT JOIN TBL_Equipment C ON (B.TDeviceId = C.EquipmentId OR B.HDeviceId = C.EquipmentId ) ");
			sb.append("WHERE A.TableName = 'MDC_AisleThermalHumidity' ");
			sb.append("UNION ");
			sb.append("SELECT A.Type,0,0,CONCAT(A.Type,A.Site) AS Site,B.EquipmentId,B.EquipmentName FROM MDC_Environment A ");
			sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentId = B.EquipmentId ");
			sb.append("WHERE A.Type = 'water' OR A.Type = 'door'; ");

			DataTable dt = dbHelper.executeToTable(sb.toString());

			list = AisleDeviceLocation.fromDataTables(dt);
		} catch (Exception e) {
			log.error("getAisleDeviceLocation() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return list;
	}
}
