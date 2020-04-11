package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Base64;

import nurse.entity.persist.DataItem;
import nurse.entity.persist.EquipmentTemplate;
import nurse.entity.persist.EventNotifyRule;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.DataItemProvider;
import nurse.logic.providers.EquipmentTemplateProvider;
import nurse.logic.providers.EventFilterProvider;
import nurse.utility.JsonHelper;


public class NotifyDataHandler extends DataHandlerBase {
	private static final String getAllEventNotifyRules = "getAllEventNotifyRules";
	private static final String getEventNotifyRule = "getEventNotifyRule";
	private static final String getDataItems = "getDataItems";
	private static final String setEventNotifyRule = "setEventNotifyRule";
	private static final String deleteEventNotifyRule = "deleteEventNotifyRule";

	public NotifyDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(NotifyDataHandler.getAllEventNotifyRules)){
			rep.responseResult = HandleGetAllEventNotifyRules(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(NotifyDataHandler.getDataItems)){
			rep.responseResult = HandleGetDataItems(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(NotifyDataHandler.setEventNotifyRule)){
			rep.responseResult = HandleSetEventNotifyRule(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(NotifyDataHandler.deleteEventNotifyRule)){
			rep.responseResult = HandleDeleteEventNotifyRule(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(NotifyDataHandler.getEventNotifyRule)){
			rep.responseResult = HandleGetEventNotifyRule(req.requestParams);
		}
	}
		
	private String HandleGetAllEventNotifyRules(String requestParams) {
		
		ArrayList<EventNotifyRule> temp = EventFilterProvider.getInstance().GetAllEventNotifyRules();
		
		return JsonHelper.ListjsonString("ret", temp);
	}
	
	private String HandleGetDataItems(String requestParams) {
		
		String result = "fail to get dataItems";
        
        try{
        	
			int entryId = Integer.valueOf(requestParams);

			ArrayList<DataItem> temp = DataItemProvider.getInstance().GetDataItemsByEntryId(entryId);
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	

	private String HandleSetEventNotifyRule(String requestParams) {
		
		String result = "fail to set eventNotifyRule";
        
        try{
        	
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\#");
        	
        	String Description;
        	int NotifyMode;
        	String Receiver;
        	String NotifyEventType;
        	String NotifyEventLevel;
        	String NotifyEquipID;
        	
        	Description = paras[0];
        	NotifyMode = Integer.parseInt(paras[1]);
        	Receiver = paras[2];
        	NotifyEventType = paras[3];
        	NotifyEventLevel = paras[4];
        	NotifyEquipID = paras[5];
        	
        	EventFilterProvider.getInstance().InsertEventNotifyRule(Description, NotifyMode, Receiver, NotifyEventType, NotifyEventLevel, NotifyEquipID);
        	
			result = "OK";
			return result;
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleDeleteEventNotifyRule(String requestParams) {
		
		int eventFilterId = Integer.valueOf(requestParams);

		String result = "fail to delete eventNotifyRule";
        
        try{
        	boolean bRet = EventFilterProvider.getInstance().DelEventNotifyRule(eventFilterId);
            
        	if(bRet)
        	{
        		int nums = EventFilterProvider.getInstance().GetEventNotifyRuleNums();
        		result = "" + nums;
        	}
        
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleGetEventNotifyRule(String requestParams) {
		
		int eventFilterId = Integer.valueOf(requestParams);

		String result = "fail to get eventNotifyRule";
        
        try{
        	ArrayList<EventNotifyRule> temp = EventFilterProvider.getInstance().GetEventNotifyRule(eventFilterId);
    		
    		return JsonHelper.ListjsonString("ret", temp);
        
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
}
