package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class AisleThermalHumidity {
	public Integer id;
	public Integer mdcId;
	public Integer site;
	public String tDeviceId;
	public String tSignalId;
	public String hDeviceId;
	public String hSignalId;
	
	public String tValue;
	public String hValue;
	
	public static ArrayList<AisleThermalHumidity> fromDataTable(DataTable dt) {
		ArrayList<AisleThermalHumidity> aths = new ArrayList<AisleThermalHumidity>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			AisleThermalHumidity ath = new AisleThermalHumidity();
			
			ath.id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
			ath.mdcId = Integer.parseInt(drs.get(i).getValueAsString("MDCId"));
			ath.site = Integer.parseInt(drs.get(i).getValueAsString("Site"));
			ath.tDeviceId = drs.get(i).getValueAsString("TDeviceId");
			ath.tSignalId = drs.get(i).getValueAsString("TSignalId");
			ath.hDeviceId = drs.get(i).getValueAsString("HDeviceId");
			ath.hSignalId = drs.get(i).getValueAsString("HSignalId");
			
			aths.add(ath);
		}		
		return aths;
	}
}
