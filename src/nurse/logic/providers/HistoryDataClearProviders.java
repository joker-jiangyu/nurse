package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.IntervalClearData;
import nurse.utility.DatabaseHelper;

public class HistoryDataClearProviders {

	private static Logger log = Logger.getLogger(HistoryDataClearProviders.class);

	private static HistoryDataClearProviders instance = new HistoryDataClearProviders();

	public static HistoryDataClearProviders getInstance() {
		return instance;
	}
	
	public ArrayList<IntervalClearData> getAllIntervalClearData(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		ArrayList<IntervalClearData> icds = new ArrayList<IntervalClearData>();
		try {
            dbHelper = new DatabaseHelper();
            String sql = "select * from TBL_IntervalClearData;";
            dt = dbHelper.executeToTable(sql);
            icds = IntervalClearData.fromDataTable(dt);
		} catch (Exception e) {
			log.error(e);
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
		return icds;
	}
	
	public boolean insertIntervalClearData(IntervalClearData icd){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
            dbHelper = new DatabaseHelper();
            String sql = "select MAX(Id) AS 'MaxId' from TBL_IntervalClearData;";
            dt = dbHelper.executeToTable(sql);
            int NextId = 100000001;
            if(dt.getRows().get(0).getValue("MaxId") != null){
            	NextId = ((int)dt.getRows().get(0).getValue("MaxId")) + 1;
            }
        	sql = String.format("insert into TBL_IntervalClearData values(%s,'%s','%s',%s,%s,%s,'%s',%s);",
        			NextId,icd.name,icd.clearObject,icd.delay,icd.period,icd.storageDays,icd.storageCols,icd.status);
        	dbHelper.executeNoQuery(sql);
            return true;
		} catch (Exception e) {
			log.error(e);
			return false;
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean updateIntervalClearData(IntervalClearData icd){
		DatabaseHelper dbHelper = null;
		try {
            dbHelper = new DatabaseHelper();
            String sql = String.format("UPDATE TBL_IntervalClearData SET `Name` = '%s' , ClearObject = '%s' , Delay = %s , Period = %s , StorageDays = %s , StorageCols = '%s' , `Status` = %s WHERE Id = %s;",
        			icd.name,icd.clearObject,icd.delay,icd.period,icd.storageDays,icd.storageCols,icd.status,icd.id);
        	dbHelper.executeNoQuery(sql);
            return true;
		} catch (Exception e) {
			log.error(e);
			return false;
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean deleteIntervalClearData(String id){
		DatabaseHelper dbHelper = null;
		try {
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_IntervalClearData WHERE Id = %s;",id);
        	dbHelper.executeNoQuery(sql);
            return true;
		} catch (Exception e) {
			log.error(e);
			return false;
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
