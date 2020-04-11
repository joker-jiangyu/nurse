package nurse.webServer;

import java.util.ArrayList;
import java.util.HashMap;

import nurse.utility.HandlerConfigHelper;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import nurse.entity.conf.DataHandlerConfig;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.handlers.DataHandlerBase;
import nurse.utility.MainConfigHelper;

public class RestFacade {

	private Logger log = Logger.getLogger(RestFacade.class);
	private static RestFacade instance = new RestFacade();
	
	private HashMap<String, DataHandlerBase> handlerMap = new HashMap<String, DataHandlerBase>();
	
	public static RestFacade getInstance(){
		return instance;
	}
	
	//load handlers
	public RestFacade (){
		//ArrayList<DataHandlerConfig> cfgs = MainConfigHelper.getDataHandlerConfig();
		ArrayList<DataHandlerConfig> cfgs = HandlerConfigHelper.getDataHandlerConfig();
	
		for(DataHandlerConfig dhc : cfgs)
		{
			if (handlerMap.containsKey(dhc.Namespace)) continue;
			
			try
			{
				Class<?> broker = Class.forName(dhc.ClassName);
				handlerMap.put(dhc.Namespace, (DataHandlerBase)(broker.newInstance()));
			}catch (Exception ex)
			{
				log.debug(ex);
				continue;
			}
		}
	}
	
	public String Call(String reqJsonStr, String inetIp) {
		
		ArrayList<HttpDataExchange> results = new ArrayList<HttpDataExchange>();
		ArrayList<HttpDataExchange> requests = parseToList(reqJsonStr);
		
		for(HttpDataExchange hde : requests)
		{
			HttpDataExchange result = HandleData(hde, inetIp);
			
			if (result == null)
			{
				result = MainConfigHelper.getReponse(hde);
			}
			
			if (result != null) results.add(result);
		}
		
		String res = BuildJsonString(results);
		return res;
	}
	
	private String BuildJsonString(ArrayList<HttpDataExchange> results) {
		JSONArray arr = new JSONArray();
		
		for(HttpDataExchange hde : results)
		{
			JSONObject jo = new JSONObject();
			jo.put("K", hde.responseCommand);
			jo.put("V", hde.responseResult);
			
			arr.put(jo);
		}

		return arr.toString();
	}

	private ArrayList<HttpDataExchange> parseToList(String reqJsonStr)
	{
		ArrayList<HttpDataExchange> hdes = new ArrayList<HttpDataExchange>();
		try {
			if(reqJsonStr == null || reqJsonStr.equals("")) return hdes;
			JSONObject obj = new JSONObject(reqJsonStr);  
			JSONArray arr = obj.getJSONArray("data");  
			
			
			for(int i=0;i<arr.length();i++)
			{
				String reqCmd,reqParam;
				try{
					
					reqCmd = arr.getJSONObject(i).getString("K");
					reqParam = arr.getJSONObject(i).isNull("V") == true ? null : arr.getJSONObject(i).getString("V");
					
				}catch(Exception e)
				{
					log.error("JSONObject ERROR:"+arr.getJSONObject(i).toString());
					log.warn(e);
					continue;
				}
				
				HttpDataExchange hde = new HttpDataExchange(reqCmd, reqParam, null);
				
				hdes.add(hde);
			}
		} catch (Exception e) {
			log.error("JSONString ERROR:"+reqJsonStr);
			log.error("Incorrect Format:",e);
		}
		return hdes;
	}
	
	private String GetNamespace(String requestCommand)
	{
		int i = requestCommand.indexOf('.');
		if (i<=0) return null;
		
		return requestCommand.substring(0,i);
	}
	

	private HttpDataExchange HandleData(HttpDataExchange req, String inetIp) {
		
		DataHandlerBase dh = handlerMap.get(GetNamespace(req.requestCommand));
		
		if (dh == null) return null;
		
		HttpDataExchange res = dh.Handle(req, inetIp);
		return res;
	}

}
