package nurse.entity.persist;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class ChartHistorySignal extends HistorySignal implements Comparable<ChartHistorySignal>{
	public double maxFloatValue;
	public double minFloatValue;
	public double avgFloatValue;
	
	public static ArrayList<ChartHistorySignal> getAllListFromDataTable(DataTable dt){
		ArrayList<ChartHistorySignal> hss = new ArrayList<ChartHistorySignal>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			ChartHistorySignal hs = new ChartHistorySignal();
			hs.deviceId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
			hs.deviceName = drs.get(i).getValueAsString("EquipmentName");
			hs.signalId = Integer.parseInt(drs.get(i).getValueAsString("SignalId"));
			hs.signalName = drs.get(i).getValueAsString("SignalName");
			hs.baseTypeId = drs.get(i).getValueAsString("BaseTypeId") == null ? -1 : 
				Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
			hs.baseTypeName = drs.get(i).getValueAsString("BaseTypeName");
			hs.signalCategory = Integer.parseInt(drs.get(i).getValueAsString("SignalCategory"));
			
			try {
				double maxFloatValue = Double.parseDouble(drs.get(i).getValueAsString("MaxFloatValu"));
				hs.floatValue = Double.parseDouble(String.format("%.2f", maxFloatValue));
				
				hs.maxFloatValue = maxFloatValue;
				double minFloatValue = Double.parseDouble(drs.get(i).getValueAsString("MinFloatValu"));
				hs.minFloatValue = Double.parseDouble(String.format("%.2f", minFloatValue));
				double avgFloatValue = Double.parseDouble(drs.get(i).getValueAsString("AvgFloatValu"));
				hs.avgFloatValue = Double.parseDouble(String.format("%.2f", avgFloatValue));
			} catch (Exception e) {
				hs.floatValue = 0;
				hs.maxFloatValue = 0;
				hs.minFloatValue = 0;
				hs.avgFloatValue = 0;
			}

			hs.unit = drs.get(i).getValueAsString("Unit");
			hs.sampleTime = (Timestamp) drs.get(i).getValue("SampleTime");
			hss.add(hs);
		}
		//按时间排序
		Collections.sort(hss);
		
		return hss;
	}

	@Override
	public int compareTo(ChartHistorySignal hs) {
		if(this.sampleTime == null || hs.sampleTime == null) 
			return -1;
		
		if(this.sampleTime.getTime() > hs.sampleTime.getTime())
			return 1;
		else if(this.sampleTime.getTime() < hs.sampleTime.getTime())
			return -1;
		else
			return 0;	
	}
}
