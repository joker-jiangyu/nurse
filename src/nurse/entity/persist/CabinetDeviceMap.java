package nurse.entity.persist;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONArray;
import org.json.JSONObject;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.DatabaseHelper;

public class CabinetDeviceMap implements Comparable<CabinetDeviceMap> {
	
	public String cabinetId;//机柜编号
	public String equipmentBaseType;//设备基类类型
	public String equipmentId;//设备编号
	public String equipmentName;//设备名称
	public String uIndex;//U位
	public String uHeight;//U高度
	public String sigDeviceId;//非机柜设备ID列表
	public String sigSiganlId;//非机柜设备信号ID列表
	
	public String PhaseACurrentDeviceId;
	public String PhaseACurrentSignalId;
	public String PhaseAVoltageDeviceId;
	public String PhaseAVoltageSignalId;
	public String PhaseBCurrentDeviceId;
	public String PhaseBCurrentSignalId;
	public String PhaseBVoltageDeviceId;
	public String PhaseBVoltageSignalId;
	public String PhaseCCurrentDeviceId;
	public String PhaseCCurrentSignalId;
	public String PhaseCVoltageDeviceId;
	public String PhaseCVoltageSignalId;

	public String baseTypeId;//基类编号
	public String cabinetName;//机柜名称
	public String cabinetStatus;//机柜状态
	public int connectState = -1;//连接状态
	public String cabinetType;//机柜类型
	public double current;//即时电流
	public double power;//即时功率
	public double ratedCurrent;//额定电流
	public double ratedVoltage;//额定电压
	public double ratedPower;//额定功率
	
	public Integer UIndex;//设备在机柜中的U位
	public Integer UHeight;//设备在机柜中的U高
	
	public String side;
	
