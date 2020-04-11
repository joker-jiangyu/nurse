package nurse.logic.handlers;

import nurse.NurseApp;
import nurse.entity.persist.Account;
import nurse.entity.persist.LoginUser;
import nurse.entity.persist.UserOperationLog;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.UserOperationLogProviders;
import nurse.logic.providers.UserProvider;
import nurse.utility.*;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;


public class UserDataHandler extends DataHandlerBase {

	private static Logger log = Logger.getLogger(NurseApp.class);
	private static boolean isCheckLogin=false; 
	
	private static final String Login = "login";
	private static final String ChangePassword = "changePassword";
	private static final String IsLogin = "isLogin";
	private static final String Logout = "logout";
	private static final String UpdatePassword = "updatePassword";
	private static final String GetTitleAndLogo = "getTitleAndLogo";
	private static final String EditTitleAndLogo = "editTitleAndLogo";
	private static final String GetAllAccount = "getAllAccount";
	private static final String UpdateAccount = "updateAccount";
	private static final String InsertAccount = "insertAccount";
	private static final String DeleteAccount = "deleteAccount";
	private static final String GetQRCode = "getQRCode";
	private static final String SetQRCode = "setQRCode";
	private static final String NeedLogin = "needLogin";
	private static final String GetMaxError = "getMaxError";
	private static final String SettingLogin = "settingLogin";

	
	private Date loginTime;
	
