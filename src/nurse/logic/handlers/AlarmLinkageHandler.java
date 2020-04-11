package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Base64;

import nurse.entity.persist.ControlLogAction;
import nurse.entity.persist.EventLogAction;
import nurse.entity.persist.Station;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.*;
import nurse.utility.Base64Helper;
import nurse.utility.DoorGovernHelper;
import nurse.utility.JsonHelper;

public class AlarmLinkageHandler extends DataHandlerBase {
	private static final String GetAllAlarmLinkage = "GetAllAlarmLinkage";
	private static final String InsertAlarmLinkage = "InsertAlarmLinkage";
	private static final String UpdateAlarmLinkage = "UpdateAlarmLinkage";
	private static final String DeleteAlarmLinkage = "DeleteAlarmLinkage";
	private static final String GetEventExperByETId = "GetEventExperByETId";
    private static final String InsertSignalLinkage = "InsertSignalLinkage";
    private static final String UpdateSignalLinkage = "UpdateSignalLinkage";
    private static final String DeleteSignalLinkage = "DeleteSignalLinkage";
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AlarmLinkageHandler.GetAllAlarmLinkage)){
			rep.responseResult = HandleGetAllAlarmLinkage(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AlarmLinkageHandler.InsertAlarmLinkage)){
			rep.responseResult = HandleInsertAlarmLinkage(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AlarmLinkageHandler.UpdateAlarmLinkage)){
			rep.responseResult = HandleUpdateAlarmLinkage(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AlarmLinkageHandler.DeleteAlarmLinkage)){
			rep.responseResult = HandleDeleteAlarmLinkage(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AlarmLinkageHandler.GetEventExperByETId)){
			rep.responseResult = HandleGetEventExperByETId(req.requestParams);
		}
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(AlarmLinkageHandler.InsertSignalLinkage)){
            rep.responseResult = HandleInsertSignalLinkage(req.requestParams);
        }
	}
	
	private String HandleGetAllAlarmLinkage(String requestParams){
		ArrayList<EventLogAction> list = AlarmLinkageProvider.getInstance().GetAllAlarmLinkage();
		return JsonHelper.ListjsonString("ret", list);
	}
	
	private String HandleInsertAlarmLinkage(String requestParams){
		//requestParams => LogActionId|ActionName|TriggerType|StartExpression|Description|EquipmentId&ActionId&ControlId&ActionValue;...
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		EventLogAction ela = new EventLogAction();
		ArrayList<ControlLogAction> clas = new ArrayList<ControlLogAction>();
		//ela.logActionId = Integer.parseInt(split[0]);
		ela.actionName = split[1];
		ela.triggerType = Integer.parseInt(split[2]);
		ela.startExpression = split[3];
		ela.description = split.length > 4 ? split[4] : "";
		
		String[] str = split.length > 5 ? split[5].split("\\;") : new String[]{};
		for(int i = 0;i < str.length; i++){
			String[] split2 = str[i].split("\\&");
			ControlLogAction cla = new ControlLogAction();
			//cla.logActionId = ela.logActionId;
			cla.actionName = ela.actionName;
			cla.equipmentId = Integer.parseInt(split2[0]);
			cla.actionId = (i+1);
			cla.controlId = Integer.parseInt(split2[2]);
			cla.actionValue = split2[3];
					
			clas.add(cla);
		}
		return AlarmLinkageProvider.getInstance().InsertAlarmLinkage(ela,clas);
	}
	
	private String HandleUpdateAlarmLinkage(String requestParams){
		//requestParams => LogActionId|ActionName|TriggerType|StartExpression|Description|EquipmentId&ActionId&ControlId&ActionValue;...
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		EventLogAction ela = new EventLogAction();
		ArrayList<ControlLogAction> clas = new ArrayList<ControlLogAction>();
		ela.logActionId = Integer.parseInt(split[0]);
		ela.actionName = split[1];
		ela.triggerType = Integer.parseInt(split[2]);
		ela.startExpression = split[3];
		ela.description = "";
		
		String[] str = split.length > 5 ? split[5].split("\\;") : new String[]{};
		for(int i = 0;i < str.length; i++){
			String[] split2 = str[i].split("\\&");
			ControlLogAction cla = new ControlLogAction();
			cla.logActionId = ela.logActionId;
			cla.actionName = ela.actionName;
			cla.equipmentId = Integer.parseInt(split2[0]);
			cla.actionId = (i+1);
			cla.controlId = Integer.parseInt(split2[2]);
			cla.actionValue = split2[3];
					
			clas.add(cla);
		}
		return AlarmLinkageProvider.getInstance().UpdateAlarmLinkage(ela,clas);
	}
	
	private String HandleDeleteAlarmLinkage(String requestParams){
		//requestParams => LogActionId
		return AlarmLinkageProvider.getInstance().DeleteAlarmLinkage(Integer.parseInt(requestParams));
	}
	
	private String HandleGetEventExperByETId(String requestParams){
		//requestParams => EquipmentId
		return JsonHelper.ListjsonString("ret",AlarmLinkageProvider.getInstance().GetEventExperByETId(requestParams));
		
	}

	private String HandleInsertSignalLinkage(String requestParams){
        //requestParams => Percent|ActionName|TriggerType|StartExpression|Description|EquipmentId&ControlId&ActionValue;+...
        System.out.println("InsertSignalLinkage Params:"+Base64Helper.decode(requestParams));

        String[] params = Base64Helper.decode(requestParams).split("\\^");
        String result = "";
        for(String param : params){
            System.out.println("For Params:"+param);
            if(param == null || param.equals("")) continue;

            String[] split = param.split("\\|");
            EventLogAction ela = new EventLogAction();
            ArrayList<ControlLogAction> clas = new ArrayList<ControlLogAction>();
            ela.actionName = split[1];
            ela.triggerType = Integer.parseInt(split[2]);
            ela.startExpression = split[3];
            ela.description = split.length > 4 ? split[4] : "";

            String[] str = split.length > 5 ? split[5].split("\\;") : new String[]{};
            for(int i = 0;i < str.length; i++){
                String[] split2 = str[i].split("\\&");
                ControlLogAction cla = new ControlLogAction();
                cla.actionName = ela.actionName;
                cla.equipmentId = Integer.parseInt(split2[0]);
                cla.actionId = (i+1);
                cla.controlId = Integer.parseInt(split2[1]);
                cla.actionValue = split2[2];

                clas.add(cla);
            }

            if(result.length() > 0) result += "|";
            result += split[0]+"-"+AlarmLinkageProvider.getInstance().InsertSignalinkage(ela,clas);
            System.out.println("InsertSignalLinkage Result:"+result);
        }
        return result;
    }
}
