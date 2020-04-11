package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import nurse.entity.persist.SamplerUnit;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.SamplerUnitProvider;
import nurse.utility.JsonHelper;

public class SamplerUnitDataHandler extends DataHandlerBase {
	private static final String getDefaultSamplerUnit = "getDefaultSamplerUnit";
	private static final String getInsertSamplerUnit = "getInsertSamplerUnit";
	
	public SamplerUnitDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SamplerUnitDataHandler.getDefaultSamplerUnit)){
			rep.responseResult = HandleGetDefaultSamplerUnit(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(SamplerUnitDataHandler.getInsertSamplerUnit)){
			rep.responseResult = HandleGetInsertSamplerUnit(req.requestParams);
		}
	}
		
	
	private String HandleGetDefaultSamplerUnit(String requestParams) {
		
		String result = "fail to get default samplerUnit";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
			int equipmentTemplateId = Integer.parseInt(paras[0]);
			int portId = Integer.parseInt(paras[1]);
			int portNo = Integer.parseInt(paras[2]);
			int monitorUnitId = Integer.parseInt(paras[3]);

			ArrayList<SamplerUnit> temp = SamplerUnitProvider.getInstance().GetDefaultSamplerUnit(equipmentTemplateId, portId, portNo, monitorUnitId);
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleGetInsertSamplerUnit(String requestParams) {
		
		String result = "fail to get insert samplerUnit";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\|");
			int SamplerUnitId = Integer.parseInt(paras[0]);
			int PortId = Integer.parseInt(paras[1]);
			int MonitorUnitId = Integer.parseInt(paras[2]);
			int SamplerId = Integer.parseInt(paras[3]);
			int SamplerType = Integer.parseInt(paras[4]);
			String SamplerUnitName = paras[5];
			int Address = Integer.parseInt(paras[6]);
			String DllPath = paras[7];
			int ParentSamplerUnitId = 0;
			Float SpUnitInterval = Float.parseFloat("2");
			int ConnectState = 0;
			Date date = new Date();
			Date UpdateTime = date;
			String PhoneNumber = "";
			String Description = "";

			if(SamplerUnitId < 0)
			{
				//SamplerUnitId = SamplerUnitProvider.getInstance().GetMaxSamplerUnitId();
				SamplerUnitId = SamplerUnitProvider.getInstance().GenerateSamplerUnitId();
				
				boolean bRet = SamplerUnitProvider.getInstance().InsertSamplerUnit(SamplerUnitId, PortId, MonitorUnitId, SamplerId, ParentSamplerUnitId, SamplerType, SamplerUnitName, Address, SpUnitInterval, DllPath, ConnectState, UpdateTime, PhoneNumber, Description);
				if(bRet)
				{
					result = String.format("%d", SamplerUnitId);
				}
			}
			else
			{
				boolean bRet = SamplerUnitProvider.getInstance().UpdateSamplerUnit(SamplerUnitId, PortId, MonitorUnitId, Address, DllPath);
				if(bRet)
				{
					result = String.format("%d", SamplerUnitId);
				}
			}
            
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}

}
