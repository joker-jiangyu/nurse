package nurse.logic.handlers;


import java.util.ArrayList;

import nurse.entity.persist.UserOperationLog;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.UserOperationLogProviders;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class UserOperationLogDataHandler extends DataHandlerBase{
	private static final String GETUSEROPERATIONLOG = "getUserOperationLog";
	private static final String GETLIKEUSEROPERATIONLOG = "getLikeUserOperationLog";
	private static final String GETUSEROPERATIONLOGTOTAL = "getUserOperationLogTotal";
	private static final String GETOPERATIONTYPE = "getOperationType";

	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserOperationLogDataHandler.GETUSEROPERATIONLOG)) {
			rep.responseResult = handleGetUserOperationLog(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserOperationLogDataHandler.GETLIKEUSEROPERATIONLOG)) {
			rep.responseResult = handleGetLikeUserOperationLog(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserOperationLogDataHandler.GETUSEROPERATIONLOGTOTAL)) {
			rep.responseResult = handleGetUserOperationLogTotal(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UserOperationLogDataHandler.GETOPERATIONTYPE)) {
			rep.responseResult = handleGetOperationType();
		}
	}
	
	private String handleGetUserOperationLog(String requestParams){
		//requestParams => startTime|endTime
		String[] ss = Base64Helper.decode(requestParams).split("\\|");

		String startTime = ss[0];
		String endTime = ss[1];
		
		
		ArrayList<UserOperationLog> list = UserOperationLogProviders.getInstance().getUserOperationLog(startTime,endTime);
		return UserOperationLog.parseUserOperationLog(list);
	}

	private String handleGetLikeUserOperationLog(String requestParams){
		//requestParams => index|size|startTime|endTime|logonId|ip|content
		String[] ss = Base64Helper.decode(requestParams).split("\\|");
		
		int index = Integer.parseInt(ss[0]);
		int size = Integer.parseInt(ss[1]);
		String startTime = ss[2];
		String endTime = ss[3];
		String logonId = ss.length > 4 ? ss[4] : "";
		String ip = ss.length > 5 ? ss[5] : "";
		String content = ss.length > 6 ? ss[6] : "";
		
		
		ArrayList<UserOperationLog> list = UserOperationLogProviders.getInstance().getLikeUserOperationLog(index,size,startTime,endTime,logonId,ip,content);
		return UserOperationLog.parseUserOperationLog(list);
	}
	
	private String handleGetUserOperationLogTotal(String requestParams){
		//requestParams => startTime|endTime|logonId|ip|content
		String[] ss = Base64Helper.decode(requestParams).split("\\|");

		String startTime = ss[0];
		String endTime = ss[1];
		String logonId = ss.length > 2 ? ss[2] : "";
		String ip = ss.length > 3 ? ss[3] : "";
		String content = ss.length > 4 ? ss[4] : "";
		
		int total = UserOperationLogProviders.getInstance().getUserOperationLogTotal(startTime,endTime,logonId,ip,content);
		return String.valueOf(total);
	}

	private String handleGetOperationType(){
		return JsonHelper.ListjsonString("ret", UserOperationLogProviders.getInstance().getOperationList());
	}
}
