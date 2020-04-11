package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class CabinetSignalMap {
	public String cabinetId;// 机柜编号
	public String deviceId;// 设备编号
	public String signalId;// 信号编号

	public String cabinetName;//机柜名称
	public String deviceName;//设备名称
	public String signalName;//信号名称

	public static ArrayList<CabinetSignalMap> fromDataTable(DataTable dt) {
		ArrayList<CabinetSignalMap> list = new ArrayList<CabinetSignalMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for (int i = 0; i < rowCount; i++) {
			DataRow dataRow = drs.get(i);
			CabinetSignalMap cabinetSignalMap = new CabinetSignalMap();
			cabinetSignalMap.cabinetId = dataRow.getValueAsString("CabinetId");
			cabinetSignalMap.deviceId = dataRow.getValueAsString("DeviceId");
			cabinetSignalMap.signalId = dataRow.getValueAsString("SignalId");
			list.add(cabinetSignalMap);
		}
		return list;
	}
	public static ArrayList<CabinetSignalMap> fromEventDataTable(DataTable dt) {
		ArrayList<CabinetSignalMap> list = new ArrayList<CabinetSignalMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for (int i = 0; i < rowCount; i++) {
			DataRow dataRow = drs.get(i);
			CabinetSignalMap cabinetSignalMap = new CabinetSignalMap();
			cabinetSignalMap.cabinetId = dataRow.getValueAsString("CabinetId");
			cabinetSignalMap.cabinetName = dataRow.getValueAsString("Name");
			cabinetSignalMap.deviceId = dataRow.getValueAsString("DeviceId");
			cabinetSignalMap.deviceName = dataRow.getValueAsString("EquipmentName");
			cabinetSignalMap.signalId = dataRow.getValueAsString("SignalId");
			cabinetSignalMap.signalName = dataRow.getValueAsString("EventName");
			list.add(cabinetSignalMap);
		}
		return list;
	}
	
	public static ArrayList<CabinetSignalMap> fromAllEventDataTable(DataTable dt){
		ArrayList<CabinetSignalMap> list = new ArrayList<CabinetSignalMap>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for (int i = 0; i < rowCount; i++) {
			DataRow dataRow = drs.get(i);
			CabinetSignalMap cabinetSignalMap = new CabinetSignalMap();
			cabinetSignalMap.deviceId = dataRow.getValueAsString("EquipmentId");
			cabinetSignalMap.deviceName = dataRow.getValueAsString("EquipmentName");
			cabinetSignalMap.signalId = dataRow.getValueAsString("SignalId");
			cabinetSignalMap.signalName = dataRow.getValueAsString("EventName");
			list.add(cabinetSignalMap);
		}
		return list;
	}
}
