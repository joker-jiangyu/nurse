package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class DeviceBaseType {

	public DeviceBaseType() {
	}

	public long baseTypeId;
	
	public String baseTypeName;
	
	public String remark;
	
	public static ArrayList<DeviceBaseType> fromDataTable(DataTable dt) {
		ArrayList<DeviceBaseType> res = new ArrayList<DeviceBaseType>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DeviceBaseType si = new DeviceBaseType();
			si.baseTypeName = drs.get(i).getValueAsString("BaseEquipmentName");			
			si.remark = drs.get(i).getValueAsString("Description");			
			
			String baseTypeIdStr = drs.get(i).getValueAsString("BaseEquipmentId");
			si.baseTypeId = baseTypeIdStr == null ? 0 : Long.parseLong(baseTypeIdStr);
			res.add(si);
		}
		
		return res;
	}
}
