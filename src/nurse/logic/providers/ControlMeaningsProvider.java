package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.ControlMeanings;
import nurse.entity.persist.EventCondition;
import nurse.utility.DatabaseHelper;

public class ControlMeaningsProvider {

	private static ControlMeaningsProvider instance = new ControlMeaningsProvider();
	private static Logger log = Logger.getLogger(ControlMeaningsProvider.class);
	
	public ControlMeaningsProvider() {
	}
	
	public static ControlMeaningsProvider getInstance(){
		return instance;
	}

	public boolean InsertControlMeanings(int EquipmentTemplateId, int ControlId, short ParameterValue, String Meanings) {

		DatabaseHelper dbHelper = null;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_ControlMeanings");
	            sb.append("(EquipmentTemplateId, ControlId, ParameterValue, Meanings)");
	            sb.append(" VALUES (%d, %d, %d, '%s')");

	            String sql = sb.toString();
	            sql = String.format(sql, EquipmentTemplateId, ControlId, ParameterValue, Meanings);
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertControlMeanings() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
	
	public ArrayList<ControlMeanings> GetControlMeaningsById(int equipmentTemplateId){
		DatabaseHelper dbHelper = null;
		ArrayList<ControlMeanings> list = new ArrayList<ControlMeanings>();
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT * FROM TBL_ControlMeanings WHERE EquipmentTemplateId=%s;",equipmentTemplateId));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	            
	            list = ControlMeanings.fromDataTable(dt);
			} catch (Exception e) {
				log.error("fail to get Commmunication event", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return list;
	}
}
