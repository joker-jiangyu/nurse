package nurse.logic.handlers;

import java.util.ArrayList;

import nurse.entity.conf.FeatureConfig;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.LicenseProvider;
import nurse.logic.providers.SystemSettingProvider;
import nurse.logic.providers.UserOperationLogProviders;
import nurse.logic.providers.UserProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;
import nurse.utility.MD5Helper;
import nurse.utility.MainConfigHelper;

public class SystemSettingDataHandler extends DataHandlerBase {

	private static final String loadFeatures = "loadFeatures";
	private static final String shutdown = "shutdown";
	private static final String reboot = "reboot";
	private static final String isFactorStatFileExist = "isFactorStatFileExist";
	private static final String reset = "reset";
	private static final String browserHeartbeat = "browserHeartbeat";
	
	public SystemSettingDataHandler(){}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemSettingDataHandler.loadFeatures))
		{
			rep.responseResult = HandleLoadFeatures(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemSettingDataHandler.shutdown)){
			rep.responseResult = HandleShutdown(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemSettingDataHandler.reboot)){
			rep.responseResult = HandleReboot(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemSettingDataHandler.isFactorStatFileExist)){
			rep.responseResult = HandleIsFactorStatFileExist(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemSettingDataHandler.reset)){
			rep.responseResult = HandleReset(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemSettingDataHandler.browserHeartbeat)){
			rep.responseResult = HandleBrowserHeartbeat(req.requestParams, inetIp);
		}
	}
	
	private String HandleLoadFeatures(String requestParams){
		ArrayList<FeatureConfig> features = MainConfigHelper.getFeatureConfig();
		return JsonHelper.ListjsonString("ret", features);
	}
	
	private String HandleShutdown(String requestParams, String inetIp){
		//requestParams => loginId|password
		String para = Base64Helper.decode(requestParams);
		String[] ss = para.split("\\|");
		ss[1] = MD5Helper.GetMD5Code(ss[1]);
		if(UserProvider.getInstance().IsUser(ss[0], ss[1])){
			//用户操作日志
			UserOperationLogProviders.getInstance().insertUserOperationLog(75, ss[0], inetIp, null, null, "", null, "");
			return SystemSettingProvider.getInstance().shutdown();
		}else
			return "Password Error";
	}
	
	private String HandleReboot (String requestParams, String inetIp){
		//requestParams => loginId|password
		String para = Base64Helper.decode(requestParams);
		String[] ss = para.split("\\|");
		ss[1] = MD5Helper.GetMD5Code(ss[1]);
		if(UserProvider.getInstance().IsUser(ss[0], ss[1])){
			//用户操作日志
			UserOperationLogProviders.getInstance().insertUserOperationLog(76, ss[0], inetIp, null, null, "", null, "");
			return SystemSettingProvider.getInstance().reboot();
		}else
			return "Password Error";
	}
	
	private String HandleIsFactorStatFileExist(String requestParams){
		if(LicenseProvider.getInstance().isFactorStatFileExist())
			return "true";
		else
			return "false";
	}

	private String HandleReset(String requestParams, String inetIp){
		//requestParams => loginId|password
		String para = Base64Helper.decode(requestParams);
		String[] ss = para.split("\\|");
		ss[1] = MD5Helper.GetMD5Code(ss[1]);
		if(UserProvider.getInstance().IsUser(ss[0], ss[1])){
			//用户操作日志
			//UserOperationLogProviders.getInstance().insertUserOperationLog(76, ss[0], inetIp, null, null, "", null, "");
			return SystemSettingProvider.getInstance().reset();
		}else
			return "Password Error";
	}

	//功能：访问系统名称为Linux并且访问IP是本机IP时，注册心跳；5分钟未收到心跳调用重启浏览器命令
	private String HandleBrowserHeartbeat(String requestParams, String inetIp){
		//requestParams => 访问系统名称-心跳类型，inetIp => 访问IP
		String[] split = Base64Helper.decode(requestParams).split("\\-");
		if(split.length <= 1) return "Failure";

		return SystemSettingProvider.getInstance().browserHeartbeat(split[0],split[1],inetIp);
	}
}
