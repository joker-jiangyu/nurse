package nurse.job;


import nurse.utility.MainConfigHelper;
import org.apache.log4j.Logger;

import nurse.logic.providers.AlarmEmailProvider;

import java.util.Calendar;

public class MailboxAlarmJob extends NurseJob {
	private static Logger log = Logger.getLogger(MailboxAlarmJob.class);
	
	public MailboxAlarmJob(long delay, long period) {
		super(delay, period);
	}
	
	public void work(){
		try {
			int jetLag = 0;
			if(MainConfigHelper.getConfig().emailJetLag != null && !MainConfigHelper.getConfig().emailJetLag.equals("0")){
				try {
					jetLag = Integer.parseInt(MainConfigHelper.getConfig().emailJetLag);
				}catch (Exception ex){}
			}
			AlarmEmailProvider.getInstance().factory(jetLag);
		} catch (Exception e) {
			log.error("MailboxAlarmJob Exception:"+e);
		}
	}
}
