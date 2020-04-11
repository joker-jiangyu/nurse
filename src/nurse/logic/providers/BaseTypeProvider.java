package nurse.logic.providers;

import java.util.ArrayList;
import java.util.HashMap;

import org.apache.log4j.Logger;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.Control;
import nurse.entity.persist.ControlMeanings;
import nurse.entity.persist.DeviceBaseType;
import nurse.entity.persist.Equipment;
import nurse.entity.persist.Event;
import nurse.entity.persist.Signal;
import nurse.entity.persist.SignalBaseType;
import nurse.utility.DatabaseHelper;

public class BaseTypeProvider {

	private static BaseTypeProvider instance = new BaseTypeProvider();
	private static Logger log = Logger.getLogger(BaseTypeProvider.class);
	private static HashMap<String, ArrayList<Control>> mapControls = new HashMap<String, ArrayList<Control>>();

	public BaseTypeProvider() {
	}
	
	public static BaseTypeProvider getInstance(){
		return instance;
	}

	public void clearBaseTypeList(){
		mapControls.clear();
	}
	
	public ArrayList<SignalBaseType> GetAllSignalBaseTypes()
	{
		return ConfigCache.getInstance().getSignalBaseTypes();
	}
	
	public ArrayList<DeviceBaseType> GetAllDeviceBaseTypes()
	{
		return ConfigCache.getInstance().getDeviceBaseTypes();
	}
	
