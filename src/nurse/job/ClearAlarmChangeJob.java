package nurse.job;

import org.apache.log4j.Logger;
import nurse.utility.DatabaseHelper;

public class ClearAlarmChangeJob extends NurseJob{
	private static Logger log = Logger.getLogger(ClearAlarmChangeJob.class);
	
	public ClearAlarmChangeJob(long delay, long period) {
		super(delay, period);
	}

	@Override
	public void work(){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("DELETE FROM tbl_alarmchange where InsertTime < NOW() - INTERVAL 3 DAY;");                       
            
            dbHelper.executeNoQuery(sb.toString());
            
		} catch (Exception e) {
			log.error("fail to clear alarm change table", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
