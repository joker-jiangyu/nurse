package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.EventProvider;
import nurse.utility.JsonHelper;

public class EventDataHandler extends DataHandlerBase{
	private static final String getEquipmentTemplateEvents = "getEquipmentTemplateEvents";

	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EventDataHandler.getEquipmentTemplateEvents)){
			rep.responseResult = HandleGetEquipmentTemplateEvents(req.requestParams);
		}
	}
	
	private String HandleGetEquipmentTemplateEvents(String requestParams){
		// requestParams => EquipmentBase|EquipmentBase|...
		return JsonHelper.ListjsonString("ret", EventProvider.getInstance().getEquipmentTemplateEvents(requestParams));
	}
}
