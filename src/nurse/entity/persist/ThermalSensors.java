package nurse.entity.persist;

import java.util.ArrayList;
import java.util.List;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.JsonHelper;

public class ThermalSensors {
	public String mdcId;
	public int id;
	public String name;
	public String side;
	public String temps;
	
	public static List<ThermalSensors> fromThermalSensors(DataTable dt){
		ArrayList<ThermalSensors> tss = new ArrayList<ThermalSensors>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i = 0;i<rowCount;i++){
			DataRow dr = drs.get(i);
			ThermalSensors ts = new ThermalSensors();
			
			ts.mdcId = dr.getValueAsString("MDCId");
			ts.id = CabinetDeviceMap.parseInt(dr.getValueAsString("CabinetId"));
			ts.name = dr.getValueAsString("Name");
			ts.side = dr.getValueAsString("Side");
			
			MdcTemperature mt = new MdcTemperature();
			mt.slideName = dr.getValueAsString("SlideName");
			mt.deviceId = CabinetDeviceMap.parseInt(dr.getValueAsString("DeviceId"));
			mt.signalId = CabinetDeviceMap.parseInt(dr.getValueAsString("SignalId"));
			mt.x = CabinetDeviceMap.parseDouble(dr.getValueAsString("x"));
			mt.y = CabinetDeviceMap.parseDouble(dr.getValueAsString("y"));
			
			ts.temps = JsonHelper.jsonObject(mt).toString();
			tss.add(ts);
		}
		return tss;
	}
}
