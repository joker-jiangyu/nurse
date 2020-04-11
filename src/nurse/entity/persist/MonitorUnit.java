package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class MonitorUnit {

	public MonitorUnit() {
	}

	public int MonitorUnitId;
	public String MonitorUnitName;
	public int MonitorUnitCategory;
	public String MonitorUnitCode;
	public Integer WorkStationId;
	public Integer StationId;
	public String IpAddress;
	public Integer RunMode;
	public String ConfigFileCode;
	public Date ConfigUpdateTime;
	public String SampleConfigCode;
	public String SoftwareVersion;
	public String Description;
	public Date StartTime;
	public Date HeartbeatTime;
	public Integer ConnectState;
	public Date UpdateTime;
	public boolean IsSync;
	public Date SyncTime;
	public boolean IsConfigOK;
	public String ConfigFileCode_Old;
	public String SampleConfigCode_Old;
	public Integer AppCongfigId;
	public boolean CanDistribute;
	public boolean Enable;
	public String ProjectName;
	public String ContractNo;
	public Date InstallTime;
	
	public int getMonitorUnitId() {
		return MonitorUnitId;
	}

	public void setMonitorUnitId(int MonitorUnitId) {
		this.MonitorUnitId = MonitorUnitId;
	}	
	
	public static ArrayList<MonitorUnit> fromDataTable(DataTable dt) {
		ArrayList<MonitorUnit> ds = new ArrayList<MonitorUnit>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			MonitorUnit d = new MonitorUnit();
			
			d.MonitorUnitId = (int) drs.get(i).getValue("MonitorUnitId");
			d.MonitorUnitName = (String) drs.get(i).getValue("MonitorUnitName");
			d.MonitorUnitCategory = (int) drs.get(i).getValue("MonitorUnitCategory");
			d.MonitorUnitCode = (String) drs.get(i).getValue("MonitorUnitCode");
			d.WorkStationId = (Integer) drs.get(i).getValue("WorkStationId");
			d.StationId = (int) drs.get(i).getValue("StationId");
			d.IpAddress = (String) drs.get(i).getValue("IpAddress");
			d.RunMode = (Integer) drs.get(i).getValue("RunMode");
			d.ConfigFileCode = (String) drs.get(i).getValue("ConfigFileCode");
			d.ConfigUpdateTime = (Date) drs.get(i).getValue("ConfigUpdateTime");
			d.SampleConfigCode = (String) drs.get(i).getValue("SampleConfigCode");
			d.SoftwareVersion = (String) drs.get(i).getValue("SoftwareVersion");
			d.Description = (String) drs.get(i).getValue("Description");
			d.StartTime = (Date) drs.get(i).getValue("StartTime");
			d.HeartbeatTime = (Date) drs.get(i).getValue("HeartbeatTime");
			d.ConnectState = (Integer) drs.get(i).getValue("ConnectState");
			d.UpdateTime = (Date) drs.get(i).getValue("UpdateTime");
			d.IsSync = (boolean) drs.get(i).getValue("IsSync");
			d.SyncTime = (Date) drs.get(i).getValue("SyncTime");
			d.IsConfigOK = (boolean) drs.get(i).getValue("IsConfigOK");
			d.ConfigFileCode_Old = (String) drs.get(i).getValue("ConfigFileCode_Old");
			d.SampleConfigCode_Old = (String) drs.get(i).getValue("SampleConfigCode_Old");
			d.AppCongfigId = (Integer) drs.get(i).getValue("AppCongfigId");
			d.CanDistribute = (boolean) drs.get(i).getValue("CanDistribute");
			d.Enable = (boolean) drs.get(i).getValue("Enable");
			d.ProjectName = (String) drs.get(i).getValue("ProjectName");
			d.ContractNo = (String) drs.get(i).getValue("ContractNo");
			d.InstallTime = (Date) drs.get(i).getValue("InstallTime");

			ds.add(d);
		}		
		return ds;
	}
}
