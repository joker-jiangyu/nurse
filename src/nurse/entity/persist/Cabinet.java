package nurse.entity.persist;

import java.util.ArrayList;
import java.util.List;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Cabinet {
	public int CabinetId;
	public String CabinetName;
	public int MDCId;
	public String CabinetType;
	public String Side;
	public Integer PhaseACurrentDeviceId;
	public Integer PhaseACurrentSignalId;
	public Integer PhaseAVoltageDeviceId;
	public Integer PhaseAVoltageSignalId;
	public Integer PhaseBCurrentDeviceId;
	public Integer PhaseBCurrentSignalId;
	public Integer PhaseBVoltageDeviceId;
	public Integer PhaseBVoltageSignalId;
	public Integer PhaseCCurrentDeviceId;
	public Integer PhaseCCurrentSignalId;
	public Integer PhaseCVoltageDeviceId;
	public Integer PhaseCVoltageSignalId;
	public Double RatedVoltage;
	public Double RatedCurrent;
	
	public static List<Cabinet> fromDataTable(DataTable dt) {
		List<Cabinet> temps = new ArrayList<Cabinet>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for (int i = 0; i < rowCount; i++) {
			DataRow dataRow = drs.get(i);
			Cabinet c = new Cabinet();
			c.CabinetId = (int) dataRow.getValue("Id");
			c.CabinetName = (String) dataRow.getValue("Name");
			c.MDCId = (int) dataRow.getValue("MDCId");
			c.CabinetType = (String) dataRow.getValue("CabinetType");
			c.Side = (String) dataRow.getValue("Side");
			c.PhaseACurrentDeviceId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseACurrentDeviceId"));
			c.PhaseACurrentSignalId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseACurrentSignalId"));
			c.PhaseAVoltageDeviceId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseAVoltageDeviceId"));
			c.PhaseAVoltageSignalId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseAVoltageSignalId"));
			c.PhaseBCurrentDeviceId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseBCurrentDeviceId"));
			c.PhaseBCurrentSignalId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseBCurrentSignalId"));
			c.PhaseBVoltageDeviceId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseBVoltageDeviceId"));
			c.PhaseBVoltageSignalId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseBVoltageSignalId"));
			c.PhaseCCurrentDeviceId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseCCurrentDeviceId"));
			c.PhaseCCurrentSignalId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseCCurrentSignalId"));
			c.PhaseCVoltageDeviceId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseCVoltageDeviceId"));
			c.PhaseCVoltageSignalId = CabinetDeviceMap.parseInt(dataRow.getValue("PhaseCVoltageSignalId"));
			c.RatedVoltage = CabinetDeviceMap.parseDouble(dataRow.getValue("RatedVoltage"));
			c.RatedCurrent = CabinetDeviceMap.parseDouble(dataRow.getValue("RatedCurrent"));

			temps.add(c);
		}
		return temps;
	}
	
	public boolean isNotNull(){
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
