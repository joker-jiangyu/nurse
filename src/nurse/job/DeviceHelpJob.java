package nurse.job;

import nurse.logic.providers.DeviceProvider;
import org.apache.log4j.Logger;

public class DeviceHelpJob extends NurseJob {
    private static Logger log = Logger.getLogger(CacheHistorySignalJob.class);

    public DeviceHelpJob(long delay, long period) {
        super(delay, period);
    }

    public void work(){
        try {
            DeviceProvider.getInstance().runTimeFactory();
        } catch (Exception e) {
            log.error("DeviceHelpJob Exception:"+e);
        }
    }
}
