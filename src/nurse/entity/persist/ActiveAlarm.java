package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class ActiveAlarm {

	

	public int siteId;
	public int deviceId;
	public int signalId;
	public int eventId;
	public int conditionId;	
	public int alarmLevel;
	public int eventCategoryId;
	public long baseTypeId;	
	public String baseTypeName;	
	public String deviceVendor;
	public String siteName;
	public String deviceName;
	public String signalName;
	public String eventName;
	public String meanings;	
	public String remark;
	public String alarmLevelName;	
	public float triggerValue;
	public Date startTime;
	public Date endTime;	
	public String uniqueId;
	public Date LastUpdateDateTime;
	public Date confirmTime;
	public String cancelUserName;


	
	public ActiveAlarm() {
	}
	

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
	public int getSignalId() {
		return signalId;
	}
	public void setSignalId(int signalId) {
		this.signalId = signalId;
	}
	public int getEventId() {
		return eventId;
	}
	public void setEventId(int eventId) {
		this.eventId = eventId;
	}
	public int getConditionId() {
		return conditionId;
	}
	public void setConditionId(int conditionId) {
		this.conditionId = conditionId;
	}
	public int getAlarmLevel() {
		return alarmLevel;
	}
	public void setAlarmLevel(int alarmLevel) {
		this.alarmLevel = alarmLevel;
	}
	public int getEventCategoryId() {
		return eventCategoryId;
	}
	public void setEventCategoryId(int eventCategoryId) {
		this.eventCategoryId = eventCategoryId;
	}
	public long getBaseTypeId() {
		return baseTypeId;
	}
	public void setBaseTypeId(long baseTypeId) {
		this.baseTypeId = baseTypeId;
	}
	public String getBaseTypeName() {
		return baseTypeName;
	}
	public void setBaseTypeName(String baseTypeName) {
		this.baseTypeName = baseTypeName;
	}
	public String getDeviceVendor() {
		return deviceVendor;
	}
	public void setDeviceVendor(String deviceVendor) {
		this.deviceVendor = deviceVendor;
	}
	public String getSiteName() {
		return siteName;
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
	public String getSignalName() {
		return signalName;
	}
	public void setSignalName(String signalName) {
		this.signalName = signalName;
	}
	public String getEventName() {
		return eventName;
	}
	public void setEventName(String eventName) {
		this.eventName = eventName;
	}
	public String getMeanings() {
		return meanings;
	}
	public void setMeanings(String meanings) {
		this.meanings = meanings;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}
	public String getAlarmLevelName() {
		return alarmLevelName;
	}
	public void setAlarmLevelName(String alarmLevelName) {
		this.alarmLevelName = alarmLevelName;
	}
	public float getTriggerValue() {
		return triggerValue;
	}
	public void setTriggerValue(float triggerValue) {
		this.triggerValue = triggerValue;
	}
	public Date getStartTime() {
		return startTime;
	}
	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}
	public Date getEndTime() {
		return endTime;
	}
	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}
	public String getUniqueId() {
		return uniqueId;
	}
	public void setUniqueId(String uniqueId) {
		this.uniqueId = uniqueId;
	}
	public Date getConfirmTime() {
		return confirmTime;
	}
	public void setConfirmTime(Date confirmTime) {
		this.confirmTime = confirmTime;
	}
	public String getCancelUserName() {
		return cancelUserName;
	}
	public void setCancelUserName(String cancelUserName) {
		this.cancelUserName = cancelUserName;
	}

	public static ArrayList<ActiveAlarm> GetListFromDataTable(DataTable dt)
	{
		ArrayList<ActiveAlarm> alarms = new ArrayList<ActiveAlarm>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			ActiveAlarm aa = new ActiveAlarm();
			aa.alarmLevel = (int) drs.get(i).getValue("EventSeverityId");
			aa.alarmLevelName = (String) drs.get(i).getValue("EventSeverity");
			String btid = drs.get(i).getValueAsString("BaseTypeId");
			aa.baseTypeId = (btid == null || btid.equals(""))?0:Long.parseLong(btid);
			aa.baseTypeName = drs.get(i).getValueAsString("BaseTypeName");
			aa.conditionId = (int) drs.get(i).getValue("EventConditionId");
			aa.deviceId = (int) drs.get(i).getValue("EquipmentId");
			aa.deviceName = drs.get(i).getValueAsString("EquipmentName");
			//aa.deviceVendor = drs.get(i).getValueAsString("DeviceName");
			aa.endTime = (Date) drs.get(i).getValue("EndTime");
			//aa.eventCategoryId = (int) drs.get(i).getValue("EndTime");
			aa.eventId = (int) drs.get(i).getValue("EventId");
			aa.eventName = drs.get(i).getValueAsString("EventName");
			aa.meanings = drs.get(i).getValueAsString("Meanings");
			aa.remark = drs.get(i).getValueAsString("Description");
			aa.signalId = (int) drs.get(i).getValue("SignalId");
			//aa.signalName = drs.get(i).getValueAsString("Description");
			aa.siteId = (int) drs.get(i).getValue("StationId");
			aa.siteName = (String) drs.get(i).getValue("StationName");
			aa.startTime = (Date) drs.get(i).getValue("StartTime");
			aa.triggerValue = Float.parseFloat(drs.get(i).getValueAsString("EventValue"));
			
//			if (Integer.parseInt(drs.get(i).getValueAsString("EventValue")) == 1652580){
//				System.out.println(aa.uniqueId);
//			}
			aa.uniqueId = drs.get(i).getValueAsString("SequenceId");
			aa.confirmTime = (Date) drs.get(i).getValue("ConfirmTime");

			aa.cancelUserName = drs.get(i).getValueAsString("CancelUserName");

			alarms.add(aa);
		}
		
		return alarms;
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		return (ActiveAlarm) super.clone();
	}
}
