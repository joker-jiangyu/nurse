package nurse.job;

import java.util.Timer;
import java.util.TimerTask;

import org.apache.log4j.Logger;

import nurse.logic.providers.AssetRackManagerProvider;


public class RackAssetsJob extends NurseJob {
	private static Logger log = Logger.getLogger(RackAssetsJob.class);

	public RackAssetsJob(long delay, long period) {
		super(delay, period);
		
		//启动数码人机架服务
		startRackServer();
	}
	
	public void work(){
		try {
			AssetRackManagerProvider.getInstance().factory();
		} catch (Exception e) {
			log.error("RackAssetsJob Exception:"+e);
		}
	}

	
	private static void startRackServer(){
		Timer timer = new Timer();
	    timer.schedule(new TimerTask() {
	      public void run() {
	    	AssetRackManagerProvider.getInstance().startRackServer();
	      }
	    },1000*10);
	}
}
