package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class SamplerUnit {

	public SamplerUnit() {
	}

	public int SamplerUnitId;
	public int PortId;
	public int MonitorUnitId;
	public int SamplerId;
	public int ParentSamplerUnitId;
	public int SamplerType;
	public String SamplerUnitName;
	public int Address;
	public Float SpUnitInterval;
	public String DllPath;
	public int ConnectState;
	public Date UpdateTime;
	public String PhoneNumber;
	public String Description;

	public int getSamplerUnitId() {
		return SamplerUnitId;
	}

	public void setSamplerUnitId(int SamplerUnitId) {
		this.SamplerUnitId = SamplerUnitId;
	}	
	
	public static ArrayList<SamplerUnit> fromDataTable(DataTable dt) {
		ArrayList<SamplerUnit> ds = new ArrayList<SamplerUnit>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			SamplerUnit d = new SamplerUnit();
			
			d.SamplerUnitId = (int) drs.get(i).getValue("SamplerUnitId");
			d.PortId = (int) drs.get(i).getValue("PortId");
			d.MonitorUnitId = (int) drs.get(i).getValue("MonitorUnitId");
			d.SamplerId = (int) drs.get(i).getValue("SamplerId");
			d.ParentSamplerUnitId = (int) drs.get(i).getValue("ParentSamplerUnitId");
			d.SamplerType = (int) drs.get(i).getValue("SamplerType");
			d.SamplerUnitName = (String) drs.get(i).getValue("SamplerUnitName");
			d.Address = (int) drs.get(i).getValue("Address");
			d.SpUnitInterval = (Float) drs.get(i).getValue("SpUnitInterval");
			d.DllPath = (String) drs.get(i).getValue("DllPath");
			d.ConnectState = (int) drs.get(i).getValue("ConnectState");
			d.UpdateTime = (Date) drs.get(i).getValue("UpdateTime");
			d.PhoneNumber = (String) drs.get(i).getValue("PhoneNumber");
			d.Description = (String) drs.get(i).getValue("Description");
			
			ds.add(d);
		}		
		return ds;
	}
}
