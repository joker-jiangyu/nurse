package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class SignalInstance {

	public int deviceId;
	public String deviceName;
	public int equipmentTemplateId;
	public int signalId;
    public String signalName;
    public String showPrecision;
    public String unit;
    public long baseTypeId;

     
	public SignalInstance() {
	}


	public static ArrayList<SignalInstance> fromDataTable(DataTable dt) {
		ArrayList<SignalInstance> res = new ArrayList<SignalInstance>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			SignalInstance si = new SignalInstance();
			si.deviceId = (int) drs.get(i).getValue("EquipmentId");
			si.deviceName = drs.get(i).getValueAsString("EquipmentName");			
			si.equipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			si.signalId = (int) drs.get(i).getValue("SignalId");
			si.signalName = drs.get(i).getValueAsString("SignalName");			
			si.showPrecision = (String) drs.get(i).getValue("ShowPrecision");
			si.unit = drs.get(i).getValueAsString("Unit");
			
			String baseTypeIdStr = drs.get(i).getValueAsString("BaseTypeId");
			si.baseTypeId = baseTypeIdStr == null ? 0 : Long.parseLong(baseTypeIdStr);
			res.add(si);
		}
		
		return res;
	}
}
