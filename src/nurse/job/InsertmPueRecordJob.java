package nurse.job;

import org.apache.log4j.Logger;

import nurse.logic.providers.ActiveSignalProvider;

public class InsertmPueRecordJob extends NurseJob {
	private static Logger log = Logger.getLogger(InsertmPueRecordJob.class);
	
	public InsertmPueRecordJob(long delay, long period) {
		super(delay, period);
	}
	
	public void work(){
		try {
			ActiveSignalProvider.getInstance().timerInsertmPueRecord();
		} catch (Exception e) {
			log.error("InsertmPueRecordJob Exception:"+e);
		}
	}
}