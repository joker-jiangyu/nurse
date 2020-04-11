package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.DevControlProvider;
import nurse.logic.providers.RealDataProvider;
import nurse.logic.providers.UserOperationLogProviders;
import nurse.utility.DoorGovernHelper;

public class DevControlDataHandler extends DataHandlerBase {
	private static final String SendControl = "sendControl";
	private static final String SendControlLinkage = "sendControlLinkage";
	
	public DevControlDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DevControlDataHandler.SendControl)){
			rep.responseResult = HandleSendControl(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DevControlDataHandler.SendControlLinkage)){
			rep.responseResult = HandleSendControlLinkage(req.requestParams, inetIp);
		}
	}
		
		private String HandleSendControl(String requestParams, String inetIp) {
			String result="success";
			 try {
				String[] paras = requestParams.split("\\|");
				if(paras.length == 0 || paras[0].equals("undefined")) return "danger";

				int deviceId = Integer.parseInt(paras[0]);
				int baseTypeId = Integer.parseInt(paras[1]);
				String parameterValue = paras[2];
				String userName = paras[3];
				/*String pwd = paras[4];
				boolean isLogin = DevControlProvider.getInstance().checkLogin(userName,
						MD5Helper.GetMD5Code(pwd));
				if(!isLogin)
					result = "danger|密码不正确！";
				else{*/
				
					if(DoorGovernHelper.getInstance().isDoorControl(String.valueOf(deviceId)) && baseTypeId == 1001010001){
						String EquipmentId = String.valueOf(deviceId);
						String BaseTypeId = String.valueOf(baseTypeId);
						String[] values = new String[]{"{DoorNo:"+parameterValue+"}"};
						if(!DoorGovernHelper.getInstance().SendDoorControl("RemoteOpenDoor",EquipmentId, userName, 
								BaseTypeId, parameterValue,values).equals("OK")){
							result = "danger";
						}
					}else{
						if(ActiveSignalDataHandler.proxy==null) 
							ActiveSignalDataHandler.proxy = new RealDataProvider();
						for(int i=0;i<3;i++){
							ActiveSignalDataHandler.proxy.GetData(8888);
						}
						
						if(!DevControlProvider.getInstance().SendControl(deviceId, baseTypeId, parameterValue, userName)){
							result = "danger";
						}
					}
					//用户操作日志
					UserOperationLogProviders.getInstance().insertUserOperationLog(50, userName, inetIp, String.valueOf(deviceId),
							String.valueOf(baseTypeId), parameterValue, null, "");
				//}
			 }
			 catch(Exception e1) {
				e1.printStackTrace();
				result = "danger";
			 }
			return 	result;
		}

		private String HandleSendControlLinkage(String requestParams, String inetIp){
			//requestParams => userName+delay1|deviceId1|baseTypeId1|parameterValue1&...
			//System.out.println("loginId:"+inetIp+", requestParams:"+requestParams);
			return DevControlProvider.getInstance().SendControlCinkage(requestParams,inetIp);
		}
		
	}









