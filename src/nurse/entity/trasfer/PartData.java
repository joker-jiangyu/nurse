package nurse.entity.trasfer;

import java.text.SimpleDateFormat;
import java.util.Date;

import nurse.entity.persist.ActiveSignal;
import nurse.logic.providers.ConfigCache;

public class PartData {

	public PartData() {
	}
	
	public String partId ;
	public String deviceId;
	public String signalId;
	public String baseTypeId;
	public String deviceName;
	public String signalName;
	public String baseTypeName;
	public String currentValue;
	public float floatValue;
	public String alarmSeverity;
	public String updateTime;	
	
	public int index;
	public String description;      
	public String unit;
	
	public static PartData FromActiveSignal(String partId, ActiveSignal sig)
	{
		PartData pd = new PartData();
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		
		pd.partId = partId;
		pd.deviceId = String.valueOf(sig.deviceId);
		pd.signalId = String.valueOf(sig.signalId);
		pd.baseTypeId = String.valueOf(sig.baseTypeId);
		pd.deviceName = sig.deviceName;
		pd.signalName = sig.signalName;
		pd.baseTypeName = sig.baseTypeName;
		pd.currentValue = sig.getCurrentValue();
		pd.alarmSeverity = String.valueOf(sig.getAlarmSeverity(sig.deviceId));
		Date time = (sig.updateTime == null || sig.updateTime.equals(""))?(new Date()):sig.updateTime;
		pd.updateTime = formatter.format(time);
		
		return pd;		
	}

	public static PartData MakeFromBindingSignal(String partId, BindingSignal bs) {
		PartData pd = new PartData();
		pd.partId = partId;
		pd.deviceId = String.valueOf(bs.deviceId);
		pd.signalId = String.valueOf(bs.signalId);
		pd.baseTypeId = String.valueOf(bs.baseTypeId);		
		
		return pd;
	}
	
	public void updateData(){
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		ActiveSignal as = null;
		if (Integer.parseInt(this.signalId) != 0)
		{
			as = ConfigCache.getInstance().getActiveSignal(Integer.parseInt(deviceId), Integer.parseInt(signalId));
		}
		else{
			as = ConfigCache.getInstance().getActiveBaseTypeSignal(Integer.parseInt(deviceId), 
					Integer.parseInt(baseTypeId));
		}
		
		if (as == null) return;
		
		this.deviceName = as.deviceName;
		signalName = as.signalName;
		baseTypeName = as.baseTypeName;
		currentValue = as.getCurrentValue();
		floatValue = as.getFloatValue();
		alarmSeverity = String.valueOf(as.getAlarmSeverity(Integer.parseInt(deviceId)));
		Date time = (as.updateTime == null || as.updateTime.equals(""))?(new Date()):as.updateTime;
		updateTime = formatter.format(time);			
	}	

}
