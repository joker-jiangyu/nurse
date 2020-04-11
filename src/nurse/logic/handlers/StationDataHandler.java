package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Base64;

import nurse.entity.persist.Center;
import nurse.entity.persist.Station;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.CenterProvider;
import nurse.logic.providers.StationProvider;
import nurse.logic.providers.WorkStationProvider;
import nurse.utility.JsonHelper;

public class StationDataHandler extends DataHandlerBase {
	private static final String getStationInfo = "getStationInfo";
	private static final String updateStationInfo = "updateStationInfo";
	private static final String initStationInfo = "initStationInfo";
	
	private static final String getCenterInfo = "getCenterInfo";
	private static final String updateCenterInfo = "updateCenterInfo";
	
	public StationDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(StationDataHandler.getStationInfo)){
			rep.responseResult = HandleGetStationInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(StationDataHandler.updateStationInfo))
		{
			rep.responseResult = HandleUpdateStationInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(StationDataHandler.initStationInfo))
		{
			rep.responseResult = HandleInitStationInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(StationDataHandler.getCenterInfo))
		{
			rep.responseResult = HandleGetCenterInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(StationDataHandler.updateCenterInfo))
		{
			rep.responseResult = HandleUpdateCenterInfo(req.requestParams);
		}
	}
		
	
	private String HandleGetStationInfo(String requestParams) {
		
		String result = "fail to get station info";
        
        try{
			ArrayList<Station> temp = StationProvider.getInstance().GetAllStations();
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}

	private String HandleUpdateStationInfo(String requestParams) {

		String result = "fail to update station info";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
			int stationId = Integer.parseInt(paras[0]);
			String stationName = paras[1];
			int contactId = Integer.parseInt(paras[2]);
			
			String remark = "";
			if(paras.length > 3)
			{
				remark = paras[3];
			}
			
			StationProvider.getInstance().UpdateStationInfo(stationId, stationName, contactId, remark);
			
			result = "OK";
        
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleInitStationInfo(String requestParams) {

		String result = "fail to init station info";
        
        try{
        	//判断该局站是否已经初始化，如果局站数为0，表示需要初始化
        	int iStations = StationProvider.getInstance().GetStationNums();
        	
        	if(iStations == 0)
        	{
        		//需要初始化局站
        		StationProvider.getInstance().InitStationInfo();
        	}
			
			result = "success to init station info";
        
        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}
	
private String HandleGetCenterInfo(String requestParams) {
		
		String result = "fail to get center info";
        
        try{
        	//判断该中心是否已经初始化，如果中心数为0，表示需要初始化
        	int iCenters = CenterProvider.getInstance().GetCenterNums();
        	if(iCenters == 0)
        	{
        		//需要初始化局站
        		CenterProvider.getInstance().InitCenterInfo();
        	}
        	
        	int iDSs = WorkStationProvider.getInstance().GetDSNums();
        	if(iDSs == 0)
        	{
        		//需要初始化DS
        		WorkStationProvider.getInstance().InsertDS("", false);
        	}
        	
			ArrayList<Center> temp = CenterProvider.getInstance().GetAllCenters();
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}

	private String HandleUpdateCenterInfo(String requestParams) {

		String result = "fail to update center info";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
			int centerId = Integer.parseInt(paras[0]);
			String centerIP = paras[1];
			int centerPort = Integer.parseInt(paras[2]);
			String centerDSIP = paras[3];
			boolean centerEnable = Boolean.parseBoolean(paras[4]);
			
			
			boolean bUpdate = CenterProvider.getInstance().UpdateCenterInfo(centerId, centerIP, centerPort, centerEnable);
			boolean bUpdateDSIP = WorkStationProvider.getInstance().UpdateWorkStationInfo(centerDSIP, centerEnable);
			if(bUpdate && bUpdateDSIP)
			{
				result = "OK";
			}
        
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}

}
