package nurse.logic.handlers;

import java.util.ArrayList;

import nurse.entity.persist.MonitorUnit;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.MonitorUnitProvider;
import nurse.utility.JsonHelper;

public class MonitorUnitDataHandler extends DataHandlerBase {
	private static final String getMonitorUnit = "getMonitorUnit";
	
	public MonitorUnitDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(MonitorUnitDataHandler.getMonitorUnit)){
			rep.responseResult = HandleGetMonitorUnit(req.requestParams);
		}
	}
		
	
	private String HandleGetMonitorUnit(String requestParams) {
		
		int stationId = Integer.valueOf(requestParams);
		String result = "fail to get monitorUnit";
        
        try{
			ArrayList<MonitorUnit> temp = MonitorUnitProvider.getInstance().GetMonitorUnitByStationId(stationId);
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}

}
