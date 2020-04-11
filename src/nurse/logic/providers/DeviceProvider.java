package nurse.logic.providers;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import nurse.entity.persist.*;
import nurse.logic.handlers.LanguageDataHandler;
import nurse.utility.BaseEntity;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.logic.handlers.ActiveDeviceDataHandler;
import nurse.utility.DatabaseHelper;

public class DeviceProvider {

	private static DeviceProvider instance = new DeviceProvider();
	private static Logger log = Logger.getLogger(DeviceProvider.class);
	private long nowTime = 0;
	
	public DeviceProvider() {

	}
	
	public static DeviceProvider getInstance(){
		return instance;
	}

	public ArrayList<Device> GetAllDevices() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT A.StationId, A.EquipmentId, A.EquipmentName, A.EquipmentStyle, A.Vendor,\r\n");
            sb.append("A.EquipmentTemplateId,A.HouseId,A.ConnectState,A.Description, IFNULL(B.EquipmentBaseType, 0) as baseType \r\n");
            sb.append("from tbl_equipment A \r\n");
            sb.append("INNER JOIN tbl_equipmenttemplate B ON A.EquipmentTemplateId = B.EquipmentTemplateId;\r\n");                       
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return Device.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all devices", e);
			return new ArrayList<Device>();	
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		
	}
	
	public List<EquipmentBaseType> getAllDeviceType(){
		DatabaseHelper dbh = null;
		List<EquipmentBaseType> lists = new ArrayList<EquipmentBaseType>();
		try {
			dbh = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT DISTINCT C.BaseEquipmentId,C.BaseEquipmentName from tbl_equipment A ");
			sql.append("LEFT JOIN tbl_equipmenttemplate B on A.EquipmentTemplateId = B.EquipmentTemplateId ");
			sql.append("LEFT JOIN tbl_equipmentbasetype C on B.EquipmentBaseType=C.BaseEquipmentId ");
			sql.append("where B.EquipmentBaseType is not null and C.BaseEquipmentId != 1004;");
			DataTable dt = dbh.executeToTable(sql.toString());
			for(int i=0;i<dt.getRowCount();i++){
				EquipmentBaseType ebt = new EquipmentBaseType();
				ebt.setBaseEquipmentId((int)dt.getRows().get(i).getValue("BaseEquipmentId"));
				ebt.setBaseEquipmentName(dt.getRows().get(i).getValueAsString("BaseEquipmentName"));
				lists.add(ebt);
			}
			//“配置生效”后重新加载数据库数据到缓存中
			ConfigCache.getInstance().Load();
			ActiveDeviceDataHandler.getInstance().LoadNewActiveDevices();
			BaseTypeProvider.getInstance().clearBaseTypeList();
		} catch (Exception e) {
			log.error("Equipment Data Exception:",e);
		}finally{
			dbh.close();
		}
		return lists;
	}

	public ArrayList<DeviceInfo> getDeviceInfoById(String equipmentId){
		DatabaseHelper dbHelper = null;

		try
		{
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT A.*,B.EquipmentName,B.EquipmentSN,B.InstallTime FROM TBL_EquipmentInfo A ");
			sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentId = B.EquipmentId ");
			sb.append(String.format("WHERE A.EquipmentId = %s;",equipmentId));

			DataTable dt = dbHelper.executeToTable(sb.toString());

			return DeviceInfo.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all device info", e);
			return new ArrayList<DeviceInfo>();
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	public boolean addDeviceInfo(int equipmentId,String userName,String ipAddress){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append(String.format("CALL PRO_InsertDeviceInfo(%d,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);",equipmentId));

			dbHelper.executeNoQuery(sb.toString());

			addDeviceRecord(equipmentId,userName,ipAddress,"Add",null);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	public boolean updDeviceInfo(DeviceInfo di,String userName,String ipAddress){
		DatabaseHelper dbHelper = null;
		try {
			//判断差异
			outputDeviceOperation(di.EquipmentId,null,di,di.EquipmentSN,di.InstallTime,userName,ipAddress);

			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append(String.format("CALL PRO_InsertDeviceInfo(%d,'%s','%s','%s','%s','%s',%d,%d,'%s','%s','%s','%s','%s','%s','%s');",
					di.EquipmentId,di.EquipmentModel,di.EquipmentVersion,di.ImagesPath,di.EquipmentSN,di.InstallTime,di.UsedDate,
					di.WarrantyPeriod,di.MaintenanceTime,di.ConfigSetting,di.PatchName,di.PatchVersion,di.DigitalSignature,
					di.Location,di.Comment));

			dbHelper.executeNoQuery(sb.toString());
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	public boolean delDeviceInfo(int equipmentId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append(String.format("DELETE FROM TBL_EquipmentInfo WHERE EquipmentId = %s;",equipmentId));

			dbHelper.executeNoQuery(sb.toString());

			String comment = "";
			delDeviceRecord(equipmentId);
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	public ArrayList<DeviceRecord> getDeviceRecordById(String equipmentId){
		DatabaseHelper dbHelper = null;

		try
		{
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append(String.format("SELECT * FROM TBL_EquipmentRecord WHERE EquipmentId = %s;",equipmentId));

			DataTable dt = dbHelper.executeToTable(sb.toString());

			return DeviceRecord.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all device record", e);
			return new ArrayList<DeviceRecord>();
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	/**
	 * 新增设备操作记录
	 * operation: Add 新增设备、Modify 修改信息
	 * */
	public boolean addDeviceRecord(int equipment,String userName,String ipAddress,String operation,String comment){
		DatabaseHelper dbHelper = null;
		try {
			//System.out.println("Operation:"+operation+", Comment:"+comment);
			if(operation.equals("Add"))
				comment = LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.ManuallyAdd");

			operation = LanguageDataHandler.getLanaguageJsonValue(String.format("DeviceOperation.%s",operation));

			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append(String.format("CALL PRO_InsertDeviceRecord(%d,'%s','%s','%s','%s')",
					equipment,userName,ipAddress,operation,comment));

			//System.out.println("addDeviceRecord:"+sb.toString());
			dbHelper.executeNoQuery(sb.toString());
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	public boolean delDeviceRecord(int equipmentId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append(String.format("DELETE FROM TBL_EquipmentRecord WHERE EquipmentId = %s;",equipmentId));

			dbHelper.executeNoQuery(sb.toString());
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	//删除设备信息与设备操作
	public boolean deleteDevice(int equipmentId){
		if(!delDeviceInfo(equipmentId)) return false;
		if(!delDeviceRecord(equipmentId)) return false;
		return true;
	}

	public boolean outputDeviceOperation(int equipmentId,String equipmentName,DeviceInfo info,String equipmentSN,String installTime,String userName,String ipAddress){
		String output = "";
		Equipment oldEquipment = null;

		ArrayList<Equipment> equipments = EquipmentProvider.getInstance().GetAllEquipments();
		for(Equipment item : equipments){
			if(item.EquipmentId == equipmentId){
				oldEquipment = item;
				break;
			}
		}

		if(equipmentName != null && oldEquipment != null){
			if(!isEquals(oldEquipment.EquipmentName,equipmentName)){
				String name = LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.EquipmentName");
				output += String.format("%s(%s => %s) ",name,oldEquipment.EquipmentName,equipmentName);
			}
		}

		if(info != null){
			ArrayList<DeviceInfo> oldInfo = getDeviceInfoById(String.valueOf(equipmentId));
			if(oldInfo.size() == 0) return false;
			output += getDiffFields(oldInfo.get(0),info);

			if(oldEquipment != null){
				if(!isEquals(oldEquipment.EquipmentSN,equipmentSN)){
					String name = LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.EquipmentSN");
					output += String.format("%s(%s => %s) ",name,oldEquipment.EquipmentSN,equipmentSN);
				}
				if(!isEquals(BaseEntity.toTimeString(oldEquipment.InstallTime.toString()),installTime)){
					String name = LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.InstallTime");
					output += String.format("%s(%s => %s) ",name,oldEquipment.InstallTime,installTime);
				}
			}
		}

		if(output.length() > 0)
			return addDeviceRecord(equipmentId,userName,ipAddress,"Modify",output);
		else
			return true;
	}

	private String getDiffFields(DeviceInfo oldInfo,DeviceInfo newInfo){
		try {
			String result = "";
			/*System.out.println("------------- Old Info -------------------");
			System.out.println(oldInfo.toString());
			System.out.println("------------- New Info -------------------");
			System.out.println(newInfo.toString());
			System.out.println("------------------------------------------");*/

			if(!isEquals(oldInfo.EquipmentModel,newInfo.EquipmentModel)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.EquipmentModel"),
						oldInfo.EquipmentModel, newInfo.EquipmentModel);
			}
			if(!isEquals(oldInfo.EquipmentVersion,newInfo.EquipmentVersion)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.EquipmentVersion"),
						oldInfo.EquipmentVersion, newInfo.EquipmentVersion);
			}
			if(!isEquals(oldInfo.ImagesPath,newInfo.ImagesPath)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.ImagesPath"),
						oldInfo.ImagesPath, newInfo.ImagesPath);
			}
			if(!isEquals(oldInfo.UsedDate,newInfo.UsedDate)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.UsedDate"),
						oldInfo.UsedDate, newInfo.UsedDate);
			}
			if(oldInfo.WarrantyPeriod != newInfo.WarrantyPeriod) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.WarrantyPeriod"),
						oldInfo.WarrantyPeriod, newInfo.WarrantyPeriod);
			}
			if(!isEquals(oldInfo.MaintenanceTime,newInfo.MaintenanceTime)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.MaintenanceTime"),
						oldInfo.MaintenanceTime, newInfo.MaintenanceTime);
			}
			if(!isEquals(oldInfo.ConfigSetting,newInfo.ConfigSetting)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.ConfigSetting"),
						oldInfo.ConfigSetting, newInfo.ConfigSetting);
			}
			if(!isEquals(oldInfo.PatchName,newInfo.PatchName)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.PatchName"),
						oldInfo.PatchName, newInfo.PatchName);
			}
			if(!isEquals(oldInfo.PatchVersion,newInfo.PatchVersion)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.PatchVersion"),
						oldInfo.PatchVersion, newInfo.PatchVersion);
			}
			if(!isEquals(oldInfo.DigitalSignature,newInfo.DigitalSignature)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.DigitalSignature"),
						oldInfo.DigitalSignature, newInfo.DigitalSignature);
			}
			if(!isEquals(oldInfo.Location,newInfo.Location)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.Location"),
						oldInfo.Location, newInfo.Location);
			}
			if(!isEquals(oldInfo.Comment,newInfo.Comment)) {
				result += String.format("%s(%s => %s) ",
						LanguageDataHandler.getLanaguageJsonValue("DeviceOperation.Comment"),
						oldInfo.Comment, newInfo.Comment);
			}

			return result;
		}catch (Exception ex){
			return "";
		}
	}

	private boolean isEquals(Object obj1,Object obj2){
		try{
			if(obj1 == null && obj2 == null)
				return true;
			else if(obj1 == null && obj2 != null)
				return false;
			else if(obj1 != null && obj2 == null)
				return false;
			else{
				return String.valueOf(obj1).equals(String.valueOf(obj2));
			}
		}catch (Exception ex){
			return false;
		}
	}

	public void runTimeFactory(){
		try {
			SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
			long nowTime = format.parse(format.format(new Date())).getTime();
			//运行一天后才累加
			if(nowTime == 0) this.nowTime = nowTime;

			if(nowTime > this.nowTime){
				cumulativeRunningTime();
				this.nowTime = nowTime;
			}

		} catch (Exception e) {
			log.error("factory Exception:"+e);
		}
	}

	//Logic: 遍历TBL_DeviceInfo的UserDate，UserDate不为0时：+1，为0时：当前时间 - 安装时间
	public boolean cumulativeRunningTime(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("CALL PRO_CumulativeDeviceUsedDate();");

			dbHelper.executeNoQuery(sb.toString());
			return true;
		} catch (Exception e) {
			log.error("Database exception:",e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
}
