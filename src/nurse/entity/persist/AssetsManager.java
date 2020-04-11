package nurse.entity.persist;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class AssetsManager {
	public int assetsId;
	public String assetsCode;
	public int cabinetId;
	public String assetsName;
	public String assetType;
	public String assetStyle;
	public int equipmentId;
	public String vendor;
	public String usedDate;
	public String responsible;
	public String position;
	public int uIndex;
	public int uHeight;
	public String status;
	public String description;

	public static ArrayList<AssetsManager> fromDataTable(DataTable dt) {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd"); 
		ArrayList<AssetsManager> ds = new ArrayList<AssetsManager>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for (int i = 0; i < rowCount; i++) {
			DataRow dataRow = drs.get(i);
			AssetsManager a = new AssetsManager();
			a.assetsId = dataRow.getValueAsString("AssetsId") == null ? -1 : Integer.parseInt(dataRow.getValueAsString("AssetsId"));
			a.assetsCode = dataRow.getValueAsString("AssetsCode");
			a.cabinetId = dataRow.getValueAsString("CabinetId") == null ? -1 : Integer.parseInt(dataRow.getValueAsString("CabinetId"));
			a.assetsName = dataRow.getValueAsString("AssetsName");

			a.assetType = "null".equalsIgnoreCase(dataRow.getValueAsString("AssetType")) ? ""
					: dataRow.getValueAsString("AssetType");
			a.assetStyle = "null".equalsIgnoreCase(dataRow.getValueAsString("AssetStyle")) ? ""
					: dataRow.getValueAsString("AssetStyle");
			a.assetsName = dataRow.getValueAsString("AssetsName");
			if (dataRow.getValueAsString("EquipmentId") != null) {
				a.equipmentId = dataRow.getValueAsString("EquipmentId") == null ? -1 : Integer.parseInt(dataRow.getValueAsString("EquipmentId"));
			}
			a.vendor = "null".equalsIgnoreCase(dataRow.getValueAsString("Vendor")) ? ""
					: dataRow.getValueAsString("Vendor");
			
			try {
				a.usedDate = format.format(format.parse(dataRow.getValueAsString("UsedDate")));
			} catch (ParseException e) {
				a.usedDate = "";
			}
			
			a.responsible = "null".equalsIgnoreCase(dataRow.getValueAsString("Responsible")) ? ""
					: dataRow.getValueAsString("Responsible");
			a.position = dataRow.getValueAsString("Position");
			a.uIndex = dataRow.getValueAsString("UIndex") == null ? -1 : Integer.parseInt(dataRow.getValueAsString("UIndex"));
			a.uHeight = dataRow.getValueAsString("UHeight") == null ? -1 : Integer.parseInt(dataRow.getValueAsString("UHeight"));
			a.status = "null".equalsIgnoreCase(dataRow.getValueAsString("Status")) ? ""
					: dataRow.getValueAsString("Status");
			a.description = "null".equalsIgnoreCase(dataRow.getValueAsString("Description")) ? ""
					: dataRow.getValueAsString("Description");
			ds.add(a);
		}
		return ds;
	}
}
