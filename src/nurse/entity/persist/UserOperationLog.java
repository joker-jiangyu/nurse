package nurse.entity.persist;

import java.util.ArrayList;

import nurse.logic.handlers.LanguageDataHandler;
import org.json.JSONArray;
import org.json.JSONObject;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class UserOperationLog {
	public int Id;
	public int OperationId;//操作类型；操作表编号
	public String OperationName;
	public String LogonId;
	public String IpAddress;//访问IP地址
	public String EquipmentId;//设备编号
	public String EquipmentName;
	public String ControlId;//控制编号
	public String ControlName;
	public String ParameterValues;//控制值
	public String Meanings;
	public String EventId;//事件编号
	public String EventName;
	public String StartTime;//操作时间
	public String Description;
	
	public static ArrayList<UserOperationLog> fromDataTable(DataTable dt) {
		ArrayList<UserOperationLog> uols = new ArrayList<UserOperationLog>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			UserOperationLog uol = new UserOperationLog();
			uol.Id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
			uol.OperationId = Integer.parseInt(drs.get(i).getValueAsString("OperationId"));
			if(LanguageDataHandler.getLanaguage().equals("English")){
				uol.OperationName = LanguageDataHandler.getLanaguageJsonValue(getLanaguageJsonKey(uol.OperationId));
			}else
				uol.OperationName = drs.get(i).getValueAsString("OperationName");
			uol.LogonId = drs.get(i).getValueAsString("LogonId"); 
			uol.IpAddress = drs.get(i).getValueAsString("IpAddress");
			uol.EquipmentId = drs.get(i).getValueAsString("EquipmentId"); 
			uol.EquipmentName = drs.get(i).getValueAsString("EquipmentName");
			uol.ControlId = drs.get(i).getValueAsString("ControlId"); 
			uol.ControlName = drs.get(i).getValueAsString("ControlName");
			uol.ParameterValues = drs.get(i).getValueAsString("ParameterValues");
			uol.Meanings = drs.get(i).getValueAsString("Meanings");
			uol.EventId = drs.get(i).getValueAsString("EventId"); 
			uol.EventName = drs.get(i).getValueAsString("EventName");
			uol.StartTime = drs.get(i).getValueAsString("StartTime").replace(".0", "");
			uol.Description = drs.get(i).getValueAsString("Description");
			
			uols.add(uol);
		}		
		return uols;
	}
	
	public static String parseUserOperationLog(ArrayList<UserOperationLog> uols){
		JSONArray arr = new JSONArray();
		for(UserOperationLog item : uols){
			JSONObject obj = new JSONObject();
			obj.put("id", item.Id);
			obj.put("logonId", item.LogonId);
			obj.put("ip", item.IpAddress);
			
			String content = "";
			if(item.OperationId == 1){
				content = String.format("%s %s %s", item.OperationName, item.EquipmentName, item.EventName);
			}else if(item.OperationId == 50){
				if(item.Meanings == null)
					content = String.format("%s %s %s[%s]", item.OperationName, item.EquipmentName, item.ControlName, item.ParameterValues);
				else
					content = String.format("%s %s %s %s[%s]", item.OperationName, item.EquipmentName, item.ControlName, item.Meanings, item.ParameterValues);
			}else if(item.ParameterValues != null && !item.ParameterValues.equals(""))
				content = String.format("%s %s", item.OperationName, item.ParameterValues);
			else if(item.Description != null && item.Description.length() > 0)
				content = String.format("%s ( %s )",item.OperationName,item.Description);
			else
				content = item.OperationName;
			obj.put("content", content);
				
			obj.put("starTime", item.StartTime);
			arr.put(obj);
		}
		return arr.toString();
	}

	private static String getLanaguageJsonKey(int id){
		/*	1:"OperationRecord.EventConfirm",
			47:"OperationRecord.Login",
            48:"OperationRecord.LoginOut",
            50:"OperationRecord.SendControl",
            60:"OperationRecord.ConfigChange",
            75:"OperationRecord.Shutdown",
            76:"OperationRecord.Restart"
            77:"OperationRecord.LoginError"
            */
		String key = "";
		switch (id){
			case 1:
				key += "OperationRecord.EventConfirm";
				break;
			case 47:
				key += "OperationRecord.Login";
				break;
			case 48:
				key += "OperationRecord.LoginOut";
				break;
			case 50:
				key += "OperationRecord.SendControl";
				break;
			case 60:
				key += "OperationRecord.ConfigChange";
				break;
			case 75:
				key += "OperationRecord.Shutdown";
				break;
			case 76:
				key += "OperationRecord.Restart";
				break;
			case 77:
				key += "OperationRecord.LoginError";
				break;
		}
		return key;
	}

	public static ArrayList<DataItem> fromDataItemTable(DataTable dt){
		ArrayList<DataItem> list = new ArrayList<DataItem>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for(int i=0;i<rowCount;i++)
		{
			DataItem di = new DataItem();
			di.ItemId = Integer.parseInt(drs.get(i).getValueAsString("OperationId"));
			if(di.ItemId == 1 || di.ItemId == 29 || di.ItemId == 31 || di.ItemId == 47 || di.ItemId == 48|| di.ItemId == 50
					|| di.ItemId == 60 || di.ItemId == 75 || di.ItemId == 76 || di.ItemId == 77){
				di.ItemValue = drs.get(i).getValueAsString("OperationName");
				di.ItemAlias = LanguageDataHandler.getLanaguageJsonValue(getLanaguageJsonKey(di.ItemId));
				list.add(di);
			}
		}
		return list;
	}
}
