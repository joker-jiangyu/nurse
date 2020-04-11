package nurse.entity.persist;

import java.util.ArrayList;
import java.util.List;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class MDCEnvironment {
	public int id;
	public int mdcId;
	public String type;
	public int site;
	public int equipmentId;
	public int signalId;
	public String description;

	public static List<MDCEnvironment> fromDataTable(DataTable dt) {
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		List<MDCEnvironment> list = new ArrayList<MDCEnvironment>();
		try {
			for(int i = 0;i < rowCount;i ++){
				MDCEnvironment me = new MDCEnvironment();
				me.id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
				me.mdcId = Integer.parseInt(drs.get(i).getValueAsString("MdcId"));
				me.type = drs.get(i).getValueAsString("Type");
				me.site = Integer.parseInt(drs.get(i).getValueAsString("Site"));
				me.equipmentId = drs.get(i).getValueAsString("EquipmentId") == null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
				me.signalId = drs.get(i).getValueAsString("SignalId") == null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("SignalId"));
				me.description = drs.get(i).getValueAsString("Description");
				
				list.add(me);
			}
		} catch (Exception e) {}
		return list;
	}
}
