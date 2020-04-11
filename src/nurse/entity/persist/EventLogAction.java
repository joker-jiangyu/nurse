package nurse.entity.persist;

import java.util.ArrayList;
import java.util.HashMap;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.JsonHelper;

public class EventLogAction {
	public Integer logActionId;
	public String actionName;
	public Integer stationId;
	public Integer monitorUnitId;
	public Integer triggerType;
	public String startExpression;
	public String suppressExpression;
	public String informMsg;
	public String description;
	
	public String controlLogActions;
	
	public static ArrayList<EventLogAction> GetListFromDataTable(DataTable dt){
		HashMap<Integer, EventLogAction> mapEla = new HashMap<Integer, EventLogAction>();
		HashMap<Integer, ArrayList<ControlLogAction>> mapCla = new HashMap<Integer, ArrayList<ControlLogAction>>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			DataRow dr = drs.get(i);
			EventLogAction ela = new EventLogAction();
			ela.logActionId = Integer.parseInt(dr.getValueAsString("LogActionId"));
			ela.actionName = dr.getValueAsString("ActionName");
			ela.triggerType = Integer.parseInt(dr.getValueAsString("TriggerType"));
			ela.startExpression = dr.getValueAsString("StartExpression");
			ela.description = dr.getValueAsString("Description");

			if(dr.getValueAsString("ActionId") != null && dr.getValueAsString("EquipmentId") != null 
					&& dr.getValueAsString("ControlId") != null){
				ControlLogAction cla = new ControlLogAction();
				cla.logActionId = ela.logActionId;
				cla.actionName = ela.actionName;
				cla.actionId = Integer.parseInt(dr.getValueAsString("ActionId"));
				cla.equipmentId = Integer.parseInt(dr.getValueAsString("EquipmentId"));
				cla.controlId = Integer.parseInt(dr.getValueAsString("ControlId"));
				cla.actionValue = dr.getValueAsString("ActionValue");
				
				ArrayList<ControlLogAction> clas = new ArrayList<ControlLogAction>();
				if(mapEla.containsKey(ela.logActionId)){
					clas = mapCla.get(ela.logActionId);
					clas.add(cla);
					//mapCla.put(ela.logActionId, clas);
					ela = mapEla.get(ela.logActionId);
					ela.controlLogActions = JsonHelper.ListjsonArray(clas).toString();
					//mapEla.put(ela.logActionId, ela);
				}else{
					clas.add(cla);
					mapCla.put(ela.logActionId, clas);
					ela.controlLogActions = JsonHelper.ListjsonArray(clas).toString();
					mapEla.put(ela.logActionId, ela);
				}
			}else
				mapEla.put(ela.logActionId, ela);
		}
		ArrayList<EventLogAction> list = new ArrayList<EventLogAction>();
		list.addAll(mapEla.values());
		return list;
	}
}
