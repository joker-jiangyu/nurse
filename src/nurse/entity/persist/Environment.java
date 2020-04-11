package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Environment {
	public int Id;
	public int MdcId;
	public String Type;
	public int Site;
	public int EquipmentId;
	public int SignalId;
	
	public static ArrayList<Environment> fromDataTable(DataTable dt) {
		ArrayList<Environment> adls = new ArrayList<Environment>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for(int i=0;i<rowCount;i++)
		{
			Environment ment = new Environment();
			ment.Id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
			ment.MdcId = Integer.parseInt(drs.get(i).getValueAsString("MdcId"));
			ment.Type = drs.get(i).getValueAsString("Type");
			ment.Site = Integer.parseInt(drs.get(i).getValueAsString("Site"));
			ment.EquipmentId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
			ment.SignalId = Integer.parseInt(drs.get(i).getValueAsString("SignalId"));
			
			adls.add(ment);
		}
		return adls;
	}
}
