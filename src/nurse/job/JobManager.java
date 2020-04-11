package nurse.job;

import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;

import nurse.entity.conf.FeatureConfig;
import nurse.entity.persist.IntervalClearData;
import nurse.logic.providers.HistoryDataClearProviders;
import nurse.utility.MainConfigHelper;

public class JobManager {
	private static ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
	private ArrayList<NurseJob> jobs = new ArrayList<NurseJob>();
	
	private static Logger log = Logger.getLogger(JobManager.class);
	
	private static JobManager instance = new JobManager();

	public static JobManager getInstance() {
		return instance;
	}
	
	public void start(){
		register();
		
		for(NurseJob job : jobs){
			scheduler.scheduleAtFixedRate(job.getRunner(), job.delay, job.period, TimeUnit.SECONDS);
		}
	}
	
	public void restart(){
		log.info("Restart JobManger! Job Size:"+this.jobs.size());
		jobs = new ArrayList<NurseJob>();
		scheduler.shutdown();
		if(scheduler.isShutdown()){
			scheduler = Executors.newScheduledThreadPool(1);
			start();
		}
	}
	
	private void addJob(NurseJob job){
		jobs.add(job);
	}
	
	//add jobs here
	private void register(){
		ArrayList<FeatureConfig> features = MainConfigHelper.getFeatureConfig();
		//addJob(new ClearAlarmChangeJob(38400,38400));
		//addJob(new ClearHistoryAlarmJob(76800,76800));
		//addJob(new ClearHistorySignalJob(115200,115200));
		
		//定时执行开启状态的数据管理
		ArrayList<IntervalClearData> icds = HistoryDataClearProviders.getInstance().getAllIntervalClearData();
		for(IntervalClearData icd : icds){
			if(icd.status == 1)
				addJob(new ClearHistoryDataJob(icd.name, icd.clearObject, icd.delay, icd.period, icd.storageDays, icd.storageCols, icd.status));
		}
		//修改为根据“自诊断设备”的硬盘占用率判断是否执行，而不是定时判断（具体请看HardDiskMonitorProvider）
		//addJob(new TimedQueryDiskJob(43200,86400));//当数据库占磁盘内存80%及以上时，强制执行关闭状态的数据管理

		addJob(new KillConnectionJob(30, 600));
		
		addJob(new MailboxAlarmJob(15,3));//启动邮箱告警定时器 每3秒执行一次
		addJob(new NetworkPhoneJob(20,3));//启动网络电话定时器 3s/次
		addJob(new InsertmPueRecordJob(60,60*60));//定时新增PueRecord表的数据
		addJob(new ClearHistoryControlJob(25, 60));//移除遥控命令
		
		addJob(new CacheHistorySignalJob(3, 60*60*3));//缓存历史数据
		
		addJob(new LicenseJob(5,60*60*2));//License
		
		addJob(new CacheKPIDataJob(35, 60*60*3));// 缓存KPI图表
		
		if(FeatureConfig.getFeatureShow(features,"AssetsRack"))
			addJob(new RackAssetsJob(30, 60));// U位管理

		addJob(new CheckMySQLJob(40, 60*60));//定时修复MySQL

		addJob(new DeviceHelpJob(120,60*60*6));//每天定时给设备累加运行日期
	}
}
