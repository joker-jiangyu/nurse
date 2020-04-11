package nurse.entity.persist;

import java.util.ArrayList;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class DataItem {

	public DataItem() {
	}

	public int ItemId;
	public String ItemValue;
	//扩展
	public String isSystem;//是否是系统添加
	public String ItemAlias;
	
	public static ArrayList<DataItem> fromDataTable(DataTable dt) {
		ArrayList<DataItem> ds = new ArrayList<DataItem>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DataItem d = new DataItem();
			
			d.ItemId = (int) (drs.get(i).getValue("ItemId") == null ? -1 : drs.get(i).getValue("ItemId"));
			d.ItemValue = drs.get(i).getValueAsString("ItemValue");

			d.isSystem =  drs.get(i).getValueAsString("IsSystem"); 
			d.ItemAlias = drs.get(i).getValueAsString("ItemAlias");
			
			ds.add(d);
		}		
		return ds;
	}
}
