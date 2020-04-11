package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.HashMap;

import nurse.entity.persist.Control;
import nurse.entity.persist.ControlMeanings;
import nurse.entity.persist.DataItem;
import nurse.entity.persist.EquipmentTemplate;
import nurse.entity.persist.Event;
import nurse.entity.persist.EventCondition;
import nurse.entity.persist.Signal;
import nurse.entity.persist.SignalMeanings;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.ControlMeaningsProvider;
import nurse.logic.providers.ControlProvider;
import nurse.logic.providers.DataItemProvider;
import nurse.logic.providers.EventConditionProvider;
import nurse.logic.providers.EventProvider;
import nurse.logic.providers.SignalMeaningsProvider;
import nurse.logic.providers.SignalProvider;
import nurse.logic.providers.TemplateProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class TemplateDataHandler extends DataHandlerBase{
	private static final String getAllEventSeverity = "getAllEventSeverity";

	private static final String GetSignalByEquipmentTemplateId = "GetSignalByEquipmentTemplateId";
	private static final String GetEventByEquipmentTemplateId = "GetEventByEquipmentTemplateId";
	private static final String GetControlByEquipmentTemplateId = "GetControlByEquipmentTemplateId";
	private static final String GetDataItemByEntryId = "GetDataItemByEntryId";
	private static final String GetEventConditionByEquipmentTemplateId = "GetEventConditionByEquipmentTemplateId";
	private static final String GetControlMeaningsByEquipmentTemplateId = "GetControlMeaningsByEquipmentTemplateId";
	private static final String GetSignalMeaningsByEquipmentTemplateId = "GetSignalMeaningsByEquipmentTemplateId";
	private static final String BatchBaseTypeId = "BatchBaseTypeId";
	private static final String GetMaxBaseTypeByEquipmentTemplateId = "GetMaxBaseTypeByEquipmentTemplateId";
	private static final String SaveSignalMeanings = "SaveSignalMeanings";
	private static final String SaveSignal = "SaveSignal";
	private static final String DeleteSignal = "DeleteSignal";
	private static final String GetNextSignalId = "GetNextSignalId";
	private static final String AddSignal = "AddSignal";
	private static final String SaveEventCondition = "SaveEventCondition";
	private static final String BatchModifyEventCondition = "BatchModifyEventCondition";
	private static final String AddEvent = "AddEvent";
	private static final String SaveEvent = "SaveEvent";
	private static final String DeleteEvent = "DeleteEvent";
	private static final String SaveControlMeanings = "SaveControlMeanings";
	private static final String AddControl = "AddControl";
	private static final String SaveControl = "SaveControl";
	private static final String DeleteControl = "DeleteControl";
	private static final String GetMaxChannelNo = "GetMaxChannelNo";
	
	
	private static final String GetEquipmentBaseType = "GetEquipmentBaseType";
	private static final String SaveEquipmentTemplate = "SaveEquipmentTemplate";
	private static final String GetEquipmentBaseTypeById = "GetEquipmentBaseTypeById";
	private static final String GetBaseDicByBaseType = "GetBaseDicByBaseType";
	private static final String InsertBaseType = "InsertBaseType";
	private static final String DeleteBaseDic = "DeleteBaseDic";
	private static final String ExportProtocol = "ExportProtocol";
	
	private static final String GetRemoteControlByEquipmentTemplateId = "GetRemoteControlByEquipmentTemplateId";

	private static final String ShieldEnableEvent = "ShieldEnableEvent";

    public TemplateDataHandler() {}
  	@Override
  	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetSignalByEquipmentTemplateId)){
  			rep.responseResult = HandleGetSignalByEquipmentTemplateId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetEventByEquipmentTemplateId)){
  			rep.responseResult = HandleGetEventByEquipmentTemplateId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetControlByEquipmentTemplateId)){
  			rep.responseResult = HandleGetControlByEquipmentTemplateId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetDataItemByEntryId)){
  			rep.responseResult = HandleGetDataItemByEntryId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetEventConditionByEquipmentTemplateId)){
  			rep.responseResult = HandleGetEventConditionByEquipmentTemplateId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetControlMeaningsByEquipmentTemplateId)){
  			rep.responseResult = HandleGetControlMeaningsByEquipmentTemplateId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetSignalMeaningsByEquipmentTemplateId)){
  			rep.responseResult = HandleGetSignalMeaningsByEquipmentTemplateId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.BatchBaseTypeId)){
  			rep.responseResult = HandleBatchBaseTypeId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetMaxBaseTypeByEquipmentTemplateId)){
  			rep.responseResult = HandleGetMaxBaseTypeByEquipmentTemplateId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.SaveSignalMeanings)){
  			rep.responseResult = HandleSaveSignalMeanings(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.SaveSignal)){
  			rep.responseResult = HandleSaveSignal(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.DeleteSignal)){
  			rep.responseResult = HandleDeleteSignal(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetNextSignalId)){
  			rep.responseResult = HandleGetNextSignalId(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.AddSignal)){
  			rep.responseResult = HandleAddSignal(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.SaveEventCondition)){
  			rep.responseResult = HandleSaveEventCondition(req.requestParams);
  		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.BatchModifyEventCondition)){
			rep.responseResult = HandleBatchModifyEventCondition(req.requestParams);
		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.AddEvent)){
  			rep.responseResult = HandleAddEvent(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.SaveEvent)){
  			rep.responseResult = HandleSaveEvent(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.DeleteEvent)){
  			rep.responseResult = HandleDeleteEvent(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.SaveControlMeanings)){
  			rep.responseResult = HandleSaveControlMeanings(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.AddControl)){
  			rep.responseResult = HandleAddControl(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.SaveControl)){
  			rep.responseResult = HandleSaveControl(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.DeleteControl)){
  			rep.responseResult = HandleDeleteControl(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.getAllEventSeverity)){
  			rep.responseResult = HandlegetAllEventSeverity(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetMaxChannelNo)){
  			rep.responseResult = HandleGetMaxChannelNo(req.requestParams);
  		}

  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetEquipmentBaseType)){
  			rep.responseResult = HandleGetEquipmentBaseType(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.SaveEquipmentTemplate)){
  			rep.responseResult = HandleSaveEquipmentTemplate(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetBaseDicByBaseType)){
  			rep.responseResult = HandleGetBaseDicByBaseType(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetEquipmentBaseTypeById)){
  			rep.responseResult = HandleGetEquipmentBaseTypeById(req.requestParams);
  		}
  		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.InsertBaseType)){
  			rep.responseResult = HandleInsertBaseType(req.requestParams);
  		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.GetRemoteControlByEquipmentTemplateId)){
  			rep.responseResult = HandleGetRemoteControlByEquipmentTemplateId(req.requestParams);
  		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.DeleteBaseDic)){
  			rep.responseResult = HandleDeleteBaseDic(req.requestParams);
  		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.ShieldEnableEvent)){
			rep.responseResult = HandleShieldEnableEvent(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(TemplateDataHandler.ExportProtocol)){
			rep.responseResult = HandleExportProtocol(req.requestParams);
		}
  	}
	private String HandleGetSignalByEquipmentTemplateId(String requestParams){
  		ArrayList<Signal> list = SignalProvider.getInstance().GetSignalsById(Integer.parseInt(requestParams));
  		return JsonHelper.ListjsonString("ret", list);
  	}
	
	private String HandleGetEventByEquipmentTemplateId(String requestParams) {
		ArrayList<Event> list = EventProvider.getInstance().GetEventById(Integer.parseInt(requestParams));
		return JsonHelper.ListjsonString("ret", list);
	}
	
	private String HandleGetControlByEquipmentTemplateId(String requestParams){
		ArrayList<Control> list = ControlProvider.getInstance().GetControlsById(Integer.parseInt(requestParams));
		return JsonHelper.ListjsonString("ret", list);
	}
  	
	private String HandleGetDataItemByEntryId(String requestParams){
		ArrayList<DataItem> list = DataItemProvider.getInstance().GetDataItemsByEntryId(Integer.parseInt(requestParams));
		return JsonHelper.ListjsonString("ret", list);
	}
	
	private String HandleGetEventConditionByEquipmentTemplateId(String requestParams){
		ArrayList<EventCondition> list = EventConditionProvider.getInstance().GetEventConditionById(Integer.parseInt(requestParams));
		return JsonHelper.ListjsonString("ret", list);
	}
	
	private String HandleGetControlMeaningsByEquipmentTemplateId(String requestParams){
		ArrayList<ControlMeanings> list = ControlMeaningsProvider.getInstance().GetControlMeaningsById(Integer.parseInt(requestParams));
		return JsonHelper.ListjsonString("ret", list);
	}
	
	private String HandleGetSignalMeaningsByEquipmentTemplateId(String requestParams){
		ArrayList<SignalMeanings> list = SignalMeaningsProvider.getInstance().GetSignalMeaningsById(Integer.parseInt(requestParams));
		return JsonHelper.ListjsonString("ret", list);
	}
	
	private String HandleBatchBaseTypeId(String requestParams){
		TemplateProvider.getInstance().BatchBaseTypeId(Integer.parseInt(requestParams));
		return "OK";
	}
	
	private String HandleGetMaxBaseTypeByEquipmentTemplateId(String requestParams){
		return TemplateProvider.getInstance().GetMaxBaseTypeByEquipmentTemplateId(Integer.parseInt(requestParams));
	}
	
	private String HandleSaveSignalMeanings(String requestParams){
		// requestParams => EquipmentTemplateId|SignalId|Value1-Meanings1|...
		String decode = Base64Helper.decode(requestParams);
		String[] split = decode.split("\\|");
		int equipmentTemplateId = Integer.parseInt(split[0]);
		int signalId = Integer.parseInt(split[1]);
		ArrayList<SignalMeanings> list = new ArrayList<SignalMeanings>();
		for(int i = 2;i < split.length;i++){
			SignalMeanings sm = new SignalMeanings();
			sm.StateValue = Short.parseShort(split[i].split("\\-")[0]);
			sm.Meanings = split[i].split("\\-")[1];
			list.add(sm);
		}
		return TemplateProvider.getInstance().SaveSignalMeanings(equipmentTemplateId,signalId,list);
	}
	
	private String HandleSaveSignal(String requestParams){
		// requestParams => EquipmentTemplateId|SignalId|SignalName|BaseTypeId|ChannelNo|
        //ChannelType|DataType|ShowPrecision|Expression|SignalCategory|SignalType|
        //Unit|Enable|Visible|StoreInterval|AbsValueThreshold|PercentThreshold|ChargeStoreInterVal
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		Signal signal = new Signal();
		signal.EquipmentTemplateId = Integer.parseInt(split[0]);
		signal.SignalId = Integer.parseInt(split[1]);
		signal.SignalName = split[2];
		signal.BaseTypeId = split[3].equals("") ? null : Integer.parseInt(split[3]);
		signal.ChannelNo = Integer.parseInt(split[4]);
		signal.ChannelType = Integer.parseInt(split[5]);
		signal.DataType = Integer.parseInt(split[6]);
		signal.ShowPrecision = split[7];
		signal.Expression = split[8];
		signal.SignalCategory = Integer.parseInt(split[9]);
		signal.SignalType = Integer.parseInt(split[10]);
		signal.Unit = split[11];
		signal.Enable = Boolean.parseBoolean(split[12]);
		signal.Visible = Boolean.parseBoolean(split[13]);
		signal.StoreInterval = split.length < 15 || split[14].equals("") ? null : Float.parseFloat(split[14]);
		signal.AbsValueThreshold = split.length < 16 || split[15].equals("") ? null : Float.parseFloat(split[15]);
		signal.PercentThreshold = split.length < 17 || split[16].equals("") ? null : Float.parseFloat(split[16]);
		signal.StaticsPeriod = split.length < 18 || split[17].equals("") ? null : Integer.parseInt(split[17]);
		signal.ChargeStoreInterVal = split.length < 19 || split[18].equals("") ? null : Float.parseFloat(split[18]);
		signal.ChargeAbsValue = split.length < 20 || split[19].equals("") ? null : Float.parseFloat(split[19]);
		return TemplateProvider.getInstance().SaveSignal(signal);
	}
	
	private String HandleDeleteSignal(String requestParams){
		// requestParams => EquipmentTemplateId|SignalId
		String[] split = requestParams.split("\\|");
		int equipmentTemplateId = Integer.parseInt(split[0]);
		int signalId = Integer.parseInt(split[1]);
		return TemplateProvider.getInstance().DeleteSignal(equipmentTemplateId,signalId);
	}
	
	private String HandleGetNextSignalId(String requestParams){
		// requestParams => EquipmentTemplateId|Type
		String[] split = requestParams.split("\\|");
		String equipmentTemplateId = split[0];
		String type = split[1];
		return TemplateProvider.getInstance().GetNextSignalId(Integer.parseInt(equipmentTemplateId),type);
	}
	
	private String HandleAddSignal(String requestParams){
		// requestParams => EquipmentTemplateId|SignalId|SignalName|BaseTypeId|ChannelNo|
        //ChannelType|DataType|ShowPrecision|Expression|SignalCategory|SignalType|
        //Unit|Enable|Visible|StoreInterval|AbsValueThreshold|PercentThreshold|ChargeStoreInterVal
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		Signal signal = new Signal();
		signal.EquipmentTemplateId = Integer.parseInt(split[0]);
		signal.SignalId = Integer.parseInt(split[1]);
		signal.SignalName = split[2];
		signal.BaseTypeId = split[3].equals("") ? null : Integer.parseInt(split[3]);
		signal.ChannelNo = Integer.parseInt(split[4]);
		signal.ChannelType = Integer.parseInt(split[5]);
		signal.DataType = Integer.parseInt(split[6]);
		signal.ShowPrecision = split[7];
		signal.Expression = split[8];
		signal.SignalCategory = Integer.parseInt(split[9]);
		signal.SignalType = Integer.parseInt(split[10]);
		signal.Unit = split[11];
		signal.Enable = Boolean.parseBoolean(split[12]);
		signal.Visible = Boolean.parseBoolean(split[13]);
		signal.StoreInterval = split.length < 15 || split[14].equals("") ? null : Float.parseFloat(split[14]);
		signal.AbsValueThreshold = split.length < 16 || split[15].equals("") ? null : Float.parseFloat(split[15]);
		signal.PercentThreshold = split.length < 17 || split[16].equals("") ? null : Float.parseFloat(split[16]);
		signal.StaticsPeriod = split.length < 18 || split[17].equals("") ? null : Integer.parseInt(split[17]);
		signal.ChargeStoreInterVal = split.length < 19 || split[18].equals("") ? null : Float.parseFloat(split[18]);
		signal.ChargeAbsValue = split.length < 20 || split[19].equals("") ? null : Float.parseFloat(split[19]);
		
		signal.DisplayIndex = TemplateProvider.getInstance().GetNextDiaplayIndex(signal.EquipmentTemplateId,"Signal");
		
		SignalProvider.getInstance().InsertSignal(signal.EquipmentTemplateId, signal.SignalId, signal.Enable, 
				signal.Visible, signal.Description, signal.SignalName, signal.SignalCategory, signal.SignalType, 
				signal.ChannelNo, signal.ChannelType, signal.Expression, signal.DataType, signal.ShowPrecision, 
				signal.Unit, signal.StoreInterval, signal.AbsValueThreshold, signal.PercentThreshold, 
				signal.StaticsPeriod, signal.BaseTypeId, signal.ChargeStoreInterVal, signal.ChargeAbsValue, 
				signal.DisplayIndex, signal.MDBSignalId, signal.ModuleNo);
		return "OK";
	}
	
	private String HandleSaveEventCondition(String requestParams){
		// requestParams => EquipmentTemplateId|EventId|EventConditionId-EventSeverity-StartOperation-StartCompareValue-StartDelay-Meanings|...
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		int equipmentTemplateId = Integer.parseInt(split[0]);
		int eventId = Integer.parseInt(split[1]);
		ArrayList<EventCondition> list = new ArrayList<EventCondition>();
		for(int i = 2 ;i < split.length; i++){
			String[] ecstr = split[i].split("\\&");
			EventCondition ec = new EventCondition();
			ec.EventConditionId = Integer.parseInt(ecstr[0]);
			ec.EquipmentTemplateId = equipmentTemplateId;
			ec.EventId = eventId;
			ec.EventSeverity = Integer.parseInt(ecstr[1]);
			ec.StartOperation = ecstr[2];
			ec.StartCompareValue = ecstr.length < 4 ? 0 : Float.parseFloat(ecstr[3]);
			ec.StartDelay = ecstr.length < 5 ? 0 : Integer.parseInt(ecstr[4]);
			ec.Meanings = ecstr.length < 6 ? "" : ecstr[5];
			ec.BaseTypeId = (ecstr.length < 7 || ecstr[6].equals("undefined")) ? null : Integer.parseInt(ecstr[6]);
			ec.EquipmentState = 2;
			list.add(ec);
		}
		return TemplateProvider.getInstance().SaveEventCondition(equipmentTemplateId,eventId,list);
	}

	private String HandleBatchModifyEventCondition(String requestParams){
		// requestParams => TeamplateId+EventId1-CompareValue1|EventId2-CompareValue2|...
		try {
			String[] split = Base64Helper.decode(requestParams).split("\\+");
			int templateId = Integer.parseInt(split[0]);
			HashMap<Integer,Double> maps = new HashMap<Integer,Double>();
			String[] events = split[1].split("\\|");
			for(String event : events){
				String[] e = event.split("\\=");
				if(e.length != 2) continue;
				maps.put(Integer.parseInt(e[0]),Double.parseDouble(e[1]));
			}

			return TemplateProvider.getInstance().BatchModifyEventCondition(templateId,maps);
		}catch (Exception ex){
			return "Error";
		}
	}

	private String HandleAddEvent(String requestParams){
		//requestParams => EquipmentTemplateId|EventId|EventName|StartType|EndType|StartExpression|
		//	EventCategory|SignalId|Enable|Visible
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		Event e = new Event();
		e.EquipmentTemplateId = Integer.parseInt(split[0]);
		e.EventId = Integer.parseInt(split[1]);
		e.EventName = split[2];
		e.StartType = Integer.parseInt(split[3]);
		e.EndType = Integer.parseInt(split[4]);
		e.StartExpression = split[5].equals("undefined") ? "" : split[5];
		e.EventCategory = Integer.parseInt(split[6]);
		e.SignalId = split[7].equals("undefined") ? null : Integer.parseInt(split[7]);
		e.Enable = Boolean.parseBoolean(split[8]);
		e.Visible = Boolean.parseBoolean(split[9]);
		
		e.DisplayIndex = TemplateProvider.getInstance().GetNextDiaplayIndex(e.EquipmentTemplateId,"Event");
		
		EventProvider.getInstance().InsertEvent(e.EquipmentTemplateId, e.EventId, e.EventName, e.StartType, 
				e.EndType, e.StartExpression, "", e.EventCategory, e.SignalId, e.Enable, 
				e.Visible, "", e.DisplayIndex, 0);
		return "OK";
	}
	
	private String HandleSaveEvent(String requestParams){
		//requestParams => EquipmentTemplateId|EventId|EventName|StartType|EndType|StartExpression|
		//	EventCategory|SignalId|Enable|Visible
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		Event e = new Event();
		e.EquipmentTemplateId = Integer.parseInt(split[0]);
		e.EventId = Integer.parseInt(split[1]);
		e.EventName = split[2];
		e.StartType = Integer.parseInt(split[3]);
		e.EndType = Integer.parseInt(split[4]);
		e.StartExpression = (split[5].equals("undefined") || split[5].equals("")) ? "" : split[5];
		e.EventCategory = Integer.parseInt(split[6]);
		e.SignalId = (split[7].equals("undefined") || split[7].equals("")) ? null : Integer.parseInt(split[7]);
		e.Enable = Boolean.parseBoolean(split[8]);
		e.Visible = Boolean.parseBoolean(split[9]);
		
		TemplateProvider.getInstance().SaveEvent(e);
		
		return "OK";
	}
	
	private String HandleDeleteEvent(String requestParams){
		// requestParams => EquipmentTemplateId|SignalId
		String[] split = requestParams.split("\\|");
		int equipmentTemplateId = Integer.parseInt(split[0]);
		int evnetId = Integer.parseInt(split[1]);
		return TemplateProvider.getInstance().DeleteEvent(equipmentTemplateId,evnetId);
	}
	
	private String HandleSaveControlMeanings(String requestParams){
		// requestParams => EquipmentTemplateId|SignalId|Value1-Meanings1|...
		String decode = Base64Helper.decode(requestParams);
		String[] split = decode.split("\\|");
		int equipmentTemplateId = Integer.parseInt(split[0]);
		int controlId = Integer.parseInt(split[1]);
		ArrayList<ControlMeanings> list = new ArrayList<ControlMeanings>();
		for(int i = 2;i < split.length;i++){
			ControlMeanings sm = new ControlMeanings();
			sm.ParameterValue = Short.parseShort(split[i].split("\\-")[0]);
			sm.Meanings = split[i].split("\\-")[1];
			list.add(sm);
		}
		return TemplateProvider.getInstance().SaveControlMeanings(equipmentTemplateId,controlId,list);
	}
	
	private String HandleAddControl(String requestParams){
		// requestParams => EquipmentTemplateId|ControlId|ControlName|ControlCategory|
        //	CmdToken|ControlSeverity|SignalId|TimeOut|Retry|Enable|Visible|CommandType|
		//	ControlType|DataType|MaxValue|MinValue
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		Control con = new Control();
		con.EquipmentTemplateId = Integer.parseInt(split[0]);
		con.ControlId = Integer.parseInt(split[1]);
		con.ControlName = split[2];
		con.ControlCategory = Integer.parseInt(split[3]);
		con.CmdToken = split[4].equals("undefined") ? "" : split[4];
		con.ControlSeverity = Integer.parseInt(split[5]);
		con.SignalId = (split[6].equals("undefined") || split[6].equals("")) ? null : Integer.parseInt(split[6]);
		con.TimeOut = (split[7].equals("undefined") || split[7].equals("")) ? null : Float.parseFloat(split[7]);
		con.Retry = (split[8].equals("undefined") || split[8].equals("")) ? null : Integer.parseInt(split[8]);
		con.Enable = Boolean.parseBoolean(split[9]);
		con.Visible = Boolean.parseBoolean(split[10]);
		con.CommandType = Integer.parseInt(split[11]);
		con.ControlType = Integer.parseInt(split[12]);
		con.DataType = Integer.parseInt(split[13]);
		con.MaxValue = Float.parseFloat(split[14]);
		con.MinValue = Float.parseFloat(split[15]);
		con.BaseTypeId = split.length > 16 ? Integer.parseInt(split[16]) : null;
		
		con.DisplayIndex = TemplateProvider.getInstance().GetNextDiaplayIndex(con.EquipmentTemplateId,"Control");
		
		ControlProvider.getInstance().InsertControl(con.EquipmentTemplateId, con.ControlId, con.ControlName, 
				con.ControlCategory, con.CmdToken, con.BaseTypeId, con.ControlSeverity, con.SignalId, 
				con.TimeOut, con.Retry, "", con.Enable, con.Visible, con.DisplayIndex, con.CommandType, 
				con.ControlType, con.DataType, con.MaxValue, con.MinValue, null, 0);
		return "OK";
	}
	
	private String HandleSaveControl(String requestParams){
		// requestParams => EquipmentTemplateId|ControlId|ControlName|ControlCategory|
        //	CmdToken|ControlSeverity|SignalId|TimeOut|Retry|Enable|Visible|CommandType|
		//	ControlType|DataType|MaxValue|MinValue
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		Control con = new Control();
		con.EquipmentTemplateId = Integer.parseInt(split[0]);
		con.ControlId = Integer.parseInt(split[1]);
		con.ControlName = split[2];
		con.ControlCategory = Integer.parseInt(split[3]);
		con.CmdToken = split[4].equals("undefined") ? "" : split[4];
		con.ControlSeverity = Integer.parseInt(split[5]);
		con.SignalId = (split[6].equals("undefined") || split[6].equals("")) ? null : Integer.parseInt(split[6]);
		con.TimeOut = (split[7].equals("undefined") || split[7].equals("")) ? null : Float.parseFloat(split[7]);
		con.Retry = (split[8].equals("undefined") || split[8].equals("")) ? null : Integer.parseInt(split[8]);
		con.Enable = Boolean.parseBoolean(split[9]);
		con.Visible = Boolean.parseBoolean(split[10]);
		con.CommandType = Integer.parseInt(split[11]);
		con.ControlType = Integer.parseInt(split[12]);
		con.DataType = Integer.parseInt(split[13]);
		con.MaxValue = Float.parseFloat(split[14]);
		con.MinValue = Float.parseFloat(split[15]);
		con.BaseTypeId = split.length > 16 ? Integer.parseInt(split[16]) : null;
		
		return TemplateProvider.getInstance().SaveControl(con);
	}
	
	private String HandleDeleteControl(String requestParams){
		// requestParams => EquipmentTemplateId|SignalId
		String[] split = requestParams.split("\\|");
		int equipmentTemplateId = Integer.parseInt(split[0]);
		int controlId = Integer.parseInt(split[1]);
		return TemplateProvider.getInstance().DeleteControl(equipmentTemplateId,controlId);
	}
	
	private String HandleGetMaxChannelNo(String requestParams){
		// requestParams => EquipmentTemplateId
		return TemplateProvider.getInstance().GetMaxChanneNo(Integer.parseInt(requestParams));
	}
	
	
	private String HandlegetAllEventSeverity(String requestParams) {
          ArrayList<DataItem> temp = DataItemProvider.getInstance().GetDataItemsByEntryId(23);
		  return JsonHelper.ListjsonString("ret", temp);		 
	}
	
	public String HandleGetEquipmentBaseType(String requestParams){
		return JsonHelper.ListjsonString("ret", TemplateProvider.getInstance().GetEquipmentBaseType());	
	}
	
	private String HandleSaveEquipmentTemplate(String requestParams) {
		// EquipmentTemplateId|EquipmentCategory|EquipmentTemplateName|EquipmentBaseType|Vendor
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		EquipmentTemplate e = new EquipmentTemplate();
		e.EquipmentTemplateId = Integer.parseInt(split[0]);
		e.EquipmentCategory = Integer.parseInt(split[1]);
		e.EquipmentTemplateName = split[2];
		e.EquipmentBaseType = Integer.parseInt(split[3]);
		e.Vendor = split.length >= 5 ? split[4] : "";
		e.Property = split[5];
	if(TemplateProvider.getInstance().SaveEquipmentTemplate(e)) 
		return "SUCCESS";
	else
        return "FALSE";
	}
	
	private String HandleGetEquipmentBaseTypeById(String requestParams){
		//requestParams => EquipmentId
		return TemplateProvider.getInstance().GetEquipmentBaseTypeById(requestParams);	
	}
	
	private String HandleGetBaseDicByBaseType(String requestParams) {
		//requestParams => Type|EquipmentBaseType
		String[] split = requestParams.split("\\|");
		String type = split[0];
		String equipmentBaseType = split[1];
		return JsonHelper.ListjsonString("ret", TemplateProvider.getInstance().GetBaseDicByBaseType(type,equipmentBaseType));	
	}
	private String HandleInsertBaseType(String requestParams) {
		String[] split = requestParams.split("\\|");
		String type = split[0];
		int EquipmentBaseType = Integer.parseInt(split[1]);
		int BaseTypeId = Integer.parseInt(split[2]);
		int StartNum = Integer.parseInt(split[3]);
		int EndNum = split.length >= 5 ? Integer.parseInt(split[4]) : -1;
	
		return TemplateProvider.getInstance().InsertBaseType(type,EquipmentBaseType,BaseTypeId,StartNum,EndNum);	
	}


	private String HandleGetRemoteControlByEquipmentTemplateId(String requestParams){
		ArrayList<Control> list = ControlProvider.getInstance().GetRemoteControlsById(Integer.parseInt(requestParams));
		return JsonHelper.ListjsonString("ret", list);
	}
	
	private String HandleDeleteBaseDic(String requestParams){
		String[] split = requestParams.split("\\|");
		String type = split[0];
		int baseTypeId = Integer.parseInt(split[1]);
		if(TemplateProvider.getInstance().DeleteBaseDic(type,baseTypeId))
			return "OK";
		else
			return "ERROR";
	}

	private String HandleShieldEnableEvent(String requestParams){
    	//requestParams => EquipmentTemplateId|EventId|Shield
		// Enable = !Shield ? 1 : 0
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		String equipmentTemplateId = split[0];
		String eventId = split.length > 1 ? split[1] : null;
		int enable = split.length > 2 ? (split[2].equals("false") ? 1 : 0) : 0;

		return TemplateProvider.getInstance().shieldEnableEvent(equipmentTemplateId,eventId,enable);
	}

	private String HandleExportProtocol(String requestParams){
		//requestParams => EquipmentTemplateId

		return TemplateProvider.getInstance().exportProtocol(requestParams);
	}
} 
