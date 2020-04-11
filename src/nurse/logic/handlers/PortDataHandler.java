package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Base64;

import nurse.entity.persist.Port;
import nurse.entity.persist.SmsPort;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.PortProvider;
import nurse.utility.JsonHelper;

public class PortDataHandler extends DataHandlerBase {
	private static final String getDefaultPort = "getDefaultPort";
	private static final String getInsertPort = "getInsertPort";
	private static final String getDefaultSmsPort = "getDefaultSmsPort";
	private static final String getInsertSmsPort = "getInsertSmsPort";
	
	
	public PortDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(PortDataHandler.getDefaultPort)){
			rep.responseResult = HandleGetDefaultPort(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(PortDataHandler.getInsertPort)){
			rep.responseResult = HandleGetInsertPort(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(PortDataHandler.getDefaultSmsPort)){
			rep.responseResult = HandleGetDefaultSmsPort(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(PortDataHandler.getInsertSmsPort)){
			rep.responseResult = HandleGetInsertSmsPort(req.requestParams);
		}
	}
		
	
	private String HandleGetDefaultPort(String requestParams) {
		
		String result = "fail to get default port";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
			int monitorUnitId = Integer.parseInt(paras[0]);
			int portNo = Integer.parseInt(paras[1]);

			ArrayList<Port> temp = PortProvider.getInstance().GetDefaultPort(monitorUnitId, portNo);
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleGetInsertPort(String requestParams) {
		
		String result = "fail to get insert port";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
			int portId = Integer.parseInt(paras[0]);
			int monitorUnitId = Integer.parseInt(paras[1]);
			int portNo = Integer.parseInt(paras[2]);
			int portType = Integer.parseInt(paras[3]);
			String setting = paras[4];
			String portName = "COM" + portNo;
			String phoneNumber = "";
			int linkSamplerUnitId = 0;
			String description = "";
			
			if(portId < 0)
			{
				//portId = PortProvider.getInstance().GetMaxPortId();
				portId = PortProvider.getInstance().GeneratePortId();
				
				boolean bRet = PortProvider.getInstance().InsertPort(portId, monitorUnitId, portNo, portName, portType, setting, phoneNumber, linkSamplerUnitId, description);
				if(bRet)
				{
					result = String.format("%d", portId);
				}
			}
			else
			{
				boolean bRet = PortProvider.getInstance().UpdatePort(portId,monitorUnitId,portType,setting,phoneNumber);
				if(bRet)
				{
					result = String.format("%d", portId);
				}
			}

        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}

	private String HandleGetDefaultSmsPort(String requestParams) {
		
		String result = "fail to get sms port";
        
        try{
			ArrayList<SmsPort> temp = PortProvider.getInstance().GetDefaultSmsPort();
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleGetInsertSmsPort(String requestParams) {
		
		String result = "fail to get insert sms port";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
        	String portNo = paras[0];
        	String baudRate = paras[1];
			int SmsType = Integer.parseInt(paras[2]);			
			
			int nums = PortProvider.getInstance().GetSmsPortNums();
			if(nums > 0)
			{
				//已有串口参数，需要更新
				boolean bRet = PortProvider.getInstance().UpdateSmsPort(portNo, baudRate, SmsType);
				if(bRet)
				{
					result = "OK";
				}
			}
			else
			{
				//没有参数，需要插入
				boolean bRet = PortProvider.getInstance().InsertSmsPort(portNo, baudRate, SmsType);
				if(bRet)
				{
					result = "OK";
				}
			}

        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
}
