package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class MdcTemperature {
	public int mdcId;
	public int cabinetId;
	public String slideName;
	public int deviceId;
	public int signalId;
	public String side;
	public double x;
	public double y;
	public double val;
	
	public static ArrayList<MdcTemperature> getTemperatures(DataTable dt){
		ArrayList<MdcTemperature> temps = new ArrayList<MdcTemperature>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			
			String mdcID = dataRow.getValueAsString("MDCId");
			if (mdcID == null || mdcID.equals(""))
				continue;
			String deviceId = dataRow.getValueAsString("DeviceId");
			if (deviceId == null || deviceId.equals(""))
				continue;
			String signalId = dataRow.getValueAsString("SignalId");
			if (signalId == null || signalId.equals(""))
				continue;
			String cabinetId = dataRow.getValueAsString("CabinetId");
			if (cabinetId == null || cabinetId.equals(""))
				continue;
			
			MdcTemperature temp = new MdcTemperature();
			temp.mdcId = CabinetDeviceMap.parseInt(mdcID);
			temp.cabinetId = CabinetDeviceMap.parseInt(cabinetId);
			temp.slideName = dataRow.getValueAsString("SlideName");
			temp.deviceId = CabinetDeviceMap.parseInt(deviceId);
			temp.signalId = CabinetDeviceMap.parseInt(signalId);
			temp.side = dataRow.getValueAsString("Side");
			temp.x = CabinetDeviceMap.parseDouble(dataRow.getValueAsString("x"));
			temp.y = CabinetDeviceMap.parseDouble(dataRow.getValueAsString("y"));
			temps.add(temp);
		}
		return temps;
	}
}
