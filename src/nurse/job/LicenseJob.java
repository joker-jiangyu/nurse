package nurse.job;

import org.apache.log4j.Logger;

import nurse.logic.providers.LicenseProvider;

public class LicenseJob extends NurseJob {
	private static Logger log = Logger.getLogger(LicenseJob.class);

	public LicenseJob(long delay, long period) {
		super(delay, period);
	}
	public void work(){
		try {
			LicenseProvider.getInstance().factory();
		} catch (Exception e) {
			log.error("LicenseJob Exception:"+e);
		}
	}
}
