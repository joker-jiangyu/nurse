package nurse.logic.handlers;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONObject;

import nurse.entity.persist.ActiveAlarm;
import nurse.entity.persist.Device;
import nurse.entity.trasfer.BindItem;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.trasfer.StateItem;
import nurse.logic.providers.ActiveAlarmProvider;
import nurse.logic.providers.ArenaProvider;
import nurse.logic.providers.DeviceProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class ArenaDataHandler extends DataHandlerBase {
	private static final String GetConfig = "getConfig";
	private static final String SaveConfig = "saveConfig";
	private static final String GetBinding = "getBinding";
	private static final String GetData = "getData";
	
	public ArenaDataHandler() {
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ArenaDataHandler.GetConfig))
		{
			rep.responseResult = HandleGetConfig(req.requestParams);
		}		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ArenaDataHandler.SaveConfig))
		{
			rep.responseResult = HandleSaveConfig(req.requestParams);
		}		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ArenaDataHandler.GetBinding))
		{
			rep.responseResult = HandleGetBinding(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ArenaDataHandler.GetData))
		{
			rep.responseResult = HandleGetData(req.requestParams);
		}
	}

	private String HandleGetData(String requestParams) {
		JSONArray bset = new JSONArray(requestParams);
		ArrayList<ActiveAlarm> as = ActiveAlarmProvider.getInstance().GetAllAlarms();
		ArrayList<StateItem> sis = new ArrayList<StateItem>();
		
		for(int i=0;i<bset.length();i++){
			JSONObject bsi = bset.getJSONObject(i);
			String id = bsi.getString("id");
			JSONArray bs =bsi.getJSONArray("bs");
			
			sis.add(createStateForBinding(id,bs,as));
		}
		
		return JsonHelper.ListjsonString("ret", sis);
	}
	
	private StateItem createStateForBinding(String itemId, JSONArray bs,ArrayList<ActiveAlarm> alarms){
		StateItem si = new StateItem();
		
		si.id = itemId;
		si.type = "ALARM";
		
		int alarmLevel = 0;
		
		for(int i=0;i<bs.length();i++){
			JSONObject item = bs.getJSONObject(i);
			int bindId = item.getInt("id");
			String type = item.getString("type");
			if (type.equals("DEVICE"))
			{
				ActiveAlarm alarm= alarms.stream()
						.filter(a -> a.deviceId == bindId)
						.max((a1,a2)->a1.alarmLevel - a2.alarmLevel).orElseGet(()->{return null;});
				
				if (alarm != null) alarmLevel = alarm.alarmLevel + 1;
			}
		}
		
		si.state = String.valueOf(alarmLevel);
		
		return si;
	}

	private String HandleGetBinding(String requestParams) {
		ArrayList<Device> ds = DeviceProvider.getInstance().GetAllDevices();
		ArrayList<BindItem> bis = new ArrayList<BindItem>();
		
		for(Device dev : ds){
			BindItem bi = new BindItem();
			bi.id = String.valueOf(dev.deviceId);
			bi.name = dev.deviceName;
			bi.type = "DEVICE";
			
			bis.add(bi);
		}
		
		return JsonHelper.ListjsonString("ret", bis);		
	}

	private String HandleGetConfig(String requestParams) {
		String filename = Base64Helper.decode(requestParams);
		return ArenaProvider.getInstance().getFile(filename);		
	}
	
	private String HandleSaveConfig(String requestParams) {
		JSONObject req = new JSONObject(requestParams);
		String filename = Base64Helper.decode(req.getString("name"));
		String filecontent = Base64Helper.decode(req.getString("file"));
		
		return ArenaProvider.getInstance().saveFile(filename, filecontent);	
   }

}
