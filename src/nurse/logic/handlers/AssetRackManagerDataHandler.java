package nurse.logic.handlers;

import java.util.ArrayList;


import nurse.entity.persist.AssetsManager;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.AssetRackManagerProvider;
import nurse.logic.providers.SystemSettingProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class AssetRackManagerDataHandler extends DataHandlerBase {
	private static final String SELECTALLRACK = "SelectAllRack";
	private static final String SELECTALLCABINET = "SelectAllCabinet";
	private static final String GETIPADDRESS = "GetIpAddress";
	private static final String CONTROLRACK = "ControlRack";
	private static final String INSERTCABINETRACK = "InsertCabinetRack";
	private static final String DELETERACK = "DeleteRack";
	private static final String FORCEDENDALARM = "ForcedEndAlarm";
	private static final String UPDATERACK = "UpdateRack";
	private static final String SELECTASSETSMANAGER = "SelectAssetsManager";
	private static final String UPDATEASSETSMANAGER = "UpdateAssetsManager";
	private static final String DELETEASSETSMANAGER = "DeleteAssetsManager";
	private static final String QUERYASSETSMANAGERLOG = "QueryAssetsManagerLog";

	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.SELECTALLRACK)) {
			rep.responseResult = HandleSelectAllRack(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.SELECTALLCABINET)) {
			rep.responseResult = HandleSelectAllCabinet(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.GETIPADDRESS)) {
			rep.responseResult = HandleGetIpAddress(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.CONTROLRACK)) {
			rep.responseResult = HandleControlRack(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.INSERTCABINETRACK)) {
			rep.responseResult = HandleInsertCabinetRack(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.DELETERACK)) {
			rep.responseResult = HandleDeleteRack(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.FORCEDENDALARM)) {
			rep.responseResult = HandleForcedEndAlarm(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.UPDATERACK)) {
			rep.responseResult = HandleUpdateRack(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.SELECTASSETSMANAGER)) {
			rep.responseResult = HandleSelectAssetsManager(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.UPDATEASSETSMANAGER)) {
			rep.responseResult = HandleUpdateAssetsManager(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.DELETEASSETSMANAGER)) {
			rep.responseResult = HandleDeleteAssetsManager(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetRackManagerDataHandler.QUERYASSETSMANAGERLOG)) {
			rep.responseResult = HandleQueryAssetsManagerLog(req.requestParams);
		}
	}
	
	
	private String HandleSelectAllRack(String requestParams){
		return JsonHelper.ListjsonString("ret", AssetRackManagerProvider.getInstance().SelectAllRack());
	}
	
	private String HandleSelectAllCabinet(String requestParams){
		return JsonHelper.ListjsonString("ret", AssetRackManagerProvider.getInstance().SelectAllCabinet());
	}
	
	private String HandleGetIpAddress(String requestParams){
		return SystemSettingProvider.getInstance().getWinLinuxIpAddress();
	}
	
	private String HandleControlRack(String requestParams){
		/*AssetRackManagerProvider.getInstance().SendRackServers(10001002, "FE FE 00 08 A9 2A 3D 95 22 20 70 00");
		
		AssetRackManagerProvider.getInstance().printDataMaps();*/
		//System.out.println("已下发控制");
		//return CabinetRackUtility.getInstance().SendInfo("FE FE 00 08 A9 2A 3D 95 22 20 70 00");
		return "OK";
	}
	
	private String HandleInsertCabinetRack(String requestParams){
		// requestParams => CabinetId|IP|Port|DeviceId
		String decode = Base64Helper.decode(requestParams);
		String[] split = decode.split("\\|");
		if(AssetRackManagerProvider.getInstance().InsertCabinetRack(split[0], split[1], split[2]))
			return "OK";
		else
			return "ERROR";
	}
	
	private String HandleDeleteRack(String requestParams){
		// requestParams => CabinetId
		//Succeed | ServerNotExistence | Error
		return AssetRackManagerProvider.getInstance().DeleteCabinetRack(requestParams);
	}
	
	private String HandleForcedEndAlarm(String requestParams){
		// requestParams => CabinetId
		AssetRackManagerProvider.getInstance().ForcedEndAlarm(requestParams);
		return "Succeed";
	}
	
	private String HandleUpdateRack(String requestParams){
		// requestParams => RackId|CabinetId|RackIp|RackMask|RackGateway|RackPort|ServerIP|ServerPort|DeviceId|UsedDate|Monitoring
		String decode = Base64Helper.decode(requestParams);
		String[] split = decode.split("\\|");
		if(split.length < 11) return "ParameterError";
		
		if(AssetRackManagerProvider.getInstance().UpdateCabinetRack(split[0],split[1],split[2],split[3],split[4],split[5],split[6],split[7],split[8],split[9],split[10]))
			return "Succeed";
		else
			return "Error";
	}
	
	private String HandleSelectAssetsManager(String requestParams){
		// requestParams => CabinetId
		if(requestParams.equals("undefined")) return JsonHelper.ListjsonString("ret", new ArrayList<AssetsManager>());
		
		return JsonHelper.ListjsonString("ret", AssetRackManagerProvider.getInstance().SelectAssetsManager(requestParams));
	}
	
	private String HandleUpdateAssetsManager(String requestParams){
		// requestParams => AssetsId|AssetsCode|CabinetId|AssetsName|AssetsStyle|EquipmentId|UsedDate|UIndex|UHeight|Description
		String decode = Base64Helper.decode(requestParams);
		String[] split = decode.split("\\|");
		String descrption = split.length < 10 ? null : split[9];
		
		if(AssetRackManagerProvider.getInstance().UpdateAssetsManager(split[0],split[1],split[2],split[3],split[4],split[5],split[6],split[7],split[8],descrption))
			return "Succeed";
		else
			return "Error";
	}
	
	private String HandleDeleteAssetsManager(String requestParams){
		// requestParams => CabinetId|UIndex|UHeight
		String[] split = requestParams.split("\\|");
		
		if(AssetRackManagerProvider.getInstance().DeleteAssetsManager(split[0],split[1],split[2]))
			return "Succeed";
		else
			return "Error";
	}
	
	private String HandleQueryAssetsManagerLog(String requestParams){
		// requestParams => StartDate|EndDate
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		return AssetRackManagerProvider.getInstance().QueryAssetsManagerLog(split[0],split[1]);
	}
}
