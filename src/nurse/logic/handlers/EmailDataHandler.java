package nurse.logic.handlers;

import java.util.ArrayList;

import nurse.entity.persist.EmailTiming;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.AlarmEmailProvider;
import nurse.utility.JsonHelper;

public class EmailDataHandler extends DataHandlerBase {
	private static final String GETMAILDICT = "getMailDict";
	private static final String SETMAILDICT = "setMailDict";
	private static final String GETEMAILACCOUNT = "GetEmailAccount";
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EmailDataHandler.GETMAILDICT)){
			rep.responseResult = HandleGetMailDict(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EmailDataHandler.SETMAILDICT)){
			rep.responseResult = HandleSetMailDict(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EmailDataHandler.GETEMAILACCOUNT)){
			rep.responseResult = HandleGetEmailAccount(req.requestParams);
		}
	}	
	
	private String HandleGetMailDict(String requestParams){
		return AlarmEmailProvider.getInstance().getMailDict();
	}
	
	private String HandleSetMailDict(String requestParams){
		return AlarmEmailProvider.getInstance().setMailDict(requestParams);
	}
	
	private String HandleGetEmailAccount(String requestParams){
		EmailTiming dt = AlarmEmailProvider.getInstance().GetEmailTimingInfo();
		ArrayList<EmailTiming> list = new ArrayList<EmailTiming>();
		list.add(dt);
		return JsonHelper.ListjsonString("ret", list);
	}
}
