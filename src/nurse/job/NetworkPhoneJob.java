package nurse.job;

import org.apache.log4j.Logger;

import nurse.logic.providers.NetworkPhoneProvider;

public class NetworkPhoneJob extends NurseJob {
	private static Logger log = Logger.getLogger(NetworkPhoneJob.class);
	
	public NetworkPhoneJob(long delay, long period) {
		super(delay, period);
	}
	
	public void work(){
		try {
			NetworkPhoneProvider.getInstance().networkPhoneFactory();
		} catch (Exception e) {
			log.error("NetworkPhoneJob Exception:"+e);
		}
	}
}
