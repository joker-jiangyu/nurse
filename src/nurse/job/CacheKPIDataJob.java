package nurse.job;

import org.apache.log4j.Logger;

import nurse.logic.providers.KPIBagProvider;


public class CacheKPIDataJob extends NurseJob {
	private static Logger log = Logger.getLogger(CacheHistorySignalJob.class);
	
	public CacheKPIDataJob(long delay, long period) {
		super(delay, period);
	}
	
	public void work(){
		try {
			//缓存web/data/KPI*.xml文件的SQL数据
			KPIBagProvider.getInstance().factory();
		} catch (Exception e) {
			log.error("CacheKPIDataJob Exception:"+e);
		}
	}
}