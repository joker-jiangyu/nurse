package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class ControlMeanings {

	public ControlMeanings() {
	}

	public int EquipmentTemplateId;
	public int ControlId;
	public short ParameterValue;
	public int BaseCondId;
	public String Meanings;
	
	public static ArrayList<ControlMeanings> fromDataTable(DataTable dt) {
		ArrayList<ControlMeanings> ds = new ArrayList<ControlMeanings>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			ControlMeanings c = new ControlMeanings();	
			c.EquipmentTemplateId = (int)drs.get(i).getValue("EquipmentTemplateId");
			c.ControlId = (int)drs.get(i).getValue("ControlId");
			c.ParameterValue = ((Integer)drs.get(i).getValue("ParameterValue")).shortValue();
			c.Meanings = (String)drs.get(i).getValue("Meanings");
			
			ds.add(c);
		}		
		return ds;
	}
}
