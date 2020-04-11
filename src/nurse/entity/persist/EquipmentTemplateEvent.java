package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EquipmentTemplateEvent {
	public Integer equipmentTemplateId;
	public String equipmentTemplateName;
	public String equipments;//设备模板下的设备集
	public Integer signalId;
	public Integer eventId;
	public String eventName;
	public String startOperation;
	public String startCompareValue;
	public Integer eventSeverity;
	
	public static ArrayList<EquipmentTemplateEvent> fromDataTable(DataTable dt,ArrayList<Equipment> equipments) {
		ArrayList<EquipmentTemplateEvent> etes = new ArrayList<EquipmentTemplateEvent>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EquipmentTemplateEvent ete = new EquipmentTemplateEvent();
			ete.equipmentTemplateId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentTemplateId"));
			ete.equipmentTemplateName = drs.get(i).getValueAsString("EquipmentTemplateName");
			ete.signalId = drs.get(i).getValue("SignalId") == null ? -1 : Integer.parseInt(drs.get(i).getValueAsString("SignalId"));
			ete.eventId = Integer.parseInt(drs.get(i).getValueAsString("EventId"));
			ete.eventName = drs.get(i).getValueAsString("EventName");
			ete.startOperation = drs.get(i).getValueAsString("StartOperation");
			ete.startCompareValue = drs.get(i).getValueAsString("StartCompareValue");
			if(drs.get(i).getValueAsString("EventSeverity") != null && !drs.get(i).getValueAsString("EventSeverity").equals(""))
				ete.eventSeverity = Integer.parseInt(drs.get(i).getValueAsString("EventSeverity"));
			
			ete.equipments = "[";
			if(equipments != null)
				for(int j = 0;j < equipments.size();j++){
					if(!equipments.get(j).EquipmentTemplateId.equals(ete.equipmentTemplateId)) continue;
					if(ete.equipments.equals("[")) ete.equipments += String.valueOf(equipments.get(j).EquipmentId);
					else ete.equipments += ","+equipments.get(j).EquipmentId;
				}
			ete.equipments += "]";
			
			etes.add(ete);
		}		
		return etes;
	}
}
