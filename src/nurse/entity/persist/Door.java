package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.JsonHelper;

public class Door {
	public int doorId;
	public int doorNo;
	public String doorName;
	public int stationId;
	public int equipmentId;
	public String equipmentName;
	public int samplerUnitId;
	public int category;
	public String address;
	public int wokeMode;
	public int infrared;
	public String password;
	public int doorControlId;
	public int doorInterval;
	public int openDelay;
	public int encryption;
	
	public String timeGroups;

	public static ArrayList<Door> fromDataTable(DataTable dt) {
		ArrayList<Door> ds = new ArrayList<Door>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Door d = new Door();
			
			d.doorId = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorId")); 
			d.doorNo = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorNo"));
			d.doorName = drs.get(i).getValueAsString("DoorName");
			d.stationId = CabinetDeviceMap.parseInt(drs.get(i).getValue("StationId"));
			d.equipmentId = CabinetDeviceMap.parseInt(drs.get(i).getValue("EquipmentId"));
			d.equipmentName = drs.get(i).getValueAsString("EquipmentName");
			d.samplerUnitId = CabinetDeviceMap.parseInt(drs.get(i).getValue("SamplerUnitId"));
			d.category = CabinetDeviceMap.parseInt(drs.get(i).getValue("Category"));
			d.address = drs.get(i).getValueAsString("Address");
			d.wokeMode = CabinetDeviceMap.parseInt(drs.get(i).getValue("WokeMode"));
			d.infrared = CabinetDeviceMap.parseInt(drs.get(i).getValue("Infrared"));
			d.password = drs.get(i).getValueAsString("Password");
			d.doorControlId = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorControlId"));
			d.doorInterval = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorInterval"));
			d.openDelay = CabinetDeviceMap.parseInt(drs.get(i).getValue("OpenDelay"));
			d.encryption = CabinetDeviceMap.parseInt(drs.get(i).getValue("Encryption"));
			
			ds.add(d);
		}
		return ds;
	}
	
	public static ArrayList<Door> fromDataTable(DataTable dt,ArrayList<TimeGroup> list) {
		ArrayList<Door> ds = new ArrayList<Door>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Door d = new Door();
			
			d.doorId = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorId")); 
			d.doorNo = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorNo"));
			d.doorName = drs.get(i).getValueAsString("DoorName");
			d.stationId = CabinetDeviceMap.parseInt(drs.get(i).getValue("StationId"));
			d.equipmentId = CabinetDeviceMap.parseInt(drs.get(i).getValue("EquipmentId"));
			d.samplerUnitId = CabinetDeviceMap.parseInt(drs.get(i).getValue("SamplerUnitId"));
			d.category = CabinetDeviceMap.parseInt(drs.get(i).getValue("Category"));
			d.address = drs.get(i).getValueAsString("Address");
			d.wokeMode = CabinetDeviceMap.parseInt(drs.get(i).getValue("WokeMode"));
			d.infrared = CabinetDeviceMap.parseInt(drs.get(i).getValue("Infrared"));
			d.password = drs.get(i).getValueAsString("Password");
			d.doorControlId = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorControlId"));
			d.doorInterval = CabinetDeviceMap.parseInt(drs.get(i).getValue("DoorInterval"));
			d.openDelay = CabinetDeviceMap.parseInt(drs.get(i).getValue("OpenDelay"));
			
			d.timeGroups = JsonHelper.ListjsonArray(list).toString();
			
			ds.add(d);
		}
		return ds;
	}
}
