package nurse.job;

import org.apache.log4j.Logger;

import nurse.logic.providers.DevControlProvider;

public class ClearHistoryControlJob extends NurseJob {
	private static Logger log = Logger.getLogger(ClearHistoryControlJob.class);
	
	public ClearHistoryControlJob(long delay, long period) {
		super(delay, period);
	}
	
	public void work(){
		try {
			DevControlProvider.getInstance().removeCommand();
		} catch (Exception e) {
			log.error("ClearHistoryControlJob Exception:"+e);
		}
	}
}
