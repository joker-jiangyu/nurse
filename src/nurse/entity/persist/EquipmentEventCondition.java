package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EquipmentEventCondition {
	public Integer EquipmentId;
	public String EquipmentName;
	public Integer EventId;
	public String EventName;
	public Integer EventConditionId;
	public String Meanings;
	public String Name;
	
	public static ArrayList<EquipmentEventCondition> fromDataTable(DataTable dt) {
		ArrayList<EquipmentEventCondition> ds = new ArrayList<EquipmentEventCondition>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EquipmentEventCondition d = new EquipmentEventCondition();
			
			d.EquipmentId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
			d.EquipmentName = drs.get(i).getValueAsString("EquipmentName");
			d.EventId = Integer.parseInt(drs.get(i).getValueAsString("EventId"));
			d.EventName = drs.get(i).getValueAsString("EventName");
			d.EventConditionId = Integer.parseInt(drs.get(i).getValueAsString("EventConditionId"));
			d.Meanings = drs.get(i).getValueAsString("Meanings");
			d.Name = String.format("%s-%s", d.EventName,d.Meanings);
			ds.add(d);
		}		
		return ds;
	}
}
