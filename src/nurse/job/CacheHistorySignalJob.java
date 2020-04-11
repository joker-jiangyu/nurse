package nurse.job;

import org.apache.log4j.Logger;

import nurse.logic.providers.CacheHistorySignalProvider;

public class CacheHistorySignalJob extends NurseJob {
	private static Logger log = Logger.getLogger(CacheHistorySignalJob.class);
	
	public CacheHistorySignalJob(long delay, long period) {
		super(delay, period);
	}
	
	public void work(){
		try {
			CacheHistorySignalProvider.getInstance().factory();
		} catch (Exception e) {
			log.error("CacheHistorySignalJob Exception:"+e);
		}
	}
}
