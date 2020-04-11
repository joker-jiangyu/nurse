package nurse.entity.view;

import java.text.SimpleDateFormat;
import java.util.Date;

import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.SignalMeanings;
import nurse.logic.providers.ConfigCache;

public class ActiveSignalBrief implements Comparable<ActiveSignalBrief>{

	public ActiveSignalBrief() {
	}
	
	public int baseTypeId;
	public int alarmSeverity;
	
	public String baseTypeName;
	public String signalName;
	public String currentValue;
	public String updateTime;
	public float floatValue;
	
	public int displayIndex;

	public int getBaseTypeId() {
		return baseTypeId;
	}

	public void setBaseTypeId(int baseTypeId) {
		this.baseTypeId = baseTypeId;
	}

	public int getAlarmSeverity() {
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

	public String getSignalName() {
		return signalName;
	}

	public void setSignalName(String signalName) {
		this.signalName = signalName;
	}

	public float getFloatValue() {
		return floatValue;
	}

	public void setFloatValue(float floatValue) {
		this.floatValue = floatValue;
	}

	public static ActiveSignalBrief From(ActiveSignal sig)
	{
		ActiveSignalBrief asb = new ActiveSignalBrief();
		
		asb.alarmSeverity  = sig.getAlarmSeverity(sig.deviceId);
		asb.baseTypeId = sig.baseTypeId;
		asb.baseTypeName = sig.baseTypeName;
		asb.floatValue = sig.floatValue;
		if(sig.SignalCategory == 1)//环境量
			asb.currentValue = sig.getCurrentValue();
		else{// 开关量
			SignalMeanings sm = ConfigCache.getInstance().getSignalMeanings(sig.equipmentTemplateId,
					sig.signalId, (short)sig.floatValue);
			asb.currentValue = sm.Meanings;
		}
		asb.signalName = sig.signalName;
		
		asb.displayIndex = sig.displayIndex;
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date time = (sig.updateTime == null || sig.updateTime.equals(""))?(new Date()):sig.updateTime;
		asb.updateTime = formatter.format(time);
		
		return asb;
	}

	@Override
	public int compareTo(ActiveSignalBrief o) {
		try{
			//通讯状态第一位
			if(o.displayIndex == 500)
				return 1;
			else if(this.displayIndex == 500)
				return -1;
			//其他信号根据显示顺序排序
			if(this.displayIndex > o.displayIndex)
				return 1;
			else if(this.displayIndex == o.displayIndex)
				return 0;
			else 
				return -1;
		}catch (Exception e) {
			return -1;
		}
	}
}