	public UserDataHandler() {
	}

	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.Login)) {
			rep.responseResult = handleLogin(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.ChangePassword)) {
			rep.responseResult = handleChangePassword(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.IsLogin)) {
			rep.responseResult = handleIsLogin(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.Logout)) {
			rep.responseResult = handleLogout(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.UpdatePassword)) {
			rep.responseResult = handlePassword(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.GetTitleAndLogo)) {
			rep.responseResult = handleGetTitleAndLogo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.EditTitleAndLogo)) {
			rep.responseResult = handleEditTitleAndLogo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.GetAllAccount)) {
			rep.responseResult = handleGetAllAccount(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.UpdateAccount)) {
			rep.responseResult = handleUpdateAccount(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.InsertAccount)) {
			rep.responseResult = handleInsertAccount(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.DeleteAccount)) {
			rep.responseResult = handleDeleteAccount(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.GetQRCode)) {
			rep.responseResult = handleGetQRCode(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.SetQRCode)) {
			rep.responseResult = handleSetQRCode(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.NeedLogin)) {
			rep.responseResult = handleNeedLogin(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.GetMaxError)) {
			rep.responseResult = handleGetMaxError();
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserDataHandler.SettingLogin)) {
			rep.responseResult = handleSettingLogin(req.requestParams);
		}
	}

	/**
	 * 设置登入页面样式
	 * @param requestParams
	 */
	private String handleSettingLogin(String requestParams){
		JSONObject req = new JSONObject(requestParams);


		String pageBg = req.getString("pageBg");
		String infoBg = req.getString("infoBg");
		String modalPosition = req.getString("modalPosition");

		// 成功返回 success 失败则返回 error 或者 only upload dir's file can be deleted
		String str = UserOperationLogProviders.getInstance().settingLogin(pageBg,infoBg,modalPosition);

		return str;
	}

	private String handleEditTitleAndLogo(String requestParams) {
		String[] ss = requestParams.split("\\|");
		String res =  MainConfigHelper.editLabelContent(ss[0], ss[1]);
		MainConfigHelper.loadConfigs();
		return res;
	}

	private String handleGetTitleAndLogo(String requestParams) {
		String para = Base64Helper.decode(requestParams);
		String[] ss = para.split("\\|");
		return MainConfigHelper.getLabelContent(ss[0])+"|"+ MainConfigHelper.getLabelContent(ss[1]);
	}

	private void CheckLogined(){
	 
		  isCheckLogin=true;
		  Timer timer = new Timer();
	        timer.scheduleAtFixedRate(new TimerTask() {
	            public void run() {
	            	if(users==null) return;
					for(int i = 0;i<users.size();i++){
					Date now = new Date();
					long minute = (now.getTime()-users.get(i).LastedTime.getTime())/1000/60;
					if(minute > 3) users.remove(i);
	            	}
				log.debug( "-------- Clear unlive user, total:"+users.size()+"----------------" );
	            }
	        }, 10000, 300000);		
	}
	

	private String handlePassword(String requestParams) {
		
		String[] ss = requestParams.split("\\|");
		if(ss.length != 3) return "Parameter Error";//参数错误
		ss[1] = MD5Helper.GetMD5Code(ss[1]);
		ss[2] = MD5Helper.GetMD5Code(ss[2]);
		
		try{
			if (!UserProvider.getInstance().IsUser(ss[0], ss[1]))
				return "Current Password Incorrect";//当前密码不正确
		}catch(Exception e){
			return "DataBase Connection Failed";//数据库连接失败
		}
		
		if(!UserProvider.getInstance().UpdatePassword(ss[0], ss[2]))
			return "Modify Failed";//修改异常
		
		return "OK";
	}

	private String handleLogout(String requestParams,String inetIp) {

		if(users==null) return "OK";
		String userName = "";
		for(int i = 0;i<users.size();i++){
			if(users.get(i).UserToken.equals(requestParams)){
				userName = users.get(i).UserName;
				users.remove(i);	
			}
		}	
		//用户操作日志
		UserOperationLogProviders.getInstance().insertUserOperationLog(48, userName, inetIp, null, null, "", null, "");
		return "OK";
	}

	private String handleIsLogin(String requestParams) {
		//免登陆
		if(!isNeedLogin()) return "TRUE";
		
		if(users==null || requestParams=="") return "FALSE";
		Date now = new Date();
		for(int i=0;i<users.size();i++){
			
			if(users.get(i).UserToken.equals(requestParams)){
				users.get(i).LastedTime = now;
				return "TRUE";
			}		
		}			
				
		return "FALSE";		
	}
	
	private String handleLogin(String requestParams, String inetIp) {
		
		if(users==null) 
			users= new ArrayList<LoginUser>();
		
		if(!isCheckLogin) CheckLogined();

		if (requestParams.equals("fA==")) return "Username And Password Not Entered";//未输入帐户和密码
		String para = Base64Helper.decode(requestParams);
		String[] ss = para.split("\\|");
		if (ss.length != 2) return "Enter Username And Password Error";//输入帐户和密码错误

		try{
			ss[1]= MD5Helper.GetMD5Code(ss[1]);
			if(UserProvider.getInstance().IsUser(ss[0], ss[1])){
				if(!UserProvider.getInstance().judgeTimeout(ss[0])) return "Overdue";	//过期的用户

				loginTime = new Date();
				UUID guid = UUID.randomUUID();   
				LoginUser user=new LoginUser();
				user.UserName=ss[0];
				user.LastedTime= loginTime;
				user.LoginTime=loginTime;
				user.UserToken=guid.toString();
				users.add(user);
				String loginPath = MainConfigHelper.getConfig().loginPage;
				boolean isAdmin = UserProvider.getInstance().getIsAdmin(ss[0]);	//是否是Admin
				String loginHome = MainConfigHelper.getConfig().loginHome;
				String systemStyle = MainConfigHelper.getConfig().systemStyle;
				//获取上一次登入记录
				UserOperationLog userOper = UserProvider.getInstance().getLastLoginTime(ss[0]);
				String loginDate = null;
				String loginIP = null;
				if(userOper != null){
					loginDate = BaseEntity.toTimeString(userOper.StartTime);
					loginIP = userOper.IpAddress;
				}
				//登出时间
				String logoutTime = MainConfigHelper.getConfig().logoutTime;
				//用户操作日志
				UserOperationLogProviders.getInstance().insertUserOperationLog(47, ss[0], inetIp, null, null, "", null, "");
				UserProvider.getInstance().resetMaxError();	//重置 maxError
				return "OK|"+guid.toString()+"|"+loginPath+"|"+isAdmin+"|"+loginHome+"|"+systemStyle+"|"+loginDate+"|"+loginIP+"|"+logoutTime;
			}else{
				String errPwd = "Password:"+para.split("\\|")[1];
				UserOperationLogProviders.getInstance().insertUserOperationLog(77, ss[0], inetIp, null, null, "", null, errPwd);
				//是否存在该用户
				if(!UserProvider.getInstance().judgeTimeout(ss[0])) return "Overdue";	//过期的用户
				boolean isExist = UserProvider.getInstance().isExist(ss[0]);
				if(isExist) {
					// 用户 的 maxError+1 并返回当前用户的 maxError
					Integer num = UserProvider.getInstance().incrMaxError(ss[0]);
					return "Password Error|"+num;//密码错误
				}
			}
		}catch (Exception e){
			log.error("handleLogin Exception:",e);
			return "DataBase Connection Failed";//数据库连接失败
		}
		return "Password Error";//密码错误
	}
	
	private String handleChangePassword(String requestParams) {
		String para = Base64Helper.decode(requestParams);
		String[] ss = para.split("\\|");
		ss[1] = MD5Helper.GetMD5Code(ss[1]);
		if(UserProvider.getInstance().IsUser(ss[0], ss[1]))
			return "OK";
		else 
			return "NO";
	}	
	
	private String handleGetAllAccount(String requestParams){
		return JsonHelper.ListjsonString("ret", UserProvider.getInstance().getAllAccout());
	}
	
	private String handleUpdateAccount(String requestParams){
		// requestParams => userId|userName|loginId|isRemote
		String para = Base64Helper.decode(requestParams);
		String[] split = para.split("\\|");
		Account acc = new Account();
		acc.userId = Integer.parseInt(split[0]);
		acc.userName = split[1];
		acc.logonId = split[2];
		acc.isAdmin = Boolean.parseBoolean(split[3]);
		acc.validTime = split.length > 4 ? split[4] : "";
		acc.password = split.length > 5 ? split[5] : null;
		String oldPassword = split.length > 6 ? split[6] : null;
		//判断当前密码与加密的原密码是否相同
		if(acc.password != null && oldPassword != null && !acc.password.equals(oldPassword))
			acc.password = MD5Helper.GetMD5Code(acc.password);
		else
			acc.password = null;
		
		if(UserProvider.getInstance().updateAccount(acc))
			return "OK";
		else
			return "ERROR";
	}
	
	private String handleInsertAccount(String requestParams){
		// requestParams => userName|loginId|password|isRemote
		String para = Base64Helper.decode(requestParams);
		String[] split = para.split("\\|");
		Account acc = new Account();
		acc.userName = split[0];
		acc.logonId = split[1];
		acc.password = MD5Helper.GetMD5Code(split[2]);
		acc.isAdmin = Boolean.parseBoolean(split[3]);
		acc.validTime = split.length > 4 ? split[4] : "";
		
		if(UserProvider.getInstance().insertAccount(acc))
			return "OK";
		else
			return "ERROR";
	}
	
	private String handleDeleteAccount(String requestParams){
		// requestParams => userId
		if(UserProvider.getInstance().deleteAccount(requestParams))
			return "OK";
		else
			return "ERROR";
	}

	private String handleGetQRCode(String requestParams){
		String result = Base64Helper.encode(MainConfigHelper.getConfig().QRCodeTitle+"|"+ MainConfigHelper.getConfig().QRCodeImage);
		return result;
	}

	private String handleSetQRCode(String requestParams){
		//QRCodeTitle|QRCodeImage
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		String title = split.length >= 1 ? split[0] : "";
		String image = split.length >= 2 ? split[1] : "";
		MainConfigHelper.editLabelContent("QRCodeTitle", title);
		MainConfigHelper.editLabelContent("QRCodeImage", image);
		MainConfigHelper.loadConfigs();
		return "OK";
	}

	private String handleNeedLogin(String requestParams){
		//需要登录返回true，不需要返回 版本|是否管理员|自定义首页
		if(isNeedLogin()) return "TRUE";

		String userName = MainConfigHelper.getConfig().loginUserName;
		String loginPath = MainConfigHelper.getConfig().loginPage;
		boolean isAdmin = UserProvider.getInstance().getIsAdmin(userName);
		String loginHome = MainConfigHelper.getConfig().loginHome;
		String systemStyle = MainConfigHelper.getConfig().systemStyle;

		return loginPath+"|"+isAdmin+"|"+loginHome+"|"+systemStyle+"|"+userName;
	}

	/** 是否免登陆 true:需要登录  false:不需要登录*/
	private boolean isNeedLogin(){
		//使用配置登录
		if(users==null)
			users= new ArrayList<LoginUser>();

		if(!isCheckLogin) CheckLogined();

		String userName = MainConfigHelper.getConfig().loginUserName;
		String password = MainConfigHelper.getConfig().loginPassword;

		if(password == null || password.equals("")) return true;

		try{
			password= MD5Helper.GetMD5Code(password);
			if(UserProvider.getInstance().IsUser(userName, password))
			{
				loginTime = new Date();
				UUID guid = UUID.randomUUID();
				LoginUser user = new LoginUser();
				user.UserName = userName;
				user.LastedTime = loginTime;
				user.LoginTime = loginTime;
				user.UserToken = guid.toString();
				users.add(user);

				//用户操作日志
				//UserOperationLogProviders.getInstance().insertUserOperationLog(47, userName, "127.0.0.1", null, null, "", null, "");
				return false;
			}
			return true;
		}catch (Exception e){
			System.out.println("DataBase Connection Failed");//数据库连接失败
			return true;
		}
	}
	//获取用户中 maxError 的 最大值
	private String handleGetMaxError() {
		String maxError = UserProvider.getInstance().getTheMostMaxError();
		return maxError;
	}
}
