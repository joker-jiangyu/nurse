package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class AisleDeviceLocation {
	public Integer Id;
	public Integer TableId;
	public String TableName;
	public String DeviceType;
	public Integer TableRow;
	public Integer TableCol;

	public String DeviceId;
	public String DeviceName;
	
	public static ArrayList<AisleDeviceLocation> fromDataTable(DataTable dt) {
		ArrayList<AisleDeviceLocation> adls = new ArrayList<AisleDeviceLocation>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for(int i=0;i<rowCount;i++)
		{
			AisleDeviceLocation adl = new AisleDeviceLocation();
			adl.Id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
			adl.TableId = Integer.parseInt(drs.get(i).getValueAsString("TableId"));
			adl.TableName = drs.get(i).getValueAsString("TableName");
			adl.DeviceType = drs.get(i).getValueAsString("DeviceType");
			adl.TableRow = Integer.parseInt(drs.get(i).getValueAsString("TableRow"));
			adl.TableCol = Integer.parseInt(drs.get(i).getValueAsString("TableCol"));
			
			adls.add(adl);
		}
		return adls;
	}

	public static ArrayList<AisleDeviceLocation> fromDataTables(DataTable dt) {
		ArrayList<AisleDeviceLocation> adls = new ArrayList<AisleDeviceLocation>();

		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for(int i=0;i<rowCount;i++)
		{
			AisleDeviceLocation adl = new AisleDeviceLocation();
			adl.DeviceType = drs.get(i).getValueAsString("DeviceType");
			adl.TableRow = Integer.parseInt(drs.get(i).getValueAsString("TableRow"));
			adl.TableCol = Integer.parseInt(drs.get(i).getValueAsString("TableCol"));
			adl.DeviceId = drs.get(i).getValueAsString("EquipmentId");
			adl.DeviceName = drs.get(i).getValueAsString("EquipmentName");

			adls.add(adl);
		}
		return adls;
	}
}
