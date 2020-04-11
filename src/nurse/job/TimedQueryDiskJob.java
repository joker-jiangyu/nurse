package nurse.job;

import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;

import org.apache.log4j.Logger;

import nurse.entity.persist.IntervalClearData;
import nurse.logic.providers.HistoryDataClearProviders;
import nurse.logic.providers.SystemSettingProvider;
import nurse.utility.DatabaseHelper;

public class TimedQueryDiskJob extends NurseJob {
	private static Logger log = Logger.getLogger(TimedQueryDiskJob.class);
	private static String os = null;//保存当前系统类型
	
	public TimedQueryDiskJob(long delay, long period) {
		super(delay, period);
	}
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
    
    /**
     * 获取Linux系统下的磁盘使用大小
     * @param path 目录 /home/app/mysql 只返回一个值
     * @return 
     */
    public double getDiskUsedPer(String path) {
    	//  ./bin/df -h /home/app/mysql | grep 'mysql' | awk '{print $5}' => Used%
    	if(!os.equals("Linux") && !os.equals("linux")){
			return 0;
		}
		try {
			String[] cmd_date = new String[]{"/bin/sh", "-c",
				"/bin/df -h "+path+" | awk 'NR==2{print}' | awk '{print $5}'"};
			String used = SystemSettingProvider.getInstance().getSystemData(cmd_date);//Used%
			return Double.parseDouble(used.replaceAll("[\\%]", ""));
		} catch (Exception e) {
			return 0;
		}
    }
    
    public void removeObjectByPath(String ObjectName,String path){
    	if(!os.equals("Linux") && !os.equals("linux")){
			return;
		}
		try {
			String[] cmd_date = new String[]{"/bin/sh", "-c",
				"/bin/rm "+path+"/"+ObjectName};
			SystemSettingProvider.getInstance().getSystemData(cmd_date);
			log.info("Remove Command:"+path+"/"+ObjectName);
		} catch (Exception e) {}
    }
    
	public void work(){
		try {
			double used = getDiskUsedPer("/home/app/mysql");
			log.info("Current Use Disk Pre:"+used+"% Date:"+(new Date()).toString());
			if(used >= 80){
				ArrayList<IntervalClearData> icds = HistoryDataClearProviders.getInstance().getAllIntervalClearData();
				for(IntervalClearData icd : icds){
					if(icd.status == 0)
						clearHistoryData(icd.clearObject,icd.storageCols,icd.storageDays);
				}
				removeObjectByPath("mysql-bin.*","/home/app/mysql/var/lib/mysql");
			}
		} catch (Exception e) {
			log.error("TimedQueryDiskJob Exception:"+e);
		}
	}
	
	public void clearHistoryData(String clearObject,String storageCols,int storageDays){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "";
            
            if(clearObject.indexOf("[") != -1 && clearObject.indexOf("]") != -1){
            	int index1 = clearObject.indexOf("[");
            	int index2 = clearObject.indexOf("]");
            	int index3 = clearObject.indexOf("-");
            	int startNum = Integer.parseInt(clearObject.substring(index1+1, index3));
            	int endNum = Integer.parseInt(clearObject.substring(index3+1, index2));
            	String table = clearObject.substring(0,index1);
            	
            	for(int i = startNum;i <= endNum;i++){
            		sql = String.format("DELETE FROM %s%s where %s < NOW() - INTERVAL %s DAY;",
            				table,i,storageCols,storageDays);   
                    int number = dbHelper.executeNoQuery(sql);  
                    /****************************************************************/
                    log.info("Clear History Data Size:"+number+" \nSQL:"+sql);
                    /****************************************************************/
            	}
            }else{
            	sql = String.format("DELETE FROM %s where %s < NOW() - INTERVAL %s DAY;",
        				clearObject, storageCols, storageDays);  
            	int number = dbHelper.executeNoQuery(sql);          
                /****************************************************************/
                log.info("Clear History Data Size:"+number+" \nSQL:"+sql);
                /****************************************************************/          
            }
		} catch (Exception e) {
			log.error("fail to clear alarm change table", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
