package nurse.logic.handlers;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Comparator;

import nurse.entity.persist.*;
import nurse.logic.providers.MdcHistoryDataProvider;
import org.json.JSONArray;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.view.HisData;
import nurse.entity.view.SignalPara;
import nurse.logic.providers.ConfigCache;
import nurse.logic.providers.SignalProvider;
import nurse.utility.JsonHelper;

public class HisDataDataHandler  extends DataHandlerBase {

	private static final String GetHisDatas = "getHisDatas";
	private static final String GetAllSignalParas = "getAllSignalParas";

	private static final String GetHistorySignalByDevice = "GetHistorySignalByDevice";

	public HisDataDataHandler() {
	}

	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisDataDataHandler.GetHisDatas))
		{
			rep.responseResult = handleGetHisDatas(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisDataDataHandler.GetAllSignalParas))
		{
			rep.responseResult = handleGetAllSignalParas(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisDataDataHandler.GetHistorySignalByDevice))
		{
			rep.responseResult = handleGetHistorySignalByDevice(req.requestParams);
		}
	}

	private String handleGetAllSignalParas(String requestParams) {
		
		//ArrayList<SignalInstance> sis = SignalProvider.getInstance().getAllSignalInstances();
		ArrayList<SignalInstance> sis = getSignalInstancesFromCache();
		JSONArray ars = SignalPara.GetArrayFromInstances(sis);
		
		return ars.toString();
	}

	private ArrayList<SignalInstance> getSignalInstancesFromCache() {

		ArrayList<ActiveSignal> ass = ConfigCache.getInstance().getAllActiveSignals();
		ArrayList<SignalInstance> sis = new ArrayList<SignalInstance>();
		
		for(ActiveSignal as : ass){
			SignalInstance si = new SignalInstance();
			sis.add(si);
			
			si.baseTypeId = as.baseTypeId;
			si.deviceId = as.deviceId;
			si.deviceName = as.deviceName;
			si.equipmentTemplateId = as.equipmentTemplateId;
			si.showPrecision = as.showPrecision;
			si.signalId = as.signalId;
			si.signalName = as.signalName;
			si.unit = as.unit;
		}
		
		sis.sort(new Comparator<SignalInstance>(){
			@Override
			public int compare(SignalInstance a, SignalInstance b) {
				return a.signalName.compareTo(b.signalName);
			}			
		});
		
		return sis;
	}

	private String handleGetHisDatas(String requestParams) {

		String[] ss = requestParams.split("\\|");
		
		Timestamp ts1 = Timestamp.valueOf(ss[1]);
		Timestamp ts2 = Timestamp.valueOf(ss[2]);
		
		Date startTime = new Date(ts1.getTime());
		Date endTime = new Date(ts2.getTime()+ (1000 * 60 * 60 * 24));		
		
		ArrayList<HistorySignal> hss = SignalProvider.getInstance().getHistorySignals(ss[0], startTime, endTime);
		ArrayList<HisData> hds = HisData.GetArrayFromInstances(hss);
		
		return 	JsonHelper.ListjsonString("ret", hds);
	}

	private String handleGetHistorySignalByDevice(String requestParams){
		//requestParams => deviceId|day
		try{
			String[] split = requestParams.split("\\|");
			int deviceId = Integer.parseInt(split[0]);
			int day = Integer.parseInt(split[1]);

			ArrayList<DeviceChartMap> chartMaps = MdcHistoryDataProvider.getInstance().getHistorySignalByDevice(deviceId,day);
			return JsonHelper.ListjsonString("ret",chartMaps);

		}catch (Exception ex){
			return 	JsonHelper.ListjsonString("ret", new ArrayList<HisData>());
		}
	}
}
