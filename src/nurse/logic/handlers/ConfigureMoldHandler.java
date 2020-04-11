package nurse.logic.handlers;

import nurse.entity.persist.ConfigureMold;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.ConfigureMoldProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;
import org.json.JSONArray;

public class ConfigureMoldHandler extends DataHandlerBase {

	private static final String GetAllConfigureMold = "GetAllConfigureMold";
	private static final String GetShowConfigureMold = "GetShowConfigureMold";
	private static final String UpdateConfigureMold = "UpdateConfigureMold";
	private static final String DeleteConfigureMold = "DeleteConfigureMold";
	private static final String InsertConfigureMold = "InsertConfigureMold";
	private static final String SortConfigureMold = "SortConfigureMold";
	private static final String VisibleConfigureMold = "VisibleConfigureMold";
	private static final String GetPartEquipments = "GetPartEquipments";
	private static final String ExportAllConfiguration = "ExportAllConfiguration";
	private static final String ExportCurrentConfiguration = "ExportCurrentConfiguration";
	private static final String ImportAllConfiguration = "ImportAllConfiguration";
	private static final String ImportCurrentConfiguration = "ImportCurrentConfiguration";

	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.GetAllConfigureMold)){
			rep.responseResult = HandleGetAllConfigureMold(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.GetShowConfigureMold)){
			rep.responseResult = HandleGetShowConfigureMold(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.UpdateConfigureMold)){
			rep.responseResult = HandleUpdateConfigureMold(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.DeleteConfigureMold)){
			rep.responseResult = HandleDeleteConfigureMold(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.InsertConfigureMold)){
			rep.responseResult = HandleInsertConfigureMold(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.SortConfigureMold)){
			rep.responseResult = HandleSortConfigureMold(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.VisibleConfigureMold)){
			rep.responseResult = HandleVisibleConfigureMold(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.GetPartEquipments)){
			rep.responseResult = HandleGetPartEquipments(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.ExportAllConfiguration)){
			rep.responseResult = HandleExportAllConfiguration(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.ExportCurrentConfiguration)){
			rep.responseResult = HandleExportCurrentConfiguration(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.ImportAllConfiguration)){
			rep.responseResult = HandleImportAllConfiguration(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ConfigureMoldHandler.ImportCurrentConfiguration)){
			rep.responseResult = HandleImportCurrentConfiguration(req.requestParams);
		}
	}

	private String HandleGetAllConfigureMold(String requestParams){
		return JsonHelper.ListjsonString("ret", ConfigureMoldProvider.getInstance().GetAllConfigureMold());
	}
	
	private String HandleGetShowConfigureMold(String requestParams){
		return JsonHelper.ListjsonString("ret", ConfigureMoldProvider.getInstance().GetShowConfigureMold());
	}
	
	private String HandleUpdateConfigureMold(String requestParams){
		//requestParams => configId|configName|fontChart|configUrl|equipmentId|displayIndex|displayType|parentId|visible
		try {
			String[] split = Base64Helper.decode(requestParams).split("\\|");
			ConfigureMold cm = new ConfigureMold();
			cm.configId = Integer.parseInt(split[0]);
			cm.configName = split[1];
			cm.fontChart = split[2];
			cm.configUrl = split[3];
			cm.equipmentId = split[4];
			cm.displayIndex = Integer.parseInt(split[5]);
			cm.displayType = Boolean.parseBoolean(split[6]);
			cm.parentId = split[7];
			cm.visible = Boolean.parseBoolean(split[8]);

			ConfigureMoldProvider.getInstance().UpdateConfigureMold(cm);
			
			return "OK";
		} catch (Exception e) {
			return "ERROR";
		}
	};
	
	private String HandleDeleteConfigureMold(String requestParams){
		//requestParams => configId
		try {
			ConfigureMoldProvider.getInstance().DeleteConfigureMold(requestParams);
			return "OK";
		} catch (Exception e) {
			return "ERROR";
		}
	}
	
	private String HandleInsertConfigureMold(String requestParams){
		//requestParams => configId ? 新增子节点 : 新增父节点
		int parentId = requestParams.equals("") || requestParams.equals("undefined") ? -1 : Integer.parseInt(requestParams);
		ConfigureMoldProvider.getInstance().InsertConfigureMold(parentId);
		return "OK";
	}
	
	private String HandleSortConfigureMold(String requestParams){
		//requestParams => direction|configId
		String[] split = requestParams.split("\\|");
		String direction = split[0];//up / down
		int configId = Integer.parseInt(split[1]);
		ConfigureMoldProvider.getInstance().SortConfigureMold(direction,configId);
		return "OK";
	}
	
	private String HandleVisibleConfigureMold(String requestParams){
		//requestParams => configId|visible
		String[] split = requestParams.split("\\|");
		int configId = Integer.parseInt(split[0]);
		int visible = Boolean.parseBoolean(split[1])?1:0;
		ConfigureMoldProvider.getInstance().VisibleConfigureMold(configId,visible);
		return "OK";
	}
	
	private String HandleGetPartEquipments(String requestParams){
		//requestParams => ParentId
		return JsonHelper.ListjsonString("ret", ConfigureMoldProvider.getInstance().GetPartEquipments(requestParams));
	}


	private String HandleExportAllConfiguration(String requestParams) {
		return ConfigureMoldProvider.getInstance().exportAllConfiguration();
	}

	private String HandleExportCurrentConfiguration(String requestParams) {
		//requestParams => configId
		return ConfigureMoldProvider.getInstance().exportCurrentConfiguration(requestParams);
	}

	private String HandleImportAllConfiguration(String requestParams) {
		//requestParams => OldDeviceId|OldBaseTypeId-NewDeviceId|NewDeviceName|NewParentId|NewBaseTypeId|NewUrl|OldOtherDeviceId1>NewOtherDeviceId1.OldOtherDeviceId2>NewOtherDeviceId2+
		//JSONArray oldConfigure = ConfigureMoldProvider.getInstance().getConfigurationJson();
		JSONArray newConfigure = ConfigureMoldProvider.getInstance().parseImportConfiguration(requestParams);

		return ConfigureMoldProvider.getInstance().importAllConfiguration(newConfigure);
	}

	private String HandleImportCurrentConfiguration(String requestParams) {
		//requestParams => configId
		return "";
	}
}
