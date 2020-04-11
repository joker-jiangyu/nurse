package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;
import java.math.*;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Station {

	public Station() {
	}

	public int StationId;
	public String StationName;
	public BigDecimal Latitude;
	public BigDecimal Longitude;
	public Date SetupTime;
	public Integer CompanyId;
	public Integer ConnectState;
	public Date UpdateTime;
	public int StationCategory;
	public int StationGrade;
	public int StationState;
	public Integer ContactId;
	public Integer SupportTime;
	public Float OnWayTime;
	public Float SurplusTime;
	public String FloorNo;
	public String PropList;
	public Float Acreage;
	public Integer BuildingType;
	public boolean ContainNode;
	public String Description;
	public Integer BordNumber;
	public int CenterId;
	public boolean Enable;
	public Date StartTime;
	public Date EndTime;
	public String ProjectName;
	public String ContractNo;
	public Date InstallTime;
	public String EmployeeName;
	public String Mobile;
	
	public int getStationId() {
		return StationId;
	}

	public void setStationId(int StationId) {
		this.StationId = StationId;
	}	
	
	public static ArrayList<Station> fromDataTable(DataTable dt) {
		ArrayList<Station> ds = new ArrayList<Station>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Station d = new Station();
			
			d.StationId = (int) drs.get(i).getValue("StationId");
			d.StationName = (String) drs.get(i).getValue("StationName");
			d.Latitude = (BigDecimal) drs.get(i).getValue("Latitude");
			d.Longitude = (BigDecimal) drs.get(i).getValue("Longitude");
			d.SetupTime = (Date) drs.get(i).getValue("SetupTime");
			d.CompanyId = (Integer) drs.get(i).getValue("CompanyId");
			d.ConnectState = (Integer) drs.get(i).getValue("ConnectState");
			d.UpdateTime = (Date) drs.get(i).getValue("UpdateTime");
			d.StationCategory = (int) drs.get(i).getValue("StationCategory");
			d.StationGrade = (int) drs.get(i).getValue("StationGrade");
			d.StationState = (int) drs.get(i).getValue("StationState");
			d.ContactId = (Integer) drs.get(i).getValue("ContactId");
			d.SupportTime = (Integer) drs.get(i).getValue("SupportTime");
			d.OnWayTime = (Float) drs.get(i).getValue("OnWayTime");
			d.SurplusTime = (Float) drs.get(i).getValue("SurplusTime");
			d.FloorNo = (String) drs.get(i).getValue("FloorNo");
			d.PropList = (String) drs.get(i).getValue("PropList");
			d.Acreage = (Float) drs.get(i).getValue("Acreage");
			d.BuildingType = (Integer) drs.get(i).getValue("BuildingType");
			d.ContainNode = (boolean) drs.get(i).getValue("ContainNode");
			d.Description = (String) drs.get(i).getValue("Description");
			d.BordNumber = (Integer) drs.get(i).getValue("BordNumber");
			d.CenterId = (int) drs.get(i).getValue("CenterId");
			d.Enable = (boolean) drs.get(i).getValue("Enable");
			d.StartTime = (Date) drs.get(i).getValue("StartTime");
			d.EndTime = (Date) drs.get(i).getValue("EndTime");
			d.ProjectName = (String) drs.get(i).getValue("ProjectName");
			d.ContractNo = (String) drs.get(i).getValue("ContractNo");
			d.InstallTime = (Date) drs.get(i).getValue("InstallTime");
			d.EmployeeName = (String) drs.get(i).getValue("EmployeeName");
			d.Mobile = (String) drs.get(i).getValue("Mobile");

			ds.add(d);
		}		
		return ds;
	}
}
