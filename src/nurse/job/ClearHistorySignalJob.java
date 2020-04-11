package nurse.job;

import org.apache.log4j.Logger;

import nurse.utility.DatabaseHelper;

public class ClearHistorySignalJob extends NurseJob{
	private static Logger log = Logger.getLogger(ClearHistorySignalJob.class);
	public ClearHistorySignalJob(long delay, long period) {
		super(delay, period);
	}

	@Override
	public void work(){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            
            for(int i=1;i<=12;i++){
            	sb.setLength(0);
            	sb.append("DELETE FROM tbl_historysignal");
            	sb.append(i);
            	sb.append(" where SampleTime < NOW() - INTERVAL 30 DAY;");
            	dbHelper.executeNoQuery(sb.toString());
            } 
		} catch (Exception e) {
			log.error("fail to clear his signal table", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
}
