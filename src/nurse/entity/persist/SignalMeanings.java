package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class SignalMeanings {

	public SignalMeanings() {
	}

	public int EquipmentTemplateId;
	public int SignalId;
	public short StateValue;
	public int BaseCondId;
	public String Meanings;
	
	public static ArrayList<SignalMeanings> fromDataTable(DataTable dt) {
		ArrayList<SignalMeanings> res = new ArrayList<SignalMeanings>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for(int i=0;i<rowCount;i++)
		{
			SignalMeanings sm = new SignalMeanings();
			sm.EquipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			sm.SignalId = (int) drs.get(i).getValue("SignalId");
			sm.StateValue = Short.parseShort(drs.get(i).getValueAsString("StateValue"));
			sm.Meanings = drs.get(i).getValueAsString("Meanings");
			
			res.add(sm);			
		}
		
		return res;
	}
}
