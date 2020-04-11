package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Puerecord {
	public String id;
	public double pue;
	public Date collectTime;
	
	public static ArrayList<Puerecord> getPuerecoreData(DataTable dt){
		ArrayList<Puerecord> pues = new ArrayList<Puerecord>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DataRow dataRow = drs.get(i);
			Puerecord pue = new Puerecord();
			
			pue.id = dataRow.getValueAsString("number");
			pue.pue = Double.parseDouble(dataRow.getValueAsString("pue"));
			pue.collectTime = (Date)dataRow.getValue("collectTime");
			
			pues.add(pue);
		}
		return pues;	
	}
}
