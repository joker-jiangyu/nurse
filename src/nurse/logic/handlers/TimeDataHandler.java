package nurse.logic.handlers;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.LicenseProvider;
import nurse.logic.providers.SystemSettingProvider;
import nurse.utility.DatabaseHelper;

public class TimeDataHandler extends DataHandlerBase {
	
	private static Logger log = Logger.getLogger(TimeDataHandler.class);
	private static final String GetSystemTime = "getSystemTime";
	private static final String DATETIMETIMING = "dateTimeTiming";
	private static String os = null;//保存当前系统类型
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TimeDataHandler.GetSystemTime))
		{
			rep.responseResult = handleGetSystemTime(req.requestParams);
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(TimeDataHandler.DATETIMETIMING))
		{
			rep.responseResult = handleDateTimeTiming(req.requestParams);
		}
		
	}

	private String handleGetSystemTime(String requestParams) {

		//Date d = new Date();
		//return String.valueOf(d.getTime());
		DatabaseHelper dbHelper = null;
		
        try
        {
        	String ts = "2018-01-01 00:00:00";
    		if(!os.equals("Linux") && !os.equals("linux")){
                dbHelper = new DatabaseHelper();      
                
                DataTable dt = dbHelper.executeToTable("SELECT UTC_DATE(),UTC_TIME;");
                String date = dt.getRows().get(0).getValueAsString(0);
                String time = dt.getRows().get(0).getValueAsString(1);

                ts = date + " " + time;
    		}else{
    			String[] cmd_date = new String[]{"/bin/sh", "-c","/bin/date '+%Y-%m-%d %H:%M:%S'"};
    			ts = SystemSettingProvider.getInstance().getSystemData(cmd_date);
    		}
            
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            Date curdate = sdf.parse(ts);
            return String.valueOf(curdate.getTime());
            
		} catch (Exception e) {
			log.error("fail to read datetime", e);	
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		
        return null;
		
        
	}
	
	private String handleDateTimeTiming(String requestParams){
		//校时触发，删除FactorStat文件，生成最新的NurseInfo 
		LicenseProvider.getInstance().initLicense(requestParams);
		
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}
		//修改系统时间
		String[] cmd_date1 = new String[]{"/bin/sh", "-c","/bin/date -s '"+requestParams+"'"};
		SystemSettingProvider.getInstance().updateSystemSetting(cmd_date1);
		//同步硬盘时间
		String[] cmd_date2 = new String[]{"/bin/sh", "-c","/sbin/hwclock -w"};
		return SystemSettingProvider.getInstance().updateSystemSetting(cmd_date2);
	}
}
