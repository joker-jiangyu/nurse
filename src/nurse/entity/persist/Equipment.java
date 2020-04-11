package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Equipment {

	public Equipment() {
	}

	public int StationId;
	public int EquipmentId;
	public String EquipmentName;
	public String EquipmentNo;
	public String EquipmentModule;
	public String EquipmentStyle;
	public Integer AssetState;
	public Float Price;
	public Float UsedLimit;
	public Date UsedDate;
	public Date BuyDate;
	public String Vendor;
	public String Unit;
	public int EquipmentCategory;
	public int EquipmentType;
	public Integer EquipmentClass;
	public int EquipmentState;
	public String EventExpression;
	public Float StartDelay;
	public Float EndDelay;
	public String Property;
	public String Description;
	public Integer EquipmentTemplateId;
	public Integer HouseId;
	public int MonitorUnitId;
	public Integer WorkStationId;
	public int SamplerUnitId;
	public int DisplayIndex;
	public int ConnectState;
	public Date UpdateTime;
	public String ParentEquipmentId;
	public String RatedCapacity;
	public String InstalledModule;
	public String ProjectName;
	public String ContractNo;
	public Date InstallTime;
	public String EquipmentSN;
	public String SO;
	
	public Integer Address;
	public String DllPath;
	public Integer PortNo;
	public Integer PortType;
	public String Setting;
	
	public int getEquipmentId() {
		return EquipmentId;
	}

	public void setEquipmentId(int EquipmentId) {
		this.EquipmentId = EquipmentId;
	}	
	
	public static ArrayList<Equipment> fromDataTable(DataTable dt) {
		ArrayList<Equipment> ds = new ArrayList<Equipment>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Equipment d = new Equipment();
			
			d.StationId = (int) drs.get(i).getValue("StationId");
			d.EquipmentId = (int) drs.get(i).getValue("EquipmentId");
			d.EquipmentName = (String) drs.get(i).getValue("EquipmentName");
			d.EquipmentNo = (String) drs.get(i).getValue("EquipmentNo");
			d.EquipmentModule = (String) drs.get(i).getValue("EquipmentModule");
			d.EquipmentStyle = (String) drs.get(i).getValue("EquipmentStyle");
			d.AssetState = (Integer) drs.get(i).getValue("AssetState");
			d.Price = (Float) drs.get(i).getValue("Price");
			d.UsedLimit = (Float) drs.get(i).getValue("UsedLimit");
			d.UsedDate = (Date) drs.get(i).getValue("UsedDate");
			d.BuyDate = (Date) drs.get(i).getValue("BuyDate");
			d.Vendor = (String) drs.get(i).getValue("Vendor");
			d.Unit = (String) drs.get(i).getValue("Unit");
			d.EquipmentCategory = (int) drs.get(i).getValue("EquipmentCategory");
			d.EquipmentType = (int) drs.get(i).getValue("EquipmentType");
			d.EquipmentClass = (Integer) drs.get(i).getValue("EquipmentClass");
			d.EquipmentState = (int) drs.get(i).getValue("EquipmentState");
			d.EventExpression = (String) drs.get(i).getValue("EventExpression");
			d.StartDelay = (Float) drs.get(i).getValue("StartDelay");
			d.EndDelay = (Float) drs.get(i).getValue("EndDelay");
			d.Property = (String) drs.get(i).getValue("Property");
			d.Description = (String) drs.get(i).getValue("Description");
			d.EquipmentTemplateId = (Integer) drs.get(i).getValue("EquipmentTemplateId");
			d.HouseId = (Integer) drs.get(i).getValue("HouseId");
			d.MonitorUnitId = (int) drs.get(i).getValue("MonitorUnitId");
			d.WorkStationId = (Integer) drs.get(i).getValue("WorkStationId");
			d.SamplerUnitId = (int) drs.get(i).getValue("SamplerUnitId");
			d.DisplayIndex = (int) drs.get(i).getValue("DisplayIndex");
			d.ConnectState = (int) drs.get(i).getValue("ConnectState");
			d.UpdateTime = (Date) drs.get(i).getValue("UpdateTime");
			d.ParentEquipmentId = (String) drs.get(i).getValue("ParentEquipmentId");
			d.RatedCapacity = (String) drs.get(i).getValue("RatedCapacity");
			d.InstalledModule = (String) drs.get(i).getValue("InstalledModule");
			d.ProjectName = (String) drs.get(i).getValue("ProjectName");
			d.ContractNo = (String) drs.get(i).getValue("ContractNo");
			d.InstallTime = (Date) drs.get(i).getValue("InstallTime");
			d.EquipmentSN = (String) drs.get(i).getValue("EquipmentSN");
			d.SO = (String) drs.get(i).getValue("SO");

			d.Address = (Integer) drs.get(i).getValue("Address");
			d.DllPath = (String) drs.get(i).getValue("DllPath");
			d.PortNo = (Integer) drs.get(i).getValue("PortNo");
			d.PortType = (Integer) drs.get(i).getValue("PortType");
			d.Setting = (String) drs.get(i).getValue("Setting");

			ds.add(d);
		}		
		return ds;
	}
}
