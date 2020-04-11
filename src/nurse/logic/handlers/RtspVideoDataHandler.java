package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.RtspVideoProviders;
import nurse.utility.JsonHelper;

public class RtspVideoDataHandler extends DataHandlerBase {
	private static final String GETRTSPVIDEO = "getRtspVideo";
	
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(RtspVideoDataHandler.GETRTSPVIDEO)){
			rep.responseResult = HandlerGetRtspVideo(req.requestParams);
		}
	}

	
	private String HandlerGetRtspVideo(String requestParams){
		return JsonHelper.ListjsonString("ret", RtspVideoProviders.getInstance().getRtspVideo());
	}
}
