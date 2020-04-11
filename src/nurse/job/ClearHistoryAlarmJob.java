package nurse.job;

import org.apache.log4j.Logger;

import nurse.utility.DatabaseHelper;

public class ClearHistoryAlarmJob  extends NurseJob{
	private static Logger log = Logger.getLogger(ClearHistoryAlarmJob.class);
	
	public ClearHistoryAlarmJob(long delay, long period) {
		super(delay, period);
	}
	
	@Override
	public void work(){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("DELETE FROM tbl_historyevent where StartTime < NOW() - INTERVAL 90 DAY;");
            
            dbHelper.executeNoQuery(sb.toString());
            
		} catch (Exception e) {
			log.error("fail to clear his alarm table", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
