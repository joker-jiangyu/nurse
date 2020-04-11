package nurse.logic.handlers;




import java.util.Properties;

import nurse.utility.MainConfigHelper;
import org.apache.log4j.Logger;

import nurse.NurseApp;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.SystemSettingProvider;

public class IpDataHandler extends DataHandlerBase {

	private static final String GETSYSTEMIP = "getSystemIp";
	private static final String SAVEIP = "saveIp";
	private static String os = null;//保存当前系统类型

	private static Logger log = Logger.getLogger(IpDataHandler.class);
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
	
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(IpDataHandler.GETSYSTEMIP))
		{
			rep.responseResult = handleGetSystemIp(req.requestParams);
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(IpDataHandler.SAVEIP))
		{
			rep.responseResult = handleSaveIp(req.requestParams);
		}
	}
	
	private static String handleGetSystemIp(String requestParams){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}
		//"/sbin/ifconfig eth0 | grep 'inet addr' | awk '{ print $2}' | awk -F: '{print $2}'"
		String[] cmd_date = new String[]{"/bin/sh", "-c",
				"cat /home/utils/ipaddr | grep '/sbin/ifconfig eth0' | awk ' {print $3}' | awk 'NR==1{print}'"};
		String ip = SystemSettingProvider.getInstance().getSystemData(cmd_date);//IP
		//"/sbin/ifconfig eth0 | grep 'inet addr' | awk '{ print $4}' | awk -F: '{print $2}'"
		String[] cmd_date1 = new String[]{"/bin/sh","-c",
				"cat /home/utils/ipaddr | grep '/sbin/ifconfig eth0 netmask' | awk '{print $4}' | awk 'NR==1{print}'"};
		String netmask = SystemSettingProvider.getInstance().getSystemData(cmd_date1);//掩码
		//"/sbin/route | grep 'default' | awk '{print $2}'"
		String[] cmd_date2 = new String[]{"/bin/sh","-c",
				"cat /home/utils/ipaddr | grep '/sbin/route add default gw' | awk '{print $5}' | awk 'NR==1{print}'"};
		String defaultGw = SystemSettingProvider.getInstance().getSystemData(cmd_date2);//网关
		//ip|掩码|网关
		return String.format("%s|%s|%s", ip,netmask,defaultGw);
	}
	/**
	 * 
	 * @param requestParams ip|掩码|网关
	 * @return
	 */
	private String handleSaveIp(String requestParams){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}
		
		String[] strs = requestParams.split("\\|");
		//修改/home/utils/ipaddr文件
		SystemSettingProvider.getInstance().updateIpaddr(strs[0],strs[1],strs[2]);

		//重启IView自带的游览器
		String loginPage = MainConfigHelper.getConfig().loginPage;
		if(loginPage.equals("IView"))
			SystemSettingProvider.getInstance().restartIViewBrowser(strs[0]);


		//修改IP地址 修改掩码
		String[] cmd_date1 = new String[]{"/bin/sh", "-c","/sbin/ifconfig eth0 "+strs[0]+" netmask "+strs[1]};
		SystemSettingProvider.getInstance().updateSystemSetting(cmd_date1);
		//删除原网关
		String[] cmd_date6 = new String[]{"/bin/sh", "-c","/sbin/route del default"};
		SystemSettingProvider.getInstance().updateSystemSetting(cmd_date6);
		//添加网关
		String[] cmd_date4 = new String[]{"/bin/sh", "-c","/sbin/route add default gw "+strs[2]};
		SystemSettingProvider.getInstance().updateSystemSetting(cmd_date4);
		//重启java服务
		/*String[] cmd_date3 = new String[]{"/bin/sh", "-c","/home/app/restart_nurse.sh"};
		SystemSettingProvider.getInstance().updateSystemSetting(cmd_date3);*/

		//iView版本，修改IP后重启iView
		if(MainConfigHelper.getConfig().loginPage.equals("IView")){
			return SystemSettingProvider.getInstance().reboot();
		}
		
		//停止Nurse服务
		NurseApp.webServer.stop();
		//重启Nurse服务
		NurseApp.startWebServer();

		log.info("Update IP:"+strs[0]+" Success!");
		//注销看门狗
		//SdogProvider.getInstance().unregister();
		return "OK";
	}
}
