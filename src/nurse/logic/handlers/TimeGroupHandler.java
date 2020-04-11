package nurse.logic.handlers;


import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.TimeGroupProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class TimeGroupHandler extends DataHandlerBase{
	private static final String GETTIMEGROUPLIST = "getTimeGroupList";
	private static final String GETTIMEGROUPTYPE = "getTimeGroupType";
	private static final String INSERTTIMEGROUP = "insertTimeGroup";
	private static final String UPDATETIMEGROUP = "updateTimeGroup";
	private static final String DELETETIMEGROUP = "deleteTimeGroup";
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TimeGroupHandler.GETTIMEGROUPLIST)){
			rep.responseResult = HandlerGetTimeGroupList();
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TimeGroupHandler.GETTIMEGROUPTYPE)){
			rep.responseResult = HandlerGetTimeGroupType();
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TimeGroupHandler.INSERTTIMEGROUP)){
			rep.responseResult = HandlerInsertTimeGroup(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TimeGroupHandler.UPDATETIMEGROUP)){
			rep.responseResult = HandlerUpdateTimeGroup(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TimeGroupHandler.DELETETIMEGROUP)){
			rep.responseResult = HandlerDeleteTimeGroup(req.requestParams);
		}
	}
	
	private String HandlerGetTimeGroupList(){
		return JsonHelper.ListjsonString("ret", TimeGroupProvider.getInstance().getTimeGroupList());
	}
	
	private String HandlerGetTimeGroupType(){
		return JsonHelper.ListjsonString("ret", TimeGroupProvider.getInstance().getTimeGroupType());
	}
	
	private String HandlerInsertTimeGroup(String requestParams){
		// requestParams => TimeGroupName
		String timeGroupName = Base64Helper.decode(requestParams);
		if(TimeGroupProvider.getInstance().insertTimeGroup(timeGroupName))
			return "SUCCEED";
		else
			return "FAILURE";
	}
	
	private String HandlerUpdateTimeGroup(String requestParams){
		// requestParams => TimeGroupId|TimeGroupName|TimeSpanId1&TimeSpanChar1-TimeSpanId2&TimeSpanChar2-...
		String info = Base64Helper.decode(requestParams);
		String[] split = info.split("\\|");
		String timeGroupId = split[0];
		String timeGroupName = split[1];
		String timeSpanStr = split[2];
		
		//下发命令
		//RealDataProvider();
		String result = TimeGroupProvider.getInstance().initTimeGroupCommand(null,timeGroupId,"FF",timeSpanStr);
		if(!result.equals("OK")) return result;
		
		if(TimeGroupProvider.getInstance().updateTimeGroup(timeGroupId,timeGroupName))
			return "SUCCEED";
		else
			return "FAILURE";
	}
	
	private String HandlerDeleteTimeGroup(String requestParams){
		// requestParams => TimeGroupId
		if(TimeGroupProvider.getInstance().deleteTimeGroup(requestParams))
			return "SUCCEED";
		else
			return "FAILURE";
	}
}
