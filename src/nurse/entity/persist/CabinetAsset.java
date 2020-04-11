package nurse.entity.persist;


import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class CabinetAsset {
	public Integer cabinetId;
	public String assetCode;
	public String assetName;
	public String assetType;
	public String assetStyle;
	public String vendor;
	public String usedDate;
	public String responsible;
	public String position;
	public String status;
	
	public static List<CabinetAsset> fromDataTable(DataTable dt) {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd"); 
		List<CabinetAsset> temps = new ArrayList<CabinetAsset>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for (int i = 0; i < rowCount; i++) {
			DataRow dataRow = drs.get(i);
			CabinetAsset ca = new CabinetAsset();
			ca.cabinetId = (Integer)dataRow.getValue("CabinetId");
			ca.assetCode = dataRow.getValueAsString("AssetsCode");
			ca.assetName = dataRow.getValueAsString("DeviceName");
			ca.assetType = dataRow.getValueAsString("AssetType");
			ca.assetStyle = dataRow.getValueAsString("AssetStyle");
			ca.vendor = dataRow.getValueAsString("Vendor");
			
			try {
				if(dataRow.getValueAsString("UsedDate") == null || dataRow.getValueAsString("UsedDate").equals("") )
					ca.usedDate = "";
				else
					ca.usedDate = format.format(format.parse(dataRow.getValueAsString("UsedDate")));
			} catch (ParseException e) {
				ca.usedDate = "";
			}
			
			ca.responsible = dataRow.getValueAsString("Responsible");
			ca.position = dataRow.getValueAsString("Position");
			ca.status = dataRow.getValueAsString("Status");

			temps.add(ca);
		}
		return temps;
	}
}
