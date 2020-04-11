package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EquipmentBaseType {
	public int baseEquipmentId;
	public String baseEquipmentName;
	public int equipmentTypeId;
	public int equipmentSubTypeId;
	public String description;
	public int getBaseEquipmentId() {
		return baseEquipmentId;
	}
	public void setBaseEquipmentId(int baseEquipmentId) {
		this.baseEquipmentId = baseEquipmentId;
	}
	public String getBaseEquipmentName() {
		return baseEquipmentName;
	}
	public void setBaseEquipmentName(String baseEquipmentName) {
		this.baseEquipmentName = baseEquipmentName;
	}
	public int getEquipmentTypeId() {
		return equipmentTypeId;
	}
	public void setEquipmentTypeId(int equipmentTypeId) {
		this.equipmentTypeId = equipmentTypeId;
	}
	public int getEquipmentSubTypeId() {
		return equipmentSubTypeId;
	}
	public void setEquipmentSubTypeId(int equipmentSubTypeId) {
		this.equipmentSubTypeId = equipmentSubTypeId;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	
	public static ArrayList<EquipmentBaseType> fromDataTable(DataTable dt) {
		ArrayList<EquipmentBaseType> ds = new ArrayList<EquipmentBaseType>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EquipmentBaseType e = new EquipmentBaseType();
			e.baseEquipmentId = (int) drs.get(i).getValue("BaseEquipmentId");
			e.baseEquipmentName = (String) drs.get(i).getValue("BaseEquipmentName");
			e.equipmentTypeId = (int) drs.get(i).getValue("EquipmentTypeId");
			e.equipmentSubTypeId = (int) drs.get(i).getValue("EquipmentSubTypeId");
			e.description = (String) drs.get(i).getValue("Description");
			ds.add(e);
		}		
		return ds;
	}
}
