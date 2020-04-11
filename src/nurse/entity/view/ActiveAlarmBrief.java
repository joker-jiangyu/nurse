package nurse.entity.view;

import java.text.SimpleDateFormat;
import java.util.regex.Pattern;

import nurse.entity.persist.ActiveAlarm;
import nurse.logic.handlers.LanguageDataHandler;

public class ActiveAlarmBrief {

	public String uniqueId;
	public String alarmLevel;
	public String alarmLevelName;
	public String alarmContent;
	public String startTime;
	public String endTime;
	public String remark;
	public String cancelUserName;
	
	public int deviceId;
	public String deviceName;
	public String eventName;
	public String meanings;
	public String triggerValue;
	
	public ActiveAlarmBrief(ActiveAlarm aa,String triggerVal) {
		this.uniqueId = aa.uniqueId;
		this.alarmLevel = String.valueOf(aa.alarmLevel);
		this.alarmLevelName = aa.alarmLevelName;
		this.deviceName = aa.deviceName;
		this.eventName = aa.eventName;
		this.meanings = aa.meanings;
		this.triggerValue = floatToString(aa.triggerValue);


		if(aa.cancelUserName != null && !aa.cancelUserName.equals("")) {
			if(aa.remark == null || aa.remark.equals("undefined"))
				this.remark = String.format("[%s]", aa.cancelUserName);
			else
				this.remark = String.format("[%s] %s", aa.cancelUserName, aa.remark);
		}else
			this.remark = "";
		this.deviceId = aa.deviceId;

		//String triggerPrompt = "触发值";
		if(!LanguageDataHandler.getLanaguage().equals("Chinese")){
			String key = "AlarmRecord.";
			if(aa.alarmLevel == 0) key += "PAlarm";
			else if(aa.alarmLevel == 1) key += "GAlarm";
			else if(aa.alarmLevel == 2) key += "IAlarm";
			else key += "EAlarm";
			this.alarmLevelName = LanguageDataHandler.getLanaguageJsonValue(key);
			//triggerPrompt = LanguageDataHandler.getLanaguageJsonValue("AlarmRecord.TriggerVal");
		}
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		this.startTime = formatter.format(aa.startTime);
		
		if (aa.endTime != null)
			this.endTime = formatter.format(aa.endTime);

		StringBuilder sb = new StringBuilder();
		sb.append(this.alarmLevelName);
		sb.append(" ");
		sb.append(this.deviceName);
		sb.append(" ");
		sb.append(this.eventName);
		sb.append(" ");
		sb.append(this.meanings);
		sb.append(String.format(" [%s:",triggerVal));
		sb.append(this.triggerValue);
		//sb.append(String.format("%.2f", aa.triggerValue));
		sb.append("]");
		this.alarmContent = sb.toString();
	}

	/* 区分整型还是浮点型  */
	private static String floatToString(float val){
		String str = String.valueOf(val);
		java.util.regex.Pattern pattern = Pattern.compile("[0-9]*(\\.?)[0]*");
		if(pattern.matcher(str).matches()){
			return String.valueOf((int)val);
		}else
			return str;
	}
}
