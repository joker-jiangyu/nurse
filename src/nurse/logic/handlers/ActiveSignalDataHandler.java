package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.RealData;
import nurse.entity.persist.SignalMeanings;
import nurse.entity.persist.ThermalSensors;
import nurse.entity.trasfer.BindingSignal;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.view.ActiveSignalBrief;
import nurse.logic.providers.ActiveSignalProvider;
import nurse.logic.providers.ConfigCache;
import nurse.logic.providers.RealDataProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class ActiveSignalDataHandler extends DataHandlerBase {

	private static final String GetActiveSignalByDevice = "getActiveSignalByDevice";
	private static final String GetPowerData = "getPowerData";
	private static final String GetPowerKpi = "getPowerKpi";
	private static final String GetTempData = "getTempData";
	private static final String UpdateTemperature = "UpdateTemperature";
	private static final String GetCabinetInfoById = "getCabinetInfoById";
	private static final String GetAisleThermalHumidity = "getAisleThermalHumidity";

	public static RealDataProvider proxy = null;
	private static Logger log = Logger.getLogger(ActiveSignalDataHandler.class);
	private static HashMap<String, ActiveSignal> hasActiveSignal = new HashMap<String, ActiveSignal>();
	private static ArrayList<ActiveSignal> listActiveSignals = new ArrayList<ActiveSignal>();
	private static HashMap<String, CabinetDeviceMap> hashCabinets = new HashMap<String, CabinetDeviceMap>();
	private static HashMap<String, List<CabinetDeviceMap>> CabinetDeviceHashMap = new HashMap<String, List<CabinetDeviceMap>>();

	public ActiveSignalDataHandler() {
		proxyIntance();
	}

	public static void closeHashMap() {
		CabinetDeviceHashMap = new HashMap<String, List<CabinetDeviceMap>>();
	}

	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveSignalDataHandler.GetActiveSignalByDevice)) {
			rep.responseResult = HandleGetActiveSignalByDevice(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveSignalDataHandler.GetPowerData)) {
			rep.responseResult = HandleGetPowerData(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveSignalDataHandler.GetPowerKpi)) {
			rep.responseResult = HandleGetPowerKpi(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveSignalDataHandler.GetTempData)) {
			rep.responseResult = HandleGetTempData(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveSignalDataHandler.UpdateTemperature)) {
			rep.responseResult = HandleUpdateTemperature(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveSignalDataHandler.GetCabinetInfoById)) {
			rep.responseResult = HandleGetCabinetInfoById(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ActiveSignalDataHandler.GetAisleThermalHumidity)) {
			rep.responseResult = HandleGetAisleThermalHumidity(req.requestParams);
		}
	}

	private String HandleGetActiveSignalByDevice(String requestParams) {

		int deviceId = CabinetDeviceMap.parseInt(requestParams);
		// List<ActiveSignal> rs = convertActiveSignal(deviceId);
		List<ActiveSignal> rs = ConfigCache.getInstance().getActiveDeviceSignal(deviceId);
		ArrayList<ActiveSignalBrief> asbs = new ArrayList<ActiveSignalBrief>();

		if (rs != null) {
			for (ActiveSignal s : rs) {
				asbs.add(ActiveSignalBrief.From(s));
			}
		}
		// 根据displayIndex排序
		Collections.sort(asbs);
		return JsonHelper.ListjsonString("ret", asbs);
	}

	public ArrayList<ActiveSignal> getActiveSignalFromBinding(ArrayList<BindingSignal> bss, int deviceId) {

		List<ActiveSignal> ss = convertActiveSignal(deviceId);
		ArrayList<ActiveSignal> res = new ArrayList<ActiveSignal>();

		for (BindingSignal bs : bss) {
			Optional<ActiveSignal> found = ss.stream().filter(sig -> bs.matchSignal(sig)).findFirst();
			if (found.isPresent()) {
				ActiveSignal as = found.get();
				res.add(as);
			} else {
				ActiveSignal as = getSignalDefaultData(bs);
				if (as == null)
					continue;
				else
					res.add(as);
			}
		}

		return res;
	}

	private void proxyIntance() {
		if (proxy == null) {
			proxy = new RealDataProvider();
			proxy.start();
			proxy.init(5999, 5888);
		}

	}

	private List<ActiveSignal> convertActiveSignal(int equipId) {
		if (proxy == null)
			proxy = new RealDataProvider();
		List<ActiveSignal> activeSignals = null;
		try {
			List<RealData> realDatas = proxy.GetData(equipId);
			System.out.println("EquipmentId:"+equipId+", Data Size:"+realDatas.size());
			if (realDatas == null)
				return null;
			activeSignals = new ArrayList<ActiveSignal>();
			ActiveSignal as = new ActiveSignal();
			for (RealData rd : realDatas) {
				if (rd.BaseTypeId == 0)
					continue;
				String key = String.valueOf(rd.EquipId).concat(String.valueOf(rd.SignalId));
				if (hasActiveSignal.containsKey(key)) {
					as = hasActiveSignal.get(key);
					if (as.SignalCategory == 2 && as.floatValue != rd.FloatValue) {
						as.meanings = GetMeanings(rd, as.equipmentTemplateId);
					}
					as.floatValue = rd.FloatValue;
					as.updateTime = rd.SamplerTime;// 时间
					as.setAlarmSeverity(rd.EventSeverity);// 状态
					activeSignals.add(as);
					continue;
				}
				as = setRealDataProperty(rd);
				hasActiveSignal.put(key, as);
				activeSignals.add(as);
			}
			// sort by displayIndex;
			activeSignals.sort((a, b) -> Integer.compare(a.displayIndex, b.displayIndex));

		} catch (Exception e) {
			log.error("Conversion exception:" + e);
		}
		return activeSignals;
	}

	private ActiveSignal setRealDataProperty(RealData rd) {
		ActiveSignal result = ConfigCache.getInstance().getActiveSignal(rd.EquipId, rd.SignalId);
		if (result == null)
			return null;

		result.setAlarmSeverity(rd.EventSeverity);
		result.setUpdateTime(rd.SamplerTime);
		result.setFloatValue(rd.FloatValue);

		SignalMeanings sm = ConfigCache.getInstance().getSignalMeanings(result.equipmentTemplateId, rd.SignalId,
				(short) rd.FloatValue);

		if (sm != null)
			result.setMeanings(sm.Meanings);

		return result;
	}

	private String GetMeanings(RealData rd, int equipmentTemplateId) {
		String result = "";
		SignalMeanings sm = ConfigCache.getInstance().getSignalMeanings(equipmentTemplateId, rd.SignalId,
				(short) rd.FloatValue);
		if (sm != null)
			result = sm.Meanings;
		return result;
	}

	/** 给环境量与信号量添加默认值 */
	private ActiveSignal getSignalDefaultData(BindingSignal bs) {
		ActiveSignal as = null;
		String key = String.valueOf(bs.deviceId).concat(String.valueOf(bs.baseTypeId));
		Optional<ActiveSignal> findFirst = listActiveSignals.stream()
				.filter(item -> item.baseTypeId == bs.baseTypeId && item.deviceId == bs.deviceId).findFirst();
		if (!hasActiveSignal.containsKey(key)) {
			if (findFirst.isPresent()) {
				as = findFirst.get();
				as.setAlarmSeverity(-255);
				as.setUpdateTime(new Date());
				as.setFloatValue(0.0f);
				as.setMeanings("---");
				hasActiveSignal.put(key, as);
			} else {
				listActiveSignals = ConfigCache.getInstance().getAllActiveSignals();
			}
		} else
			as = hasActiveSignal.get(key);
		return as;
	}

	/**
	 * 获得配电实时电流数据
	 * 
	 * @param
	 * @return
	 */
	private String HandleGetPowerData(String jsonParams) {
		List<CabinetDeviceMap> CabinetDeviceMapList = new ArrayList<CabinetDeviceMap>();
		try {
			String[] split = jsonParams.split("\\|");
			if (split.length != 2)
				return JsonHelper.ListjsonString("ret", CabinetDeviceMapList);
			String mdcId = split[0];
			jsonParams = split[1];
			if (CabinetDeviceHashMap.containsKey(mdcId))
				CabinetDeviceMapList = CabinetDeviceHashMap.get(mdcId);
			else
				CabinetDeviceMapList = CabinetDeviceMap.getJsonListCabinet(jsonParams);

			if (CabinetDeviceMapList == null || CabinetDeviceMapList.size() == 0)
				return JsonHelper.ListjsonString("ret", CabinetDeviceMapList);

			Set<Integer> deviceIds = ActiveSignalProvider.getInstance().groupedByCabinetId(mdcId, CabinetDeviceMapList);
			List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
			for (Integer equipId : deviceIds) {
				ArrayList<ActiveSignal> tmpList = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
				if (tmpList != null) {
					activeSignals.addAll(tmpList);
				}
			}

			if (activeSignals != null) {
				for (CabinetDeviceMap cd : CabinetDeviceMapList) {
					if (hashCabinets.containsKey(cd.cabinetId)) {
						CabinetDeviceMap cdm = hashCabinets.get(cd.cabinetId);
						double power = ActiveSignalProvider.getInstance().getPowerBySingal(cd, activeSignals);
						if (cdm.power != power && power != 0)
							cdm.power = power;
						cd.power = cdm.power;
						continue;
					}
					hashCabinets.put(cd.cabinetId, cd);
				}
			}
			CabinetDeviceHashMap.put(mdcId, CabinetDeviceMapList);
		} catch (Exception e) {
			log.error("get power data exception:" + e);
		}
		return JsonHelper.ListjsonString("ret", CabinetDeviceMapList);
	}

	private String HandleGetPowerKpi(String jsonParams) {

		JSONObject param = new JSONObject(jsonParams);
		String mdcId = param.getString("mdcId");

		Set<Integer> devcdids = ActiveSignalProvider.getInstance().groupsPowerKpi(mdcId, param);

		List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
		if (devcdids != null) {
			for (Integer equipId : devcdids) {
				ArrayList<ActiveSignal> tmpList = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
				if (tmpList != null) {
					activeSignals.addAll(tmpList);
				}
			}
		}

		String mPueDataList = ActiveSignalProvider.getInstance().getmPueDataList(mdcId);
		double mPueData = ActiveSignalProvider.getInstance().getmPueData(mdcId, activeSignals);
		String itLoadDataList = ActiveSignalProvider.getInstance().getItLoadDataList(mdcId, activeSignals);
		double totalPower = ActiveSignalProvider.getInstance().getTotalPower(mdcId, activeSignals);
		String maxPower = param.getString("maxPower");
		double totalElectricity = ActiveSignalProvider.getInstance().getTotalElectricity(mdcId, activeSignals);

		// 3.拼接返回
		StringBuffer sb = new StringBuffer();
		sb.append("{");
		sb.append(String.format("\"mdcId\":\"%s\",", mdcId));
		sb.append(String.format("\"mPueDataList\":{%s},", mPueDataList));
		sb.append(String.format("\"mPueData\":{\"value\":\"%s\"},", mPueData));
		sb.append(String.format("\"itLoadDataList\":[%s],", itLoadDataList));
		sb.append(String.format("\"totalPower\":{\"value\":\"%s\"},", totalPower));
		sb.append(String.format("\"maxPower\":\"%s\",", maxPower));
		sb.append(String.format("\"totalElectricity\":{\"value\":\"%s\"}", totalElectricity));
		sb.append("}");
		return sb.toString();
	}

	private String HandleGetTempData(String requestParams) {
		requestParams = Base64Helper.decode(requestParams);
		String[] splits = requestParams.split("\\+");
		if (splits.length < 2)
			return "";
		String mdcId = splits[0];

		Set<Integer> devcdids = ActiveSignalProvider.getInstance().getMapTempList(mdcId, splits[1]);
		List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
		for (Integer equipId : devcdids) {
			ArrayList<ActiveSignal> ads = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
			if (ads != null)
				activeSignals.addAll(ads);
		}
		String result = ActiveSignalProvider.getInstance().getTempDataString(mdcId, activeSignals);
		return Base64Helper.encode(result);
	}

	private String HandleUpdateTemperature(String jsonParams) {
		List<ThermalSensors> tsList = ActiveSignalProvider.getInstance().getThermalSensorsList(jsonParams);

		Set<Integer> devcdids = ActiveSignalProvider.getInstance().getTemperatureDeviceids(tsList);
		List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
		for (Integer equipId : devcdids) {
			ArrayList<ActiveSignal> ads = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
			if (ads != null)
				activeSignals.addAll(ads);
		}
		String result = ActiveSignalProvider.getInstance().getTemperatureJson(tsList, activeSignals);
		return result;
	}

	private String HandleGetCabinetInfoById(String requestParams) {
		String[] splits = requestParams.split("\\|");
		if (splits.length == 2) {
			String mdcId = splits[0];
			String cabinetId = splits[1];

			String regEx = "[^0-9]";
			Pattern p = Pattern.compile(regEx);
			Matcher m = p.matcher(cabinetId);
			int number = CabinetDeviceMap.parseInt(m.replaceAll("").trim());

			String id = (number < 10) ? String.format("0%s", number) : String.valueOf(number);

			Set<Integer> deviceIds = ActiveSignalProvider.getInstance().getDeviceIdByCabinet(mdcId, id);
			ArrayList<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
			for (Integer equipId : deviceIds) {
				ArrayList<ActiveSignal> ads = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
				if (ads != null)
					activeSignals.addAll(ads);
			}
			return ActiveSignalProvider.getInstance().getCabinetInfoById(mdcId, id, activeSignals);
		}
		return "{\"ret\":{\"ratedPower\":0,\"activePower\":0,\"cabinetBottomTemperature\":0,\"cabinetMiddleTemperature\":0,\"cabinetTopTemperature\":0}}";
	}

	private String HandleGetAisleThermalHumidity(String requestParams){
		//requestParams => MdcId
		return JsonHelper.ListjsonString("ret", ActiveSignalProvider.getInstance().getAisleThermalHumidity(requestParams));
	}
	
}
