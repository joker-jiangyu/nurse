package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Device {

	public Device() {
	}
	
	public int siteId;
	public int deviceId;
	public long baseTypeId;
	
	public String siteName;
	public String deviceName;
	public String baseTypeName;
	public String vendor;
	public String remark;	
	
	public int getSiteId() {
		return siteId;
	}
	public void setSiteId(int siteId) {
		this.siteId = siteId;
	}
	public int getDeviceId() {
		return deviceId;
	}
	public void setDeviceId(int deviceId) {
		this.deviceId = deviceId;
	}
	public long getBaseTypeId() {
		return baseTypeId;
	}
	public void setBaseTypeId(int baseTypeId) {
		this.baseTypeId = baseTypeId;
	}
	public String getSiteName() {
		return this.siteName;
	}
	public void setSiteName(String siteName) {
		this.siteName = siteName;
	}
	public String getDeviceName() {
		return deviceName;
	}
	public void setDeviceName(String deviceName) {
		this.deviceName = deviceName;
	}
	public String getBaseTypeName() {
		return baseTypeName;
	}
	public void setBaseTypeName(String baseTypeName) {
		this.baseTypeName = baseTypeName;
	}
	public String getVendor() {
		return vendor;
	}
	public void setVendor(String vendor) {
		this.vendor = vendor;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}
	public static ArrayList<Device> fromDataTable(DataTable dt) {
		ArrayList<Device> ds = new ArrayList<Device>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Device d = new Device();
			d.siteId = (int) drs.get(i).getValue("StationId");
			d.deviceId = (int) drs.get(i).getValue("EquipmentId");
			d.baseTypeId = (long) drs.get(i).getValue("baseType");
			d.deviceName = (String) drs.get(i).getValue("EquipmentName");
			d.vendor = (String) drs.get(i).getValue("Vendor");
			d.remark = (String) drs.get(i).getValue("Description");
			ds.add(d);
		}		
		return ds;
	}

}
