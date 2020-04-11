package nurse.logic.providers;

import java.util.ArrayList;
import org.apache.log4j.Logger;
import nurse.common.DataTable;
import nurse.entity.persist.MonitorUnit;
import nurse.utility.DatabaseHelper;

public class MonitorUnitProvider {

	private static MonitorUnitProvider instance = new MonitorUnitProvider();
	private static Logger log = Logger.getLogger(MonitorUnitProvider.class);
	
	public MonitorUnitProvider() {
	}
	
	public static MonitorUnitProvider getInstance(){
		return instance;
	}

	public ArrayList<MonitorUnit> GetMonitorUnitByStationId(int stationId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
        	dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TSL_MonitorUnit WHERE StationId = %d");               
            String sql = sb.toString();
            sql = String.format(sql, stationId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return MonitorUnit.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetMonitorUnitByStationId() failed.", e);	
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
        return null;
	}
	
}
