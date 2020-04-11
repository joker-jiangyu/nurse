package nurse.entity.view;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;

import nurse.entity.persist.HistorySignal;

public class HisData {

	public String name;
	public String baseType;
	public double floatValue;
	public String meanings;
	public String unit;
	public String showPrecision;
	public String sampleTime;
	public long timeStamp;
	public int signalCategory;
	
	public HisData() {
		
	}
	
	public static ArrayList<HisData> GetArrayFromInstances(ArrayList<HistorySignal> hss) {
		ArrayList<HisData> hds = new ArrayList<HisData>(); 
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		
		hss.sort(new Comparator<HistorySignal>(){
			@Override
			public int compare(HistorySignal a, HistorySignal b) {
				return a.sampleTime.compareTo(b.sampleTime);
			}			
		});
		
		for(HistorySignal hs : hss)
		{
			HisData hd = new HisData();
			
			hd.name = hs.deviceName + " " + hs.signalName;
			hd.baseType = hs.baseTypeName;
			hd.floatValue = hs.floatValue;
			hd.meanings = hs.meanings;
			hd.unit = hs.unit;
			hd.signalCategory = hs.signalCategory;
			hd.showPrecision = hs.showPrecision;
			hd.sampleTime = formatter.format(hs.sampleTime);
			hd.timeStamp = hs.sampleTime.getTime();
			hds.add(hd);
		}

		return hds;
	}

}