	public ArrayList<SignalBaseType> GetGaugeSignalBaseType(int deviceId){
		ArrayList<SignalBaseType> gaugeSignals = new ArrayList<SignalBaseType>();
		DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT A.BaseTypeId,A.SignalName,A.Unit,B.EquipmentId,B.EquipmentName ");
            sb.append("FROM TBL_Signal A ");
            sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
            sb.append(String.format("WHERE B.EquipmentId = %s AND A.SignalCategory = 1 ", deviceId));
            sb.append("AND DataType = 0 AND A.BaseTypeId IS NOT NULL;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
    		DataRowCollection drs = dt.getRows();
    		int rowCount = dt.getRowCount();
    		for(int i=0;i<rowCount;i++)
    		{
    			SignalBaseType si = new SignalBaseType();
    			si.baseTypeName = drs.get(i).getValueAsString("SignalName");			
    			si.remark = drs.get(i).getValueAsString("Unit");	
    			
    			String baseTypeIdStr = drs.get(i).getValueAsString("BaseTypeId");
    			si.baseTypeId = baseTypeIdStr == null ? 0 : Long.parseLong(baseTypeIdStr);
    			
    			si.deviceBaseTypeId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
    			si.deviceBaseName = drs.get(i).getValueAsString("EquipmentName");
    			gaugeSignals.add(si);
    		}
            
		} catch (Exception e) {
			log.error("fail to read all sig basetypes", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        return gaugeSignals;
	}
	public ArrayList<Control> GetAllControlBaseDevice(int deviceId,int CommandType){
		DatabaseHelper dbHelper = null;
        ArrayList<Control> res = new ArrayList<Control>();
		String key = String.valueOf(deviceId).concat(String.valueOf(CommandType));
		if(mapControls.containsKey(key)) return mapControls.get(key);
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT B.ControlId,B.ControlName,B.BaseTypeId,B.CommandType,B.`MaxValue`,B.MinValue ");
            sb.append("FROM tbl_equipment A ");
            sb.append("LEFT JOIN tbl_control B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
            sb.append("WHERE BaseTypeId is not null AND A.EquipmentId = %s");
            if(CommandType > 0)
				sb.append(" AND CommandType = %s;");
            
            String sql = String.format(sb.toString(), deviceId,CommandType);
            DataTable dt = dbHelper.executeToTable(sql);
            
    		DataRowCollection drs = dt.getRows();
    		int rowCount = dt.getRowCount();
    		for(int i=0;i<rowCount;i++)
    		{
    			Control cs = new Control();
    			cs.ControlId = Integer.parseInt(drs.get(i).getValueAsString("ControlId"));
    			cs.ControlName = drs.get(i).getValueAsString("ControlName");
    			cs.BaseTypeId = Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
    			cs.CommandType = Integer.parseInt(drs.get(i).getValueAsString("CommandType"));
    			cs.MaxValue = Float.parseFloat(drs.get(i).getValueAsString("MaxValue"));
    			cs.MinValue = Float.parseFloat(drs.get(i).getValueAsString("MinValue"));
    			
    			res.add(cs);
    		}
    		mapControls.put(key, res);
		} catch (Exception e) {
			log.error("fail to Control all", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        return res;
	}
	public ArrayList<ControlMeanings> GetControlTypeByControlId(int deviceId,int controlId){
		DatabaseHelper dbHelper = null;
		ArrayList<ControlMeanings> cms = new ArrayList<ControlMeanings>();
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT B.EquipmentTemplateId,B.ControlId,B.ParameterValue,B.Meanings,B.BaseCondId ");
            sb.append("FROM tbl_control A ");
            sb.append("LEFT JOIN tbl_controlmeanings B ON A.ControlId = B.ControlId ");
            sb.append("LEFT JOIN TBL_Equipment C ON A.EquipmentTemplateId = C.EquipmentTemplateId ");
            sb.append("WHERE B.EquipmentTemplateId IS NOT NULL AND C.EquipmentId = %s AND A.BaseTypeId = %s GROUP BY B.ParameterValue;");
            String sql = String.format(sb.toString(), deviceId, controlId);
            
            DataTable dt = dbHelper.executeToTable(sql);
    		DataRowCollection drs = dt.getRows();
    		int rowCount = dt.getRowCount();
    		for(int i=0;i<rowCount;i++)
    		{
    			ControlMeanings cm = new ControlMeanings();
    			cm.EquipmentTemplateId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentTemplateId"));
    			cm.ControlId = Integer.parseInt(drs.get(i).getValueAsString("ControlId"));
    			String bc = drs.get(i).getValueAsString("BaseCondId");
    			cm.BaseCondId = bc == null ? 0 : Integer.parseInt(bc);
    			cm.ParameterValue = Short.parseShort(drs.get(i).getValueAsString("ParameterValue"));
    			cm.Meanings = drs.get(i).getValueAsString("Meanings");
    			
    			cms.add(cm);
    		}
		} catch (Exception e) {
			log.error("fail to Control Type", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return cms;
	}
	
	public ArrayList<Control> GetRegulateBaseType(int deviceId){
		ArrayList<Control> lists = new ArrayList<Control>();
		DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT B.ControlId,B.ControlName,B.BaseTypeId,B.`MaxValue`,B.MinValue ");
            sb.append("FROM tbl_equipment A ");
            sb.append("LEFT JOIN tbl_control B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
            sb.append("WHERE B.CommandType = 1 AND BaseTypeId is not null AND A.EquipmentId = %s;");
            String sql = String.format(sb.toString(), deviceId);
            
            DataTable dt = dbHelper.executeToTable(sql);
    		DataRowCollection drs = dt.getRows();
    		int rowCount = dt.getRowCount();
    		for(int i=0;i<rowCount;i++)
    		{
    			Control ct = new Control();
    			ct.ControlId = Integer.parseInt(drs.get(i).getValueAsString("ControlId"));
    			ct.ControlName = drs.get(i).getValueAsString("ControlName");
    			ct.BaseTypeId = Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
    			ct.MaxValue = Float.parseFloat(drs.get(i).getValueAsString("MaxValue"));
    			ct.MinValue = Float.parseFloat(drs.get(i).getValueAsString("MinValue"));
    			
    			lists.add(ct);
    		}
		} catch (Exception e) {
			log.error("fail to Regulate Type", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return lists;
	}
	public ArrayList<SignalBaseType> getAllSBT(){
		DatabaseHelper dbh = null;
		ArrayList<SignalBaseType> list = new ArrayList<SignalBaseType>();
		try {
			dbh = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT A.SignalId,CONCAT(B.EquipmentName,' - ',A.SignalName) AS SignalName,A.Description,A.BaseTypeId,B.EquipmentId ");
			sql.append("from tbl_signal A ");
			sql.append("LEFT JOIN tbl_equipment B on A.EquipmentTemplateId=B.EquipmentTemplateId ");
			sql.append("where B.EquipmentCategory>50 And B.EquipmentCategory< 56 AND A.BaseTypeId is not null and SignalId!=-3;");
			DataTable dt = dbh.executeToTable(sql.toString());
			SignalBaseType sbt = null;
			for (int i = 0; i < dt.getRowCount(); i++) {
				sbt = new SignalBaseType();
				sbt.baseTypeName = dt.getRows().get(i).getValueAsString("SignalName");
				sbt.remark = dt.getRows().get(i).getValueAsString("Description");
				sbt.baseTypeId = Long.parseLong(dt.getRows().get(i).getValueAsString("BaseTypeId"));
				sbt.deviceBaseTypeId = Integer.parseInt(dt.getRows().get(i).getValueAsString("EquipmentId"));
				list.add(sbt);
			}
			log.debug("SignalBaseTypeList:"+list.toString());
		} catch (Exception e) {
			log.error("not data SignalBaseType");
		}finally{
			dbh.close();
		}
		return list;
	}
	
	public ArrayList<Equipment> GetDeviceList(){
		DatabaseHelper dbh = null;
		ArrayList<Equipment> list = new ArrayList<Equipment>();
		try {
			dbh = new DatabaseHelper();
			String sql = "SELECT * FROM TBL_Equipment;";
			DataTable dt = dbh.executeToTable(sql);
			list = Equipment.fromDataTable(dt);
		} catch (Exception e) {
			log.error("not data DeviceList");
		}finally{
			dbh.close();
		}
		return list;
	}
	
	public ArrayList<Event> GetEventsByDeviceId(String deviceId){
		DatabaseHelper dbh = null;
		ArrayList<Event> list = new ArrayList<Event>();
		try {
			dbh = new DatabaseHelper();
			String sql = String.format("SELECT A.* FROM TBL_Event A,TBL_Equipment B WHERE A.EquipmentTemplateId = B.EquipmentTemplateId AND B.EquipmentId = %s;", deviceId);
			DataTable dt = dbh.executeToTable(sql);
			list = Event.fromDataTable(dt);
		} catch (Exception e) {
			log.error("not data DeviceList");
		}finally{
			dbh.close();
		}
		return list;
	}
	
	public ArrayList<Signal> GetSignalSwitchByDeviceId(String equipmentId){
		DatabaseHelper dbh = null;
		ArrayList<Signal> list = new ArrayList<Signal>();
		try {
			dbh = new DatabaseHelper();
			String sql = String.format("SELECT A.* FROM TBL_Signal A,TBL_Equipment B WHERE A.EquipmentTemplateId = B.EquipmentTemplateId AND A.SignalCategory = 2 AND A.BaseTypeId IS NOT NULL AND B.EquipmentId = %s;", equipmentId);
			DataTable dt = dbh.executeToTable(sql);
			list = Signal.fromDataTable(dt);
		} catch (Exception e) {
			log.error("not data DeviceList");
		}finally{
			dbh.close();
		}
		return list;
	}
}
