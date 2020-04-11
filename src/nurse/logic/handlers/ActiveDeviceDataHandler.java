package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.HashMap;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.view.ActiveDevice;
import nurse.logic.providers.ActiveDeviceProvider;
import nurse.utility.JsonHelper;

public class ActiveDeviceDataHandler  extends DataHandlerBase {

	private static final String GetActiveDevices = "getActiveDevices";
	private static ArrayList<ActiveDevice> activeDevices = new ArrayList<ActiveDevice>();
	private static ActiveDeviceDataHandler activeDeviceDataHandler = new ActiveDeviceDataHandler();
	
	public static ActiveDeviceDataHandler getInstance(){
		return activeDeviceDataHandler;
	}
	
	public ActiveDeviceDataHandler() {

	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveDeviceDataHandler.GetActiveDevices))
		{
			rep.responseResult = HandleGetActiveDevices(req.requestParams);
		}		
	}

	private String HandleGetActiveDevices(String requestParams) {
		//if load devices will not update devices till reboot
		if (activeDevices.size() == 0) 
			activeDevices = ActiveDeviceProvider.getInstance().GetAllActiveDevices();
		
		HashMap<Integer, Integer> csMap = ActiveDeviceProvider.getInstance().getAllConnectStates();

		for (int i = 0; i < activeDevices.size(); i++) {
			activeDevices.get(i).updateAlarms(csMap.get(activeDevices.get(i).id));
		}
				
		return JsonHelper.ListjsonString("ret", activeDevices);
	}
	
	public void LoadNewActiveDevices(){
		activeDevices = ActiveDeviceProvider.getInstance().GetAllActiveDevices();
	}
	
	public ArrayList<ActiveDevice> getActiveDevices(){
		return activeDevices;
	}
	
	public void setActiveDevices(ArrayList<ActiveDevice> list){
		activeDevices = list;
	}
}
