package nurse.entity.persist;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.text.SimpleDateFormat;
import java.util.Date;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.logic.providers.ConfigCache;
import nurse.logic.providers.DoorProvider;

public class ActiveSignal implements Comparable<ActiveSignal> {

	public ActiveSignal() {
	}

	public int siteId;
	public int deviceId;
	public int signalId;
	public int SignalCategory;
	public int baseTypeId;
	/**
	 * 0:提示信息、1:一般告警、2:重要告警、3:紧急告警、255:正常、其他:通讯中断
	 */
	private int alarmSeverity;
	public int displayIndex;
	public int equipmentTemplateId;
	
	public int getEquipmentTemplateId() {
		return equipmentTemplateId;
	}

	public void setEquipmentTemplateId(int equipmentTemplateId) {
		this.equipmentTemplateId = equipmentTemplateId;
	}

	public int getDisplayIndex() {
		return displayIndex;
	}

	public void setDisplayIndex(int displayIndex) {
		this.displayIndex = displayIndex;
	}

	public String baseTypeName;
	public String siteName;
	public String deviceName;
	public String signalName;
	public String showPrecision;
	public String meanings;
	public String unit;	
	public float floatValue;
	public String stringValue;
	public int valueType;
	public Date updateTime;
	public String description;
	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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

	public int getSignalCategory() {
		return SignalCategory;
	}

	public void setSignalCategory(int signalCategory) {
		SignalCategory = signalCategory;
	}

	public int getBaseTypeId() {
		return baseTypeId;
	}

	public void setBaseTypeId(int baseTypeId) {
		this.baseTypeId = baseTypeId;
	}

	/**
	 * 0:提示信息、1:一般告警、2:重要告警、3:紧急告警、255:通讯正常、-255:通讯中断
	 */
	public int getAlarmSeverity(int deviceId) {
		ActiveSignal as = ConfigCache.getInstance().getActiveSignal(deviceId, -3);
		if(as == null || as.floatValue == 0)
			return -255;
		return alarmSeverity;
	}

	public void setAlarmSeverity(int alarmSeverity) {
		this.alarmSeverity = alarmSeverity;
	}

	public String getBaseTypeName() {
		return baseTypeName;
	}

	public void setBaseTypeName(String baseTypeName) {
		this.baseTypeName = baseTypeName;
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

	public String getShowPrecision() {
		return showPrecision;
	}

	public void setShowPrecision(String showPrecision) {
		this.showPrecision = showPrecision;
	}

	public String getMeanings() {
		return meanings;
	}

	public void setMeanings(String meanings) {
		this.meanings = meanings;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public float getFloatValue() {
		if(this.showPrecision == null)
			return  this.floatValue;

		String format = new DecimalFormat(this.showPrecision).format(this.floatValue);
		return Float.parseFloat(format);
	}

	public void setFloatValue(float floatValue) {
		this.floatValue = floatValue;
	}

	public Date getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}


	
	public String getCurrentValue(){

		if (SignalCategory == 2 ) {
            return meanings;
        }else
        {
        	if(this.valueType == 0){//浮点信号
				this.floatValue = DoorProvider.getInstance().FinalSwapCardDate(this.deviceId,this.baseTypeId,this.floatValue);
	            if (showPrecision != null)
	            	return new DecimalFormat(showPrecision).format(floatValue) + " " + this.unit;
	            else
	            	return new DecimalFormat("0.00").format(floatValue) + " " + this.unit;
        	}else{//字符串信号与密码信号
        		if(this.baseTypeId == 1001132001 || this.baseTypeId == 1001305001){//卡号：卡号(使用者)
					this.stringValue = DoorProvider.getInstance().FinalSwapCardCode(this.deviceId,this.stringValue);
        			String userName = DoorProvider.getInstance().GetUserNameByCardCode(this.stringValue);
        			if(userName == null || userName.equals(""))
        				return this.stringValue;
        			else
        				return String.format("%s(%s)", this.stringValue,userName);
        		}else
        			return this.stringValue;
        	}
        }
	}
	
	
	public static ArrayList<ActiveSignal> fromDataTable(DataTable dt) {
		ArrayList<ActiveSignal> res = new ArrayList<ActiveSignal>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		for(int i=0;i<rowCount;i++)
		{
			ActiveSignal si = new ActiveSignal();
			si.siteId= (int) drs.get(i).getValue("StationId");
			si.siteName=drs.get(i).getValueAsString("StationName");	
			si.deviceId = (int) drs.get(i).getValue("EquipmentId");
			si.equipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			si.deviceName = drs.get(i).getValueAsString("EquipmentName");	
			
			si.baseTypeName= drs.get(i).getValueAsString("BaseTypeName");
			if(drs.get(i).getValue("SignalId")==null || drs.get(i).getValue("SignalId").equals(""))
				si.signalId = 0;
			else
			si.signalId = (int) drs.get(i).getValue("SignalId");
			si.signalName = drs.get(i).getValueAsString("SignalName");	
			si.floatValue=Float.parseFloat(drs.get(i).getValueAsString("FloatValue"));	
			si.showPrecision = (String) drs.get(i).getValue("ShowPrecision");
			si.unit = drs.get(i).getValueAsString("Unit");
			si.meanings=drs.get(i).getValueAsString("Meanings");
			if(drs.get(i).getValue("SignalCategory")==null || drs.get(i).getValue("SignalCategory").equals(""))
				si.SignalCategory = 0;
			else
			si.SignalCategory=(int) drs.get(i).getValue("SignalCategory");
			si.description = drs.get(i).getValueAsString("Description");
			String date=drs.get(i).getValueAsString("SampleTime");
			try {
				si.updateTime=ft.parse(date);
			} catch (java.text.ParseException e) {
				e.printStackTrace();
			}
			String baseTypeIdStr = drs.get(i).getValueAsString("BaseTypeId");
			si.baseTypeId = (baseTypeIdStr == null || baseTypeIdStr.equals("")) ? 0: Integer.parseInt(baseTypeIdStr);
			res.add(si);
			
		}
		
		return res;
	}

	@Override
	public int compareTo(ActiveSignal o) {
		if(this.updateTime == null || o.updateTime == null) return -1;
		
		if(this.updateTime.getTime() > o.updateTime.getTime())
			return 1;
		else if(this.updateTime.getTime() < o.updateTime.getTime())
			return -1;
		else
			return 0;
	}
	
	
}
