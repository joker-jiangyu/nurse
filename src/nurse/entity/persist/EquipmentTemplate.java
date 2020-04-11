package nurse.entity.persist;

import java.util.ArrayList;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EquipmentTemplate {

	public EquipmentTemplate() {
	}

	public int EquipmentTemplateId;
	public int ParentTemplateId;
	public int EquipmentCategory;
	public int EquipmentType;
	public Integer EquipmentBaseType;
	public Integer StationCategory;
	
	public String EquipmentTemplateName;
	public String Memo;
	public String ProtocolCode;
	public String Property;
	public String Description;
	public String EquipmentStyle;
	public String Unit;
	public String Vendor;
	public String SoName;
	
	public int getEquipmentTemplateId() {
		return EquipmentTemplateId;
	}

	public void setEquipmentTemplateId(int EquipmentTemplateId) {
		this.EquipmentTemplateId = EquipmentTemplateId;
	}	
	
	public static ArrayList<EquipmentTemplate> fromDataTable(DataTable dt) {
		ArrayList<EquipmentTemplate> ds = new ArrayList<EquipmentTemplate>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EquipmentTemplate d = new EquipmentTemplate();
			
			d.EquipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			d.ParentTemplateId = (int) drs.get(i).getValue("ParentTemplateId");
			d.EquipmentCategory = (int) drs.get(i).getValue("EquipmentCategory");
			d.EquipmentType = (int) drs.get(i).getValue("EquipmentType");
			d.EquipmentBaseType = (Integer) drs.get(i).getValue("EquipmentBaseType");
			d.StationCategory = (Integer) drs.get(i).getValue("StationCategory");
			d.EquipmentTemplateName = (String) drs.get(i).getValue("EquipmentTemplateName");
			d.Memo = (String) drs.get(i).getValue("Memo");
			d.ProtocolCode = (String) drs.get(i).getValue("ProtocolCode");
			d.Property = (String) drs.get(i).getValue("Property");
			d.Description = (String) drs.get(i).getValue("Description");
			d.EquipmentStyle = (String) drs.get(i).getValue("EquipmentStyle");
			d.Unit = (String) drs.get(i).getValue("Unit");
			d.Vendor = (String) drs.get(i).getValue("Vendor");
			
			ds.add(d);
		}		
		return ds;
	}

	public static ArrayList<EquipmentTemplate> fromDataTables(DataTable dt) {
		ArrayList<EquipmentTemplate> ds = new ArrayList<EquipmentTemplate>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for(int i=0;i<rowCount;i++)
		{
			EquipmentTemplate d = new EquipmentTemplate();

			d.EquipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			d.ParentTemplateId = (int) drs.get(i).getValue("ParentTemplateId");
			d.EquipmentCategory = (int) drs.get(i).getValue("EquipmentCategory");
			d.EquipmentType = (int) drs.get(i).getValue("EquipmentType");
			d.EquipmentBaseType = (Integer) drs.get(i).getValue("EquipmentBaseType");
			d.StationCategory = (Integer) drs.get(i).getValue("StationCategory");
			d.EquipmentTemplateName = (String) drs.get(i).getValue("EquipmentTemplateName");
			d.Memo = (String) drs.get(i).getValue("Memo");
			d.ProtocolCode = (String) drs.get(i).getValue("ProtocolCode");
			d.Property = (String) drs.get(i).getValue("Property");
			d.Description = (String) drs.get(i).getValue("Description");
			d.EquipmentStyle = (String) drs.get(i).getValue("EquipmentStyle");
			d.Unit = (String) drs.get(i).getValue("Unit");
			d.Vendor = (String) drs.get(i).getValue("Vendor");
			d.SoName = (String) drs.get(i).getValue("DllPath");

			ds.add(d);
		}
		return ds;
	}
}
