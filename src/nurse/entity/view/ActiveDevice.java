package nurse.entity.view;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.ActiveAlarm;
import nurse.logic.providers.ActiveAlarmProvider;

public class ActiveDevice {

	public ActiveDevice() {
	}

	public int id;
	public long baseTypeId;

	public int equipmentCategory;
	public int equipmentTemplateId;
	public String status;
	
	public String name;
	public String type;
	public String typeAlias;
	public String remark;	
	public String equipmentStyle;
	public String usedDate;
	public String vendor;
	
	public long getBaseTypeId() {
		return baseTypeId;
	}
	public void setBaseTypeId(long baseTypeId) {
		this.baseTypeId = baseTypeId;
	}
	public int getEquipmentCategory() {
		return equipmentCategory;
	}
	public void setEquipmentCategory(int equipmentCategory) {
		this.equipmentCategory = equipmentCategory;
	}
	public int getEquipmentTemplateId() {
		return equipmentTemplateId;
	}
	public void setEquipmentTemplateId(int equipmentTemplateId) {
		this.equipmentTemplateId = equipmentTemplateId;
	}
	public String getRemark() {
		return remark;
	}	
	public void setRemark(String remark) {
		this.remark = remark;
	}
	
	public static ArrayList<ActiveDevice> fromDataTable(DataTable dt) {
		ArrayList<ActiveDevice> ads = new ArrayList<ActiveDevice>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			ActiveDevice d = new ActiveDevice();
			d.id = (int) drs.get(i).getValue("EquipmentId");
			d.baseTypeId = (long) drs.get(i).getValue("baseType");
			d.type = (String) drs.get(i).getValue("ItemValue");
			d.typeAlias = (String) drs.get(i).getValue("ItemAlias");
			d.name = (String) drs.get(i).getValue("EquipmentName");			
			d.equipmentCategory = (int) drs.get(i).getValue("EquipmentCategory");
			d.equipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			d.equipmentStyle = (String) drs.get(i).getValue("EquipmentStyle");
			if(drs.get(i).getValue("UsedDate") != null){
				SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				d.usedDate = formatter.format((Date)drs.get(i).getValue("UsedDate"));
			}
			d.vendor = (String) drs.get(i).getValue("Vendor");
			ads.add(d);
		}		
		return ads;
	}	
	
	private static void buildRemark(ActiveDevice d, long alarmcount, 
			int connectStatus, Date updateTime) {
		if (alarmcount > 0) d.status = "Alarm";
		if (connectStatus == 0 || connectStatus == 2) d.status = "Disconnect";		
		if (d.status == null) d.status = "Normal";
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		
		if (d.status.equals("Alarm"))
			d.remark = String.format("有 %d 个告警正在发生...", alarmcount);

		if(updateTime==null)
			return;
		String t = formatter.format(updateTime);
		if (d.status.equals("Disconnect"))
			d.remark = String.format("于 %s 中断至今...", t);
	}
	
	public void updateAlarms(Integer connectState) {
		//reset status
		status = "Normal";
		remark = "";
		
		// update alarm State when called
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		
		long alarmCount = 0;
		Date oldestTime = new Date(0L);
		for(ActiveAlarm a : alarms)
		{
			if (oldestTime.before(a.startTime) && a.deviceId == this.id) oldestTime = a.startTime;
			if (a.deviceId == this.id) alarmCount++;
		}
				
		//always good for devices state
		//disable disconnect status
		int connectStatus = connectState == null ? 2 : connectState;		

		Date updateTime = (oldestTime.compareTo(new Date(0L)) == 0 ) ? null : oldestTime;
	
		buildRemark(this, alarmCount,connectStatus, updateTime);		
	}

}
