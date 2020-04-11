package nurse.logic.providers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map.Entry;

import org.apache.log4j.Logger;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.view.ActiveDevice;
import nurse.utility.DatabaseHelper;

public class ActiveDeviceProvider {
	
	private static ActiveDeviceProvider instance = new ActiveDeviceProvider();
	private static Logger log = Logger.getLogger(ActiveDeviceProvider.class);
	
	public ActiveDeviceProvider() {
	}
	
	public static ActiveDeviceProvider getInstance(){
		return instance;
	}

	public ArrayList<ActiveDevice> GetAllActiveDevices() {
		return ConfigCache.getInstance().getAllActiveDevices();
	}

	public HashMap<Integer, Integer> getAllConnectStates() {
		HashMap<Integer, Integer> map = new HashMap<Integer, Integer>(); 
		DatabaseHelper dbHelper = null;
		
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            
            sb.append("SELECT A.EquipmentId, A.ConnectState\r\n");
            sb.append("from tbl_equipment A ;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            DataRowCollection drs = dt.getRows();
    		int rowCount = dt.getRowCount();
    		
    		for(int i=0;i<rowCount;i++)
    		{
    			int deviceId = (int) drs.get(i).getValue("EquipmentId");
    			int connectState = (int)drs.get(i).getValue("ConnectState");
    			map.put(deviceId, connectState);
    		}		
            
		} catch (Exception e) {
			log.error("fail to read all device conn states", e);
			return map;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return map;
	}
}