	public String description;
	/**
	 * 机柜列表
	 */
	public static ArrayList<CabinetDeviceMap> fromCabinetDataTable(DataTable dt) {
		HashMap<String, CabinetDeviceMap> map = new HashMap<String, CabinetDeviceMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			CabinetDeviceMap cdm = new CabinetDeviceMap();
			
			int id = parseInt(dataRow.getValueAsString("Id"));
			deviceSiganalIdByCabinetId(cdm,id);
			
			cdm.cabinetId = String.format("cabinet%s", id%100);
			String ebt = dataRow.getValueAsString("EquipmentBaseType");
			cdm.equipmentBaseType = ebt == null ? "" : ebt;
			String ei = dataRow.getValueAsString("DeviceId");
			cdm.equipmentId = ei == null ? "" : ei;
			String ename = dataRow.getValueAsString("DeviceName");
			cdm.equipmentName = ename == null ? "" : ename;
			
			cdm.uIndex = String.valueOf(parseInt(dataRow.getValueAsString("UIndex")));			
			cdm.uHeight = String.valueOf(parseInt(dataRow.getValueAsString("UHeight")));
			
			cdm.PhaseACurrentDeviceId = dataRow.getValueAsString("PhaseACurrentDeviceId");
			cdm.PhaseACurrentSignalId = dataRow.getValueAsString("PhaseACurrentSignalId");
			cdm.PhaseAVoltageDeviceId = dataRow.getValueAsString("PhaseAVoltageDeviceId");
			cdm.PhaseAVoltageSignalId = dataRow.getValueAsString("PhaseAVoltageSignalId");
			cdm.PhaseBCurrentDeviceId = dataRow.getValueAsString("PhaseBCurrentDeviceId");
			cdm.PhaseBCurrentSignalId = dataRow.getValueAsString("PhaseBCurrentSignalId");
			cdm.PhaseBVoltageDeviceId = dataRow.getValueAsString("PhaseBVoltageDeviceId");
			cdm.PhaseBVoltageSignalId = dataRow.getValueAsString("PhaseBVoltageSignalId");
			cdm.PhaseCCurrentDeviceId = dataRow.getValueAsString("PhaseCCurrentDeviceId");
			cdm.PhaseCCurrentSignalId = dataRow.getValueAsString("PhaseCCurrentSignalId");
			cdm.PhaseCVoltageDeviceId = dataRow.getValueAsString("PhaseCVoltageDeviceId");
			cdm.PhaseCVoltageSignalId = dataRow.getValueAsString("PhaseCVoltageSignalId");
			
			cdm.baseTypeId = dataRow.getValueAsString("BaseTypeId");
			cdm.cabinetName = dataRow.getValueAsString("Name");//collapseString(dataRow.getValueAsString("Name"),4,"<br/>");
			cdm.side = dataRow.getValueAsString("Side");
			cdm.cabinetType = dataRow.getValueAsString("CabinetType");
			String voltage = dataRow.getValueAsString("RatedVoltage");
			cdm.ratedVoltage = parseDouble(voltage);
			String current = dataRow.getValueAsString("RatedCurrent");
			cdm.ratedCurrent = parseDouble(current);
			cdm.ratedPower = cdm.ratedVoltage * cdm.ratedCurrent;
			cdm.cabinetStatus = "normal";
			
			cdm.description = dataRow.getValueAsString("Description");
			
			if(map.containsKey(cdm.cabinetId)){
				CabinetDeviceMap item = map.get(cdm.cabinetId);
				if(item.uIndex == null || item.uIndex.equals("")){
					item.equipmentBaseType = cdm.equipmentBaseType;
					item.equipmentId = cdm.equipmentId;
					item.equipmentName = cdm.equipmentName;
					item.uIndex = cdm.uIndex;
					item.uHeight = cdm.uHeight;
				}else if(cdm.uIndex != null || !cdm.uIndex.equals("")){
					item.equipmentBaseType = String.format("%s,%s", item.equipmentBaseType,cdm.equipmentBaseType);
					item.equipmentId = String.format("%s,%s", item.equipmentId,cdm.equipmentId);
					item.equipmentName = String.format("%s,%s", item.equipmentName,cdm.equipmentName);
					item.uIndex = String.format("%s,%s", item.uIndex,cdm.uIndex);
					item.uHeight = String.format("%s,%s", item.uHeight,cdm.uHeight);
				}
			}else{
				map.put(cdm.cabinetId, cdm);
			}
		}
		ArrayList<CabinetDeviceMap> list = new ArrayList<CabinetDeviceMap>();
		list.addAll(map.values());
		return list;
	}
	
	/**
	 * 根据机柜编号给非机柜设备相关列绑定值
	 * @param cdm
	 */
	private static void deviceSiganalIdByCabinetId(CabinetDeviceMap cdm,int cabinetId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT CabinetId,DeviceId,SignalId FROM cabinet_signal_map WHERE CabinetId = %s;";
			DataTable dt = dbHelper.executeToTable(String.format(sql, cabinetId));		
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			for(int i = 0;i < rowCount; i++){
				DataRow dataRow = drs.get(i);
				String deviceId = dataRow.getValueAsString("DeviceId");
				String signalId = dataRow.getValueAsString("SignalId");
				if(cdm.sigDeviceId == null || cdm.sigDeviceId.equals("")){
					cdm.sigDeviceId = deviceId;
					cdm.sigSiganlId = signalId;
				}else if(deviceId != null && !deviceId.equals("")){
					cdm.sigDeviceId = String.format("%s,%s", cdm.sigDeviceId,deviceId);
					cdm.sigSiganlId = String.format("%s,%s", cdm.sigSiganlId,signalId);
				}
			}
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	} 
	
	/**
	 * 指定位置插入字符
	 */
	private static String collapseString(String str,int size,String insert){
		if(str == null || str.equals("")) return "";
		
		int strLength = str.length();//字符串长度
		if(strLength<=size) return str;
		
		//不拆开数值换行
		Pattern p = Pattern.compile("\\d{1,}");
		Matcher m = p.matcher(str);
        m.find();
		String num = m.group();
		if(str.indexOf(num) < size){
			if((str.indexOf(num) + num.length()) == (size+1))
				size = (size+1);
			else if((str.indexOf(num) + num.length()) == (size+2))
				size = (size+2);
		}
		
		int insLength = insert.length();//插入字符长度
		int times = strLength%size==0 ? strLength/size-1 : strLength/size;//插入次数
		StringBuffer sb = new StringBuffer(str);
		for(int i=0;i<times;i++){
			int index = i*(size+insLength)+size;//插入位置
			sb.insert(index, insert);
		}
		return sb.toString();
	}
	
	/**
	 * 其他环境量列表
	 */
	public static ArrayList<CabinetDeviceMap> fromOtherSignalDataTable(DataTable dt) {
		ArrayList<CabinetDeviceMap> cdms = new ArrayList<CabinetDeviceMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			CabinetDeviceMap cdm = null;
			cdm = new CabinetDeviceMap();
			cdm.PhaseACurrentDeviceId = dataRow.getValueAsString("EquipmentId");
			cdm.equipmentName = dataRow.getValueAsString("EquipmentName");
			cdm.PhaseACurrentSignalId = dataRow.getValueAsString("SignalId");
			cdm.cabinetId = dataRow.getValueAsString("Type")+dataRow.getValueAsString("Site");
			cdm.cabinetStatus = "normal";
			cdm.cabinetType = "imagesignal";//环境量
			cdms.add(cdm);
		}
		return cdms;
	}
	
	// 获得机柜信号
	public static ArrayList<CabinetDeviceMap> fromCabinetSignalListData(DataTable dt){
		ArrayList<CabinetDeviceMap> cdms = new ArrayList<CabinetDeviceMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			CabinetDeviceMap cdm = new CabinetDeviceMap();
			
			cdm.PhaseACurrentDeviceId = dataRow.getValueAsString("PhaseACurrentDeviceId");
			cdm.PhaseACurrentSignalId = dataRow.getValueAsString("PhaseACurrentSignalId");
			cdm.PhaseAVoltageDeviceId = dataRow.getValueAsString("PhaseAVoltageDeviceId");
			cdm.PhaseAVoltageSignalId = dataRow.getValueAsString("PhaseAVoltageSignalId");
			cdm.PhaseBCurrentDeviceId = dataRow.getValueAsString("PhaseBCurrentDeviceId");
			cdm.PhaseBCurrentSignalId = dataRow.getValueAsString("PhaseBCurrentSignalId");
			cdm.PhaseBVoltageDeviceId = dataRow.getValueAsString("PhaseBVoltageDeviceId");
			cdm.PhaseBVoltageSignalId = dataRow.getValueAsString("PhaseBVoltageSignalId");
			cdm.PhaseCCurrentDeviceId = dataRow.getValueAsString("PhaseCCurrentDeviceId");
			cdm.PhaseCCurrentSignalId = dataRow.getValueAsString("PhaseCCurrentSignalId");
			cdm.PhaseCVoltageDeviceId = dataRow.getValueAsString("PhaseCVoltageDeviceId");
			cdm.PhaseCVoltageSignalId = dataRow.getValueAsString("PhaseCVoltageSignalId");
			
			cdms.add(cdm);
		}
		return cdms;
	}
	
	public static ArrayList<CabinetDeviceMap> fromPowerConsumptionData(DataTable dt){
		ArrayList<CabinetDeviceMap> cdms = new ArrayList<CabinetDeviceMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			CabinetDeviceMap cdm = new CabinetDeviceMap();
			
			cdm.PhaseACurrentDeviceId = dataRow.getValueAsString("PowerConsumptionDeviceId");
			cdm.PhaseACurrentSignalId = dataRow.getValueAsString("PowerConsumptionSignalId");
			
			cdms.add(cdm);
		}
		return cdms;
	}
	
	public static List<CabinetDeviceMap> getJsonListCabinet(String jsonParams) throws Exception{
		List<CabinetDeviceMap> list = new ArrayList<CabinetDeviceMap>();
		JSONArray array = new JSONArray(jsonParams);
		for(int i = 0;i<array.length();i++){
			JSONObject param = new JSONObject(array.get(i).toString());
			CabinetDeviceMap cdm = new CabinetDeviceMap();
			
			cdm.cabinetId = param.getString("cabinetId");
			cdm.equipmentBaseType = param.getString("equipmentBaseType");
			cdm.equipmentId = param.getString("equipmentId");
			
			cdm.PhaseACurrentDeviceId = param.getString("PhaseACurrentDeviceId");
			cdm.PhaseACurrentSignalId = param.getString("PhaseACurrentSignalId");
			cdm.PhaseAVoltageDeviceId = param.getString("PhaseAVoltageDeviceId");
			cdm.PhaseAVoltageSignalId = param.getString("PhaseAVoltageSignalId");
			cdm.PhaseBCurrentDeviceId = param.getString("PhaseBCurrentDeviceId");
			cdm.PhaseBCurrentSignalId = param.getString("PhaseBCurrentSignalId");
			cdm.PhaseBVoltageDeviceId = param.getString("PhaseBVoltageDeviceId");
			cdm.PhaseBVoltageSignalId = param.getString("PhaseBVoltageSignalId");
			cdm.PhaseCCurrentDeviceId = param.getString("PhaseCCurrentDeviceId");
			cdm.PhaseCCurrentSignalId = param.getString("PhaseCCurrentSignalId");
			cdm.PhaseCVoltageDeviceId = param.getString("PhaseCVoltageDeviceId");
			cdm.PhaseCVoltageSignalId = param.getString("PhaseCVoltageSignalId");

			cdm.baseTypeId = param.getString("baseTypeId");
			cdm.cabinetName = param.getString("cabinetName");
			cdm.cabinetStatus = param.getString("cabinetStatus");
			cdm.cabinetType = param.getString("cabinetType");
			cdm.current = parseDouble(param.getString("current"));
			cdm.ratedCurrent = parseDouble(param.getString("ratedCurrent"));
			cdm.ratedVoltage = parseDouble(param.getString("ratedVoltage"));
			cdm.ratedPower = parseDouble(param.getString("ratedPower"));
			
			cdm.sigDeviceId = param.getString("sigDeviceId");
			cdm.sigSiganlId = param.getString("sigSiganlId");
			
			list.add(cdm);
		}
		return list;
	}
	
	/**
	 * 从MDC_CabinetDeviceMap表查找数据
	 * @param dt
	 * @return ArrayList of CabinetDeviceMap
	 */
	public static ArrayList<CabinetDeviceMap> fromCabinetDeviceMapTable(DataTable dt){
		ArrayList<CabinetDeviceMap> cdms = new ArrayList<CabinetDeviceMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			CabinetDeviceMap cdm = new CabinetDeviceMap();
			
			cdm.cabinetId = dataRow.getValueAsString("CabinetId");
			cdm.equipmentId = dataRow.getValueAsString("DeviceId");
			cdm.equipmentName = dataRow.getValueAsString("DeviceName");
			String uIndex = dataRow.getValueAsString("UIndex");
			if (uIndex != null && !uIndex.equals("")) {
				cdm.UIndex = parseInt(uIndex);
			}
			String uHeight = dataRow.getValueAsString("UHeight");
			if (uHeight != null && !uHeight.equals("")) {
				cdm.UHeight = parseInt(uHeight);
			}
			cdms.add(cdm);
		}
		return cdms;
	}
	
	public static int parseInt(String s){
		try {
			return Integer.parseInt(s);
		} catch (Exception e) {
			return 0;
		}
	}

	public static int parseInt(Object obj){
		if(obj == null) return 0;
		try {
			return Integer.parseInt(obj.toString());
		} catch (Exception e) {
				return 0;
		}
	}
	
	public static double parseDouble(String s){
		try {
			return Double.parseDouble(s);
		} catch (Exception e) {
			return 0;
		}
	}
	
	public static double parseDouble(Object obj){
		try {
			return Double.parseDouble(obj.toString());
		} catch (Exception e) {
			return 0;
		}
	}

	@Override
	public int compareTo(CabinetDeviceMap o) {
		if(o == null || o.UIndex == null || this.UIndex == null){ 
			return -1;
		}
		return this.UIndex.compareTo(o.UIndex);
	}
	
	public boolean isDeviceNotNull(){
		if((this.UHeight == null || this.UHeight == 0))
			return false;
		return true;
	}
	
	public boolean isDeviceANdSignalNotNull(){
		if((this.PhaseACurrentDeviceId == null || this.PhaseACurrentDeviceId.equals("")) && 
				(this.PhaseACurrentSignalId == null || this.PhaseACurrentSignalId.equals("")) && 
				(this.PhaseAVoltageDeviceId == null || this.PhaseAVoltageDeviceId.equals("")) && 
				(this.PhaseAVoltageSignalId == null || this.PhaseAVoltageSignalId.equals("")) &&
			(this.PhaseBCurrentDeviceId == null || this.PhaseBCurrentDeviceId.equals("")) && 
				(this.PhaseBCurrentSignalId == null || this.PhaseBCurrentSignalId.equals("")) && 
				(this.PhaseBVoltageDeviceId == null || this.PhaseBVoltageDeviceId.equals("")) && 
				(this.PhaseBVoltageSignalId == null || this.PhaseBVoltageSignalId.equals("")) &&
			(this.PhaseCCurrentDeviceId == null || this.PhaseCCurrentDeviceId.equals("")) && 
				(this.PhaseCCurrentSignalId == null || this.PhaseCCurrentSignalId.equals("")) && 
				(this.PhaseCVoltageDeviceId == null || this.PhaseCVoltageDeviceId.equals("")) && 
				(this.PhaseCVoltageSignalId == null || this.PhaseCVoltageSignalId.equals("")))
			return false;
		return true;
	}
}
