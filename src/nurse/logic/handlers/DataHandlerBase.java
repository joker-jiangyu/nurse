package nurse.logic.handlers;

import java.util.ArrayList;

import nurse.entity.persist.LoginUser;
import nurse.entity.trasfer.HttpDataExchange;

public class DataHandlerBase {

	public static ArrayList<LoginUser> users = null;
	
	public HttpDataExchange Handle(HttpDataExchange req, String inetIp) {
		
		HttpDataExchange rep = new HttpDataExchange(req.requestCommand, req.requestParams, null);
		
		Execute(req, rep);
		Execute(req, rep, inetIp);
		return rep;
	}
	
	public String GetCommandName(String requestCommand)
	{
		int i = requestCommand.indexOf('.');
		if (i<=0) return null;
		
		return requestCommand.substring(i+1);
	}
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		
	}
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {
		
	}
}
