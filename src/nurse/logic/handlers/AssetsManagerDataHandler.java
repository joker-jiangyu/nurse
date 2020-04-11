package nurse.logic.handlers;


import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.entity.persist.AssetsManager;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.AssetsManagerProviders;
import nurse.logic.providers.KPIBagProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class AssetsManagerDataHandler extends DataHandlerBase {
	private static final Logger log = Logger.getLogger(AssetsManagerDataHandler.class);
	private static final String GET_ALL_ASSETS_INFO = "getAllAssetsInfo";
	private static final String ADD_NEW_ASSETSINFO = "addNewAssetsInfo";
	private static final String DEL_ASSETS_BYASSETSID = "delAssetsByAssetsId";
	private static final String EDIT_ASSETS_INFO = "editAssetsInfo";
	private static final String GET_CABINET_INFO = "getCabinetInfo";
	private static final String ONEKEY_IMPORT_MDCASSETS = "oneKeyImportMDCAssets";
	private static final String GET_MDC_CABINETUHEIGHT = "getMdcCabinetUHeight";
	
	private static final String LIKE_LIMIT_ASSETS_INFO = "likeLimitAssetsInfo";
	private static final String GET_LIKE_ASSETS_TOTALS = "getLikeAssetsTotals";

	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.GET_ALL_ASSETS_INFO)) {
			rep.responseResult = HandleGetAllAssetsInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.ADD_NEW_ASSETSINFO)) {
			rep.responseResult = HandleAddNewAssetsInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.DEL_ASSETS_BYASSETSID)) {
			rep.responseResult = HandleDelAssetsByAssetsId(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.EDIT_ASSETS_INFO)) {
			rep.responseResult = HandleEditAssetsInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.GET_CABINET_INFO)) {
			rep.responseResult = HandleGetCabinetInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.ONEKEY_IMPORT_MDCASSETS)) {
			rep.responseResult = HandleOneKeyImportMDCAssets(req.requestParams);
		}

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.GET_MDC_CABINETUHEIGHT)) {
			rep.responseResult = HandleGetMdcCabinetUHeight(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.LIKE_LIMIT_ASSETS_INFO)) {
			rep.responseResult = HandleLikeLimitAssetsInfo(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(AssetsManagerDataHandler.GET_LIKE_ASSETS_TOTALS)) {
			rep.responseResult = HandleGetLikeAssetsTotals(req.requestParams);
		}
	}

	private String HandleGetMdcCabinetUHeight(String requestParams) {
		return AssetsManagerProviders.getInstance().selectMDCCabinetUHeight();
	}

	private String HandleOneKeyImportMDCAssets(String requestParams) {
		if (AssetsManagerProviders.getInstance().impoertMDCAssets()) {
			//缓存所有KPI文件的页面所有图表内容
			KPIBagProvider.getInstance().loadKPIDataInfo();
			return JsonHelper.ListjsonString("ret", AssetsManagerProviders.getInstance().getAllAssets());
		}
		return "importMDCAssetsError";
	}

	private String HandleGetCabinetInfo(String requestParams) {
		return JsonHelper.ListjsonString("ret", AssetsManagerProviders.getInstance().getCabinetInfo());
	}

	private String HandleEditAssetsInfo(String requestParams) {
		String[] editData = Base64Helper.decode(requestParams).split("\\|");

		AssetsManager as = convert2AssetsManager(editData);
		if (AssetsManagerProviders.getInstance().updateAssetsAssetsById(as)) {
			return JsonHelper.ListjsonString("ret", AssetsManagerProviders.getInstance().getAllAssets());
		}
		return "editAssetsById Error";
	}

	private String HandleDelAssetsByAssetsId(String requestParams) {
		int assetsId = Integer.parseInt(requestParams);
		if (AssetsManagerProviders.getInstance().removeAssetsByAssetsId(assetsId)) {
			return JsonHelper.ListjsonString("ret", AssetsManagerProviders.getInstance().getAllAssets());
		}
		return "remove AssetsError";
	}

	private String HandleAddNewAssetsInfo(String requestParams) {
		String result = Base64Helper.decode(requestParams);

		AssetsManager as = convert2AssetsManager(result.split("\\|"));
		if (AssetsManagerProviders.getInstance().insertAssetsManager(as)) {
			return JsonHelper.ListjsonString("ret", AssetsManagerProviders.getInstance().getAllAssets());
		}
		return "NO";
	}

	private String HandleGetAllAssetsInfo(String requestParams) {
		return JsonHelper.ListjsonString("ret", AssetsManagerProviders.getInstance().getAllAssets());
	}

	private AssetsManager convert2AssetsManager(String[] split) {
		// requestParams => usedDate|assetType|assetStyle|equipmentId|vendor|status|responsible|
		// 					description|assetsId|assetsName|position|assetsCode
		AssetsManager as = new AssetsManager();
		as.usedDate = split.length > 0 ? Base64Helper.decode(split[0]) : "";
		as.assetType = split.length > 1 ? split[1] : "";
		as.assetStyle = split.length > 2 ? split[2] : "";
		as.equipmentId = split.length > 3 ? (split[3].equals("") || split[3].equals("undefined") ? -1 : Integer.parseInt(split[3]))  : -1;
		as.vendor = split.length > 4 ? split[4] : "";
		as.status = split.length > 5 ? split[5] : "";
		as.responsible = split.length > 6 ? split[6] : "";
		as.description = split.length > 7 ? split[7] : "";
		as.assetsId = split.length > 8 ? (split[8].equals("") || split[8].equals("undefined") ? -1 : Integer.parseInt(split[8])) : -1;
		as.assetsName = split.length > 9 ? split[9] : "";
		as.position = split.length > 10 ? Base64Helper.decode(split[10]) : "";
		as.assetsCode = split.length > 11 ? Base64Helper.decode(split[11]) : "";
		return as;
	}
	
	private String HandleLikeLimitAssetsInfo(String requestParams){
		ArrayList<AssetsManager> list = new ArrayList<AssetsManager>();
		try {
			String[] paras = Base64Helper.decode(requestParams).split("\\|");
			int index = Integer.parseInt(paras[0]);
			int size = Integer.parseInt(paras[1]);
			//AssetsCode&AssetsName&AssetType&AssetStyle&EquipmentId&Vendor&UsedDate&Responsible&Position&Status
			String param = paras[2];
			
			list = AssetsManagerProviders.getInstance().likeLimitAssetsInfo(index,size,param);
			return JsonHelper.ListjsonString("ret", list);
		} catch (Exception e) {
			return JsonHelper.ListjsonString("ret", list);
		}
	}
	
	private String HandleGetLikeAssetsTotals(String requestParams){
		String param = Base64Helper.decode(requestParams);
		return AssetsManagerProviders.getInstance().getLikeAssetsTotals(param);
	}
}
