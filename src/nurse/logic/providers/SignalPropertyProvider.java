package nurse.logic.providers;

import org.apache.log4j.Logger;
import nurse.utility.DatabaseHelper;

public class SignalPropertyProvider {

	private static SignalPropertyProvider instance = new SignalPropertyProvider();
	private static Logger log = Logger.getLogger(SignalPropertyProvider.class);
	
	public SignalPropertyProvider() {
	}
	
	public static SignalPropertyProvider getInstance(){
		return instance;
	}

	public boolean InsertSignalProperty(int EquipmentTemplateId, int SignalId, int SignalPropertyId) {

		DatabaseHelper dbHelper = null;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_SignalProperty");
	            sb.append("(EquipmentTemplateId, SignalId, SignalPropertyId)");
	            sb.append(" VALUES (%d, %d, %d)");

	            String sql = sb.toString();
	            sql = String.format(sql,  EquipmentTemplateId, SignalId, SignalPropertyId);
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertSignalProperty() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
}
