package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class SignalBaseType {

	public SignalBaseType() {
	}

	public int deviceBaseTypeId;

	public String deviceBaseName;
	
	public long baseTypeId;
	
	public String baseTypeName;
	
	public String remark;

	public static ArrayList<SignalBaseType> fromDataTable(DataTable dt) {
		ArrayList<SignalBaseType> res = new ArrayList<SignalBaseType>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			SignalBaseType si = new SignalBaseType();
			si.baseTypeName = drs.get(i).getValueAsString("SignalName");			
			si.remark = drs.get(i).getValueAsString("Description");			
			
			String baseTypeIdStr = drs.get(i).getValueAsString("BaseTypeId");
			si.baseTypeId = baseTypeIdStr == null ? 0 : Long.parseLong(baseTypeIdStr);
			
			si.deviceBaseTypeId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
			res.add(si);
		}
		
		return res;
	}
}
