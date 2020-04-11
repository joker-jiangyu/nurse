package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class AlarmChange extends ActiveAlarm implements Cloneable{

    public long serialNo;

    public int operationType;

    public Date insertTime;
    
	public AlarmChange() {
	}

	public static ArrayList<AlarmChange> getAlarmChangeListFromDataTable(DataTable dt) {
		ArrayList<AlarmChange> alarms = new ArrayList<AlarmChange>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			AlarmChange ac = new AlarmChange();
			ac.alarmLevel = (int) drs.get(i).getValue("EventSeverityId");
			ac.alarmLevelName = (String) drs.get(i).getValue("EventSeverity");
			String btid = drs.get(i).getValueAsString("BaseTypeId");
			ac.baseTypeId = (btid == null || btid.equals(""))?0:Long.parseLong(btid);
			ac.baseTypeName = drs.get(i).getValueAsString("BaseTypeName");
			ac.conditionId = (int) drs.get(i).getValue("EventConditionId");
			ac.deviceId = (int) drs.get(i).getValue("EquipmentId");
			ac.deviceName = drs.get(i).getValueAsString("EquipmentName");
			//ac.deviceVendor = drs.get(i).getValueAsString("DeviceName");
			ac.endTime = (Date) drs.get(i).getValue("EndTime");
			//ac.eventCategoryId = (int) drs.get(i).getValue("EndTime");
			ac.eventId = (int) drs.get(i).getValue("EventId");
			ac.eventName = drs.get(i).getValueAsString("EventName");
			ac.meanings = drs.get(i).getValueAsString("Meanings");
			ac.remark = drs.get(i).getValueAsString("Description");
			ac.signalId = (int) drs.get(i).getValue("SignalId");
			//ac.signalName = drs.get(i).getValueAsString("Description");
			ac.siteId = (int) drs.get(i).getValue("StationId");
			ac.siteName = (String) drs.get(i).getValue("StationName");
			ac.startTime = (Date) drs.get(i).getValue("StartTime");
			ac.triggerValue = Float.parseFloat(drs.get(i).getValueAsString("EventValue"));
			ac.uniqueId = drs.get(i).getValueAsString("SequenceId");
			ac.confirmTime = (Date) drs.get(i).getValue("ConfirmTime");
			ac.serialNo = Long.parseLong(drs.get(i).getValueAsString("SerialNo"));
			ac.operationType = (int) drs.get(i).getValue("OperationType");
			ac.insertTime = (Date) drs.get(i).getValue("InsertTime");
			alarms.add(ac);
		}
		
		return alarms;
	}

}
