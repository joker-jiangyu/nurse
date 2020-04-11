package nurse.entity.persist;

import java.util.ArrayList;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Port {

	public Port() {
	}

	public int PortId;
	public int MonitorUnitId;
	public int PortNo;
	public String PortName;
	public int PortType;
	public String Setting;
	public String PhoneNumber;
	public Integer LinkSamplerUnitId;
	public String Description;
	
	public int getPortId() {
		return PortId;
	}

	public void setPortId(int PortId) {
		this.PortId = PortId;
	}	
	
	public static ArrayList<Port> fromDataTable(DataTable dt) {
		ArrayList<Port> ds = new ArrayList<Port>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Port d = new Port();
			
			d.PortId = (int) drs.get(i).getValue("PortId");
			d.MonitorUnitId = (int) drs.get(i).getValue("MonitorUnitId");
			d.PortNo = (int) drs.get(i).getValue("PortNo");
			d.PortName = (String) drs.get(i).getValue("PortName");
			d.PortType = (int) drs.get(i).getValue("PortType");
			d.Setting = (String) drs.get(i).getValue("Setting");
			d.PhoneNumber = (String) drs.get(i).getValue("PhoneNumber");
			d.LinkSamplerUnitId = (Integer) drs.get(i).getValue("LinkSamplerUnitId");
			d.Description = (String) drs.get(i).getValue("Description");
			
			ds.add(d);
		}		
		return ds;
	}
}
