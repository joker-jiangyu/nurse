package nurse.entity.persist;

import java.sql.Timestamp;
import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.logic.providers.ConfigCache;

public class HistorySignal {

	public String deviceName;
	public String signalName;
	public String baseTypeName;
	public double floatValue;
	public String showPrecision;
	public String unit;
	public Timestamp sampleTime;	
	public String meanings;
	public int signalCategory;
	
	//public String thresholdTypeName;
	//public String eventSeverityName;
	
	public int deviceId;
	public int signalId;
	public int baseTypeId;
	
	public HistorySignal() {
	}

	public static ArrayList<HistorySignal> getListFromDataTable(DataTable dt) {
		ArrayList<HistorySignal> hss = new ArrayList<HistorySignal>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			HistorySignal hs = new HistorySignal();
			int deviceId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
			int signalId = Integer.parseInt(drs.get(i).getValueAsString("SignalId"));

			hs.floatValue = Float.parseFloat(drs.get(i).getValueAsString("FloatValue"));			
			hs.sampleTime = (Timestamp) drs.get(i).getValue("SampleTime");
			
			ActiveSignal as= ConfigCache.getInstance().getActiveSignal(deviceId, signalId);
			if (as != null){
				hs.deviceName = as.deviceName;
				hs.signalName = as.signalName;
				hs.baseTypeName = as.baseTypeName;
				hs.showPrecision = as.showPrecision;
				hs.unit = as.unit;
				hs.signalCategory = as.SignalCategory;
				
				SignalMeanings sm = ConfigCache.getInstance().getSignalMeanings(
						as.equipmentTemplateId, signalId, (short)hs.floatValue);
				
				if (sm != null) hs.meanings = sm.Meanings;				
			} 
			hss.add(hs);
		}
		
		return hss;
	}

}
