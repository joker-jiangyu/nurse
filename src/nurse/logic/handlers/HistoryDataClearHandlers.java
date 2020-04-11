package nurse.logic.handlers;

import nurse.entity.persist.IntervalClearData;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.job.JobManager;
import nurse.logic.providers.HistoryDataClearProviders;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class HistoryDataClearHandlers extends DataHandlerBase {
	
	private static final String GetAllIntervalClearData = "GetAllIntervalClearData";
	private static final String InsertIntervalClearData = "InsertIntervalClearData";
	private static final String UpdateIntervalClearData = "UpdateIntervalClearData";
	private static final String DeleteIntervalClearData = "DeleteIntervalClearData";
	private static final String ResetIntervalClearData = "ResetIntervalClearData";

	public HistoryDataClearHandlers() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HistoryDataClearHandlers.GetAllIntervalClearData))
		{
			rep.responseResult = HandleGetAllIntervalClearData(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HistoryDataClearHandlers.InsertIntervalClearData))
		{
			rep.responseResult = HandleInsertIntervalClearData(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HistoryDataClearHandlers.UpdateIntervalClearData))
		{
			rep.responseResult = HandleUpdateIntervalClearData(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HistoryDataClearHandlers.DeleteIntervalClearData))
		{
			rep.responseResult = HandleDeleteIntervalClearData(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HistoryDataClearHandlers.ResetIntervalClearData))
		{
			rep.responseResult = HandleResetIntervalClearData(req.requestParams);
		}
	}

	private String HandleGetAllIntervalClearData(String requestParams) {
		return JsonHelper.ListjsonString("ret", HistoryDataClearProviders.getInstance().getAllIntervalClearData());
	}

	private String HandleInsertIntervalClearData(String requestParams) {
		// requestParams => Name|ClearObject|Delay|Period|StorageDays|StorageCols|Status
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		IntervalClearData icd = new IntervalClearData();
		icd.name = split[0];
		icd.clearObject = split[1];
		icd.delay = Long.parseLong(split[2]);
		icd.period = Long.parseLong(split[3]);
		icd.storageDays = Integer.parseInt(split[4]);
		icd.storageCols = split[5];
		icd.status = Integer.parseInt(split[6]);
		
		if(HistoryDataClearProviders.getInstance().insertIntervalClearData(icd))
			return "OK";
		else
			return "ERROR";
	}

	private String HandleUpdateIntervalClearData(String requestParams) {
		// requestParams => Id|Name|ClearObject|Delay|Period|StorageDays|StorageCols|Status
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		IntervalClearData icd = new IntervalClearData();
		icd.id = Integer.parseInt(split[0]);
		icd.name = split[1];
		icd.clearObject = split[2];
		icd.delay = Long.parseLong(split[3]);
		icd.period = Long.parseLong(split[4]);
		icd.storageDays = Integer.parseInt(split[5]);
		icd.storageCols = split[6];
		icd.status = Integer.parseInt(split[7]);
		
		if(HistoryDataClearProviders.getInstance().updateIntervalClearData(icd))
			return "OK";
		else
			return "ERROR";
	}

	private String HandleDeleteIntervalClearData(String requestParams) {
		// requestParams => Id
		if(HistoryDataClearProviders.getInstance().deleteIntervalClearData(requestParams))
			return "OK";
		else
			return "ERROR";
	}
	
	private String HandleResetIntervalClearData(String requestParams){
		JobManager.getInstance().restart();
		return "OK";
	}
}
