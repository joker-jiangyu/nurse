package nurse.entity.persist;
import java.util.Date;

import nurse.logic.providers.ConfigCache;

import java.text.SimpleDateFormat;

public class RealData {
	public int EquipId;
	public int SignalId;
	public float FloatValue;
	public String StringValue;
	public Date SamplerTime;
	public int EventSeverity;
	public int ValueType;
	public int BaseTypeId;
	public int Valid;//0 ��Ч��1��Ч
	//equipid,signal id,value,samplertime,EventSeverity,valuetype,basetypeid
	public RealData String2Data(String strData)	{
		RealData data = new RealData();
		try	{
			String[] str = strData.split("\\,");
			if(str.length >= 8){
				EquipId = Integer.parseInt(str[0]);
				SignalId = Integer.parseInt(str[1]);
				
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				if(str[3] != null && !str[3].isEmpty())
				{
					SamplerTime = sdf.parse(str[3]);
				}
				
				EventSeverity = Integer.parseInt(str[4]);
				ValueType = Integer.parseInt(str[5]);
				BaseTypeId = Integer.parseInt(str[6]);
				Valid  = Integer.parseInt(str[7]);
				//float type
				if(ValueType == 0)
				{
					FloatValue = Float.parseFloat(str[2]);
				}
				else
				{
					StringValue = str[2];
				}
			}
		} 
		catch (Exception e){
			e.printStackTrace(); 
		}
		
		return data;
	}
	
	public void updateActiveSignalCache(){
		ActiveSignal as = ConfigCache.getInstance().getActiveSignal(EquipId, SignalId);
		as.setAlarmSeverity(this.EventSeverity);
		as.floatValue = this.FloatValue;
		as.stringValue = this.StringValue;	
		as.valueType = this.ValueType;
		as.updateTime = this.SamplerTime;	
		as.setMeanings(GetMeanings(this,as.equipmentTemplateId));
	}
	
	private String GetMeanings(RealData rd,int equipmentTemplateId){
		String result="";
		SignalMeanings sm = ConfigCache.getInstance().getSignalMeanings(equipmentTemplateId,
				rd.SignalId, (short)rd.FloatValue);
		if (sm != null)
			result = sm.Meanings;
		return result;
	}
}
