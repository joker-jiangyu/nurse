package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.DataItem;
import nurse.utility.DatabaseHelper;


public class DataItemProvider {

	private static DataItemProvider instance = new DataItemProvider();
	private static Logger log = Logger.getLogger(DataItemProvider.class);
	
	public DataItemProvider() {
	}
	
	public static DataItemProvider getInstance(){
		return instance;
	}

	public ArrayList<DataItem> GetDataItemsByEntryId(int EntryId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_DataItem WHERE EntryId = %d");
            String sql = sb.toString();
            sql = String.format(sql, EntryId);
                  
            DataTable dt = dbHelper.executeToTable(sql);
            
            return DataItem.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read dataItems", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

	}
	
	public boolean InsertDataItem(int EntryId,int ItemId,int ParentEntryId,int ParentItemId,int IsSystem,String ItemValue,String Description,String ItemAlias){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" call PIL_InitDictionaryEntryItem(%s,%s,%s,%s,%s,'%s','%s','%s')",
					EntryId,ItemId,ParentEntryId,ParentItemId,IsSystem,ItemValue,Description,ItemAlias);
			
            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("Database exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	public boolean UpdateDataItemByEntryIdAndItemId(int EntryId,int ItemId,String ItemValue,String ItemAlias){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("UPDATE TBL_DataItem ");
			sql.append("SET ItemValue = '%s',ItemAlias = '%s' ");
			sql.append("WHERE EntryId = %s AND ItemId = %s;");
			
            dbHelper.executeNoQuery(String.format(sql.toString(), ItemValue,ItemAlias,EntryId,ItemId));
		} catch (Exception e) {
			log.error("Database exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
}
