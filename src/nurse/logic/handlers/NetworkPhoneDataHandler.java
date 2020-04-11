package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.NetworkPhoneProvider;
import nurse.utility.JsonHelper;

public class NetworkPhoneDataHandler extends DataHandlerBase {
	
	private static final String GetNetworkPhoneInfo = "GetNetworkPhoneInfo";
	private static final String UpdateNetworkPhone = "UpdateNetworkPhone";
	
	public NetworkPhoneDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(NetworkPhoneDataHandler.GetNetworkPhoneInfo))
		{
			rep.responseResult = HandlerGetNetworkPhoneInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(NetworkPhoneDataHandler.UpdateNetworkPhone))
		{
			rep.responseResult = HandlerUpdateNetworkPhone(req.requestParams);
		}
	}

	private String HandlerGetNetworkPhoneInfo(String requestParams) {
		return JsonHelper.ListjsonString("ret", NetworkPhoneProvider.getInstance().getNetworkPhoneInfo());
	}

	private String HandlerUpdateNetworkPhone(String requestParams) {
		//requestParams => IP|Type|TextFormat|Enable|TimeType|TimeRegularly
		String[] result = requestParams.split("\\|");
		String nPIp = result[0];
		int nPPort = Integer.parseInt(result[1]);
		String type = result[2];
		String textFormat = result[3];
		boolean enable = Boolean.valueOf(result[4]);
		String timeType = result[5];
		String timeRegularly = result.length > 6 ? result[6] : "";
		
		if(NetworkPhoneProvider.getInstance().updateNetworkPhone(nPIp, nPPort, type,textFormat, enable, timeType, timeRegularly)) {
			return "OK";
		}
		return "NO";
	}
}
