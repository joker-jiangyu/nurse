package nurse.logic.providers;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;

import nurse.common.DataRow;
import nurse.common.DataTable;
import nurse.entity.persist.ActiveAlarm;
import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.Cabinet;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.CabinetSignalMap;
import nurse.entity.persist.MDCEnvironment;
import nurse.entity.persist.Mdc;
import nurse.entity.persist.MdcTemperature;
import nurse.entity.persist.Puerecord;
import nurse.entity.persist.ThermalSensors;
import nurse.entity.view.ActiveDevice;
import nurse.utility.DatabaseHelper;
import nurse.utility.JsonHelper;
import org.json.JSONArray;
import org.json.JSONObject;

public class MdcAlarmProvider {

	private static MdcAlarmProvider instance = new MdcAlarmProvider();
	private static Logger log = Logger.getLogger(MdcAlarmProvider.class);

	public static MdcAlarmProvider getInstance() {
		return instance;
	}

	/**
	 * 获得所有机柜信息列表
	 */
	public String getCabinetList(String mdcId) {
		DatabaseHelper dbHelper = null;
		ArrayList<CabinetDeviceMap> CabinetDeviceMapList = new ArrayList<CabinetDeviceMap>();
		if(mdcId.equals("undefined") || mdcId.equals("NA")) return JsonHelper.ListjsonString("ret", CabinetDeviceMapList);
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT ");
			sql.append("	A.Id,");
			sql.append("	D.EquipmentBaseType,");
			sql.append("	B.DeviceId,");
			sql.append("	B.DeviceName,");
			sql.append("	B.UIndex,");
			sql.append("	B.UHeight,");
			sql.append("	A.PhaseACurrentDeviceId,");
			sql.append("	A.PhaseACurrentSignalId,");
			sql.append("	A.PhaseAVoltageDeviceId,");
			sql.append("	A.PhaseAVoltageSignalId,");
			sql.append("	A.PhaseBCurrentDeviceId,");
			sql.append("	A.PhaseBCurrentSignalId,");
			sql.append("	A.PhaseBVoltageDeviceId,");
			sql.append("	A.PhaseBVoltageSignalId,");
			sql.append("	A.PhaseCCurrentDeviceId,");
			sql.append("	A.PhaseCCurrentSignalId,");
			sql.append("	A.PhaseCVoltageDeviceId,");
			sql.append("	A.PhaseCVoltageSignalId,");
			sql.append("	A.`Name`,");
			sql.append("	A.CabinetType,");
			sql.append("	A.Side,");
			sql.append("	A.RatedVoltage, ");
			sql.append("	A.RatedCurrent, ");
			sql.append("	A.Description ");
			sql.append("FROM Cabinet A ");
			sql.append("LEFT JOIN MDC_CabinetDeviceMap B ON A.Id = B.CabinetId ");
			sql.append("LEFT JOIN TBL_Equipment C ON B.DeviceId = C.EquipmentId ");
			sql.append("LEFT JOIN TBL_EquipmentTemplate D ON C.EquipmentTemplateId = D.EquipmentTemplateId ");
			sql.append("LEFT JOIN Mdc F ON A.MDCId = F.Id ");
			sql.append("WHERE F.Id = %s ORDER BY A.Id,B.UIndex;");
			DataTable dt = dbHelper.executeToTable(String.format(sql.toString(), mdcId));
			CabinetDeviceMapList = CabinetDeviceMap.fromCabinetDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return JsonHelper.ListjsonString("ret", CabinetDeviceMapList);
	}

	/**
	 * 其他环境量列表
	 */
	public String getOtherSignal(String mdcId) {
		DatabaseHelper dbHelper = null;
		List<CabinetDeviceMap> mdcEnvs = new ArrayList<CabinetDeviceMap>();
		if(mdcId.equals("undefined") || mdcId.equals("NA")) return JsonHelper.ListjsonString("ret", mdcEnvs);
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT A.*,B.EquipmentName FROM Mdc_Environment A ");
			sql.append("LEFT JOIN TBL_Equipment B ON A.EquipmentId = B.EquipmentId ");
			sql.append(String.format("WHERE A.MdcId = %s;", mdcId));
			DataTable dt = dbHelper.executeToTable(sql.toString());
			mdcEnvs = CabinetDeviceMap.fromOtherSignalDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return JsonHelper.ListjsonString("ret", mdcEnvs);
	}

	/**
	 * 获得历史mPUE
	 */
	public String getPuerecord(String mdcId) {
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		ArrayList<Puerecord> pues = new ArrayList<Puerecord>();
		String strs = "";
		String strx = "";
		StringBuffer sb = new StringBuffer();
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT UNIX_TIMESTAMP(collectTime) AS number,pue,collectTime FROM puerecord ");
			sql.append(" WHERE MDCId = %s GROUP BY collectTime DESC LIMIT 5;");
			dt = dbHelper.executeToTable(String.format(sql.toString(), mdcId));
			pues = Puerecord.getPuerecoreData(dt);
			Collections.reverse(pues);
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			for (Puerecord pue : pues) {
				strs += String.format("\"%s\",", pue.pue);
				strx += String.format("\"%s\",", sdf.format(pue.collectTime));
			}
			if (pues.size() != 0) {
				strs = strs.substring(0, strs.length() - 1);
				strx = strx.substring(0, strx.length() - 1);
			}
			sb.append(String.format("\"series\":[%s],", strs));
			sb.append(String.format("\"xAxis\":[%s]", strx));
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return sb.toString();
	}

	/**
	 * 获得实时mPue需要的编号
	 */
	public String getmPueData(String mdcId) {
		StringBuffer sb = new StringBuffer();
		try {
			sb.append(String.format("{\"totleSignalId\":%s", JsonHelper.ListjsonString("list", getTotalPower(mdcId))));
			sb.append(String.format(",\"signalId\":%s,\"value\":\"0\"}", JsonHelper.ListjsonString("list",getRatedLoad(mdcId))));
		} catch (Exception e) {
			log.error("Database exception:", e);
		}
		return sb.toString();
	}

	/**
	 * 获得额定负载与其他负载编号
	 **/
	public String getItLoadDataList(String mdcId) {
		StringBuffer sb = new StringBuffer();
		try {
			// 其他负载
			sb.append(String.format("{\"otherEnergy\":%s,\"value\":\"0\",\"type\":\"OtherEnergy\"}",
					getOtherEnergy(mdcId)));
			// IT负载
			sb.append(String.format(",{\"ratedLoad\":%s,\"value\":\"0\",\"type\":\"RatedLoad\"}", JsonHelper.ListjsonString("list",getRatedLoad(mdcId))));
		} catch (Exception e) {
			log.error("Database exception:", e);
		}
		return sb.toString();
	}

	/**
	 * MDC的信号编号
	 */
	public ArrayList<Mdc> getTotalPower(String mdcId) {
		ArrayList<Mdc> MdcList = null;
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT ");
			sql.append("   Line1PhaseACurrentDeviceId,");
			sql.append("   Line1PhaseACurrentSignalId,");
			sql.append("   Line1PhaseAVoltageDeviceId,");
			sql.append("   Line1PhaseAVoltageSignalId,");
			sql.append("   Line1PhaseBCurrentDeviceId,");
			sql.append("   Line1PhaseBCurrentSignalId,");
			sql.append("   Line1PhaseBVoltageDeviceId,");
			sql.append("   Line1PhaseBVoltageSignalId,");
			sql.append("   Line1PhaseCCurrentDeviceId,");
			sql.append("   Line1PhaseCCurrentSignalId,");
			sql.append("   Line1PhaseCVoltageDeviceId,");
			sql.append("   Line1PhaseCVoltageSignalId,");
			sql.append("   Line2PhaseACurrentDeviceId,");
			sql.append("   Line2PhaseACurrentSignalId,");
			sql.append("   Line2PhaseAVoltageDeviceId,");
			sql.append("   Line2PhaseAVoltageSignalId,");
			sql.append("   Line2PhaseBCurrentDeviceId,");
			sql.append("   Line2PhaseBCurrentSignalId,");
			sql.append("   Line2PhaseBVoltageDeviceId,");
			sql.append("   Line2PhaseBVoltageSignalId,");
			sql.append("   Line2PhaseCCurrentDeviceId,");
			sql.append("   Line2PhaseCCurrentSignalId,");
			sql.append("   Line2PhaseCVoltageDeviceId,");
			sql.append("   Line2PhaseCVoltageSignalId ");
			sql.append(String.format("FROM mdc WHERE Id = %s;", mdcId));
			dt = dbHelper.executeToTable(sql.toString());
			MdcList = Mdc.fromCabinetSignalListData(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return MdcList;
	}

	/**
	 * 总用电量信号编号
	 */
	public String getTotalElectricity(String mdcId) {
		ArrayList<CabinetDeviceMap> CabinetDeviceMapList = null;
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append(String.format("SELECT PowerConsumptionDeviceId,PowerConsumptionSignalId FROM mdc WHERE Id = %s;",
					mdcId));
			dt = dbHelper.executeToTable(sql.toString());
			CabinetDeviceMapList = CabinetDeviceMap.fromPowerConsumptionData(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return JsonHelper.ListjsonString("list", CabinetDeviceMapList);
	}

	// IT机柜列表
	public List<CabinetDeviceMap> getRatedLoad(String mdcId) {
		List<CabinetDeviceMap> CabinetDeviceMapList = null;
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT ");
			sql.append("   PhaseACurrentDeviceId,");
			sql.append("   PhaseACurrentSignalId,");
			sql.append("   PhaseAVoltageDeviceId,");
			sql.append("   PhaseAVoltageSignalId,");
			sql.append("   PhaseBCurrentDeviceId,");
			sql.append("   PhaseBCurrentSignalId,");
			sql.append("   PhaseBVoltageDeviceId,");
			sql.append("   PhaseBVoltageSignalId,");
			sql.append("   PhaseCCurrentDeviceId,");
			sql.append("   PhaseCCurrentSignalId,");
			sql.append("   PhaseCVoltageDeviceId,");
			sql.append("   PhaseCVoltageSignalId ");
			sql.append(String.format("FROM cabinet WHERE CabinetType = 'RACK' AND MDCId = %s;", mdcId));
			dt = dbHelper.executeToTable(sql.toString());
			CabinetDeviceMapList = CabinetDeviceMap.fromCabinetSignalListData(dt).stream().filter(d -> d.isDeviceANdSignalNotNull() == true).collect(Collectors.toList()); 
		} catch (Exception e) {
			log.error("not other energy:" + e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return CabinetDeviceMapList;
	}

	// 非IT机柜列表
	public String getOtherEnergy(String mdcId) {
		ArrayList<CabinetDeviceMap> CabinetDeviceMapList = null;
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT ");
			sql.append("   PhaseACurrentDeviceId,");
			sql.append("   PhaseACurrentSignalId,");
			sql.append("   PhaseAVoltageDeviceId,");
			sql.append("   PhaseAVoltageSignalId,");
			sql.append("   PhaseBCurrentDeviceId,");
			sql.append("   PhaseBCurrentSignalId,");
			sql.append("   PhaseBVoltageDeviceId,");
			sql.append("   PhaseBVoltageSignalId,");
			sql.append("   PhaseCCurrentDeviceId,");
			sql.append("   PhaseCCurrentSignalId,");
			sql.append("   PhaseCVoltageDeviceId,");
			sql.append("   PhaseCVoltageSignalId ");
			sql.append(String.format("FROM cabinet WHERE CabinetType <> 'RACK' AND MDCId = %s;", mdcId));
			dt = dbHelper.executeToTable(sql.toString());
			CabinetDeviceMapList = CabinetDeviceMap.fromCabinetSignalListData(dt);
		} catch (Exception e) {
			log.error("not other energy:" + e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return JsonHelper.ListjsonString("list", CabinetDeviceMapList);
	}

	public String getCabinetTemp(String mdcId) {
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		ArrayList<MdcTemperature> temps = new ArrayList<MdcTemperature>();
		if(mdcId.equals("undefined") || mdcId.equals("NA")) return JsonHelper.ListjsonString("ret", temps);
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(
					"SELECT A.MDCId,B.CabinetId,B.SlideName,B.DeviceId,B.SignalId,A.Side,B.x,B.y FROM cabinet A,thermal_sensors B WHERE A.id = B.CabinetId AND A.MDCId = %s;",
					mdcId);
			dt = dbHelper.executeToTable(sql);
			temps = MdcTemperature.getTemperatures(dt);
		} catch (Exception e) {
			log.error("Database exception:" + e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return JsonHelper.ListjsonString("ret", temps);
	}

	public double getMaxPower(String mdcId) {
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		double max = 0, current = 0, voltage = 0;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT RatedCurrent,RatedVoltage FROM cabinet WHERE MDCId = %s;", mdcId);
			dt = dbHelper.executeToTable(sql);
			int count = dt.getRowCount();
			for (int i = 0; i < count; i++) {
				DataRow dr = dt.getRows().get(i);
				current = CabinetDeviceMap.parseDouble(dr.getValueAsString("RatedCurrent"));
				voltage = CabinetDeviceMap.parseDouble(dr.getValueAsString("RatedVoltage"));
				max += current * voltage;
			}
			max /= 1000;
			max = (double) Math.round(max * 100) / 100;
		} catch (Exception e) {
			log.error("Database exception:" + e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return max;
	}

	public String getMDCAlarmInfo(String mdcId) {
		if(mdcId.equals("undefined") || mdcId.equals("NA")) return "{\"cabinets\":[]}";
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		List<MDCEnvironment> mdcEnvs = null;
		List<Cabinet> cabinetList = null;
		ArrayList<MdcTemperature> thermal_sensors = null;
		ArrayList<CabinetDeviceMap> cabinetDeviceMaps = null;
		ArrayList<ActiveDevice> activeDeviceList = ConfigCache.getInstance().getAllActiveDevices();
		ArrayList<CabinetSignalMap> cabinetSignalMaps = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT * FROM Mdc_Environment WHERE MDCId = %s;", mdcId);
			dt = dbHelper.executeToTable(sql);
			mdcEnvs = MDCEnvironment.fromDataTable(dt);

			sql = String.format("SELECT * FROM cabinet WHERE MDCId = %s;", mdcId);
			dt = dbHelper.executeToTable(sql);
			cabinetList = Cabinet.fromDataTable(dt);

			sql = String.format(
					"SELECT MDCId,CabinetId,SlideName,DeviceId,SignalId,x,y FROM thermal_sensors WHERE MDCId = %s;",
					mdcId);
			dt = dbHelper.executeToTable(sql);
			thermal_sensors = MdcTemperature.getTemperatures(dt);

			sql = "SELECT * FROM MDC_CabinetDeviceMap;";
			dt = dbHelper.executeToTable(sql);
			cabinetDeviceMaps = CabinetDeviceMap.fromCabinetDeviceMapTable(dt);

			sql = "SELECT * FROM cabinet_signal_map";
			dt = dbHelper.executeToTable(sql);
			cabinetSignalMaps = CabinetSignalMap.fromDataTable(dt);

		} catch (Exception e) {
			log.error("Database exception:" + e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		String mdcEnvironmentAlarmInfo = null;
		if (mdcEnvs != null) {
			mdcEnvironmentAlarmInfo = GetMDCEnvironmentAlarmInfo(mdcEnvs);
		}
		StringBuffer sb = new StringBuffer();
		sb.append("{");
		if (mdcEnvironmentAlarmInfo != null) {
			sb.append(mdcEnvironmentAlarmInfo);
		}
		sb.append("\"cabinets\":[");
		if (cabinetList != null && cabinetList.size() > 0) {
			String mdcRefCabinetInfo = GetMDCRefCabinetInfo(cabinetList, thermal_sensors, cabinetDeviceMaps,
					cabinetSignalMaps, activeDeviceList);
			if (mdcRefCabinetInfo != null) {
				sb.append(mdcRefCabinetInfo);
			}
		}
		sb.append("]");
		sb.append("}");
		return sb.toString();
	}

	private String GetCabinetRefDeviceInfo(ArrayList<CabinetDeviceMap> cabinetDeviceMaps,
			ArrayList<ActiveDevice> activeDeviceList, Cabinet cabinet) {
		StringBuffer sb = new StringBuffer();
		ActiveDevice device = null;
		// 因为机柜的U位是从下往上递增，所以这里取机柜设备时，按照U位的大小倒序排列以方便前端展示
		Collections.sort(cabinetDeviceMaps, Collections.reverseOrder());
		for (CabinetDeviceMap cdm : cabinetDeviceMaps) {
			String name = "",vendor = "",modal = "",startDate = "";
			int id = -1;
			if (cdm.equipmentId == null || cdm.equipmentId.equals("")) {
				name = cdm.equipmentName;
			}else{
				for (int i = 0; i < activeDeviceList.size(); i++) {
					device = activeDeviceList.get(i);
					if (device != null && CabinetDeviceMap.parseInt(cdm.equipmentId) == device.id) {
						id = device.id;
						name = device.name;
						vendor = device.vendor;
						modal = device.equipmentStyle;
						startDate = device.usedDate;
					}
				}
			}
			sb.append("{");
			sb.append(String.format("\"id\":\"%s\",", id));
			sb.append(String.format("\"name\":\"%s\",", name));
			// 设备U位
			if (cdm.UIndex != null) {
				sb.append(String.format("\"uIndex\":%s,", cdm.UIndex));
			} else {
				sb.append(String.format("\"uIndex\":%s,", 0));
			}
			// 设备U高
			if (cdm.UHeight != null) {
				sb.append(String.format("\"uHigh\":%s,", cdm.UHeight));
			} else {
				sb.append(String.format("\"uHigh\":%s,", 0));
			}
			sb.append(String.format("\"vendor\":\"%s\",", vendor));
			sb.append(String.format("\"Modal\":\"%s\",", modal));
			sb.append(String.format("\"startDate\":\"%s\"", startDate));
			sb.append("},");
		}
		if (sb.length() > 0) {
			String tmpString = sb.toString();
			return tmpString.substring(0, tmpString.length() - 1);
		}
		return null;
	}

	private String GetMDCRefCabinetInfo(List<Cabinet> cabinetList, ArrayList<MdcTemperature> thermal_sensors,
			ArrayList<CabinetDeviceMap> cabinetDeviceMaps, ArrayList<CabinetSignalMap> cabinetSignalMaps,
			ArrayList<ActiveDevice> activeDeviceList) {
		StringBuffer sb = new StringBuffer();
		ArrayList<MdcTemperature> tempList = new ArrayList<MdcTemperature>();
		for (Cabinet cabinet : cabinetList) {
			tempList.clear();
			List<ActiveSignal> activeSignals = GetActiveSignalsByCabinetPowerDevice(cabinet);
			sb.append("{");
			// 格式化机柜ID
			String cId = "";
			if (cabinet.CabinetId > 99) {
				int id = CabinetDeviceMap.parseInt(
						String.valueOf(cabinet.CabinetId).substring(String.valueOf(cabinet.CabinetId).length() - 2));
				cId = String.format("rack%s", id);
			} else
				cId = String.format("rack%s", cabinet.CabinetId);
			sb.append(String.format("\"id\":\"%s\",", cId));
			sb.append(String.format("\"name\":\"%s\",", cabinet.CabinetName));
			sb.append(String.format("\"type\":\"%s\",", cabinet.CabinetType));
			// 计算机柜最大告警等级
			int cabinetAlarmLevel = -1;
			ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
			ArrayList<CabinetDeviceMap> tmpCabinetDeviceMap = new ArrayList<CabinetDeviceMap>();
			for (CabinetDeviceMap cdm : cabinetDeviceMaps) {
				if (CabinetDeviceMap.parseInt(cdm.cabinetId) == cabinet.CabinetId) {
					tmpCabinetDeviceMap.add(cdm);
				}
			}
			for (CabinetDeviceMap cdm : tmpCabinetDeviceMap) {
				for (ActiveAlarm activeAlarm : alarms) {
					if (cdm.equipmentId != null && !cdm.equipmentId.equals("")
							&& activeAlarm.deviceId == CabinetDeviceMap.parseInt(cdm.equipmentId)) {
						cabinetAlarmLevel = Math.max(cabinetAlarmLevel, activeAlarm.alarmLevel);
					}
				}
			}
			ArrayList<CabinetSignalMap> tmpCabinetSignalMap = new ArrayList<CabinetSignalMap>();
			for (CabinetSignalMap csm : cabinetSignalMaps) {
				if (csm.cabinetId != null && CabinetDeviceMap.parseInt(csm.cabinetId) == cabinet.CabinetId) {
					tmpCabinetSignalMap.add(csm);
				}
			}
			for (CabinetSignalMap csm : tmpCabinetSignalMap) {
				for (ActiveAlarm activeAlarm : alarms) {
					if (csm.deviceId != null && !csm.deviceId.equals("")
							&& activeAlarm.deviceId == CabinetDeviceMap.parseInt(csm.deviceId) && csm.signalId != null
							&& !csm.signalId.equals("")
							&& activeAlarm.signalId == CabinetDeviceMap.parseInt(csm.signalId)) {
						cabinetAlarmLevel = Math.max(cabinetAlarmLevel, activeAlarm.alarmLevel);
					}
				}
			}
			sb.append(String.format("\"alarmLevel\":%s,", cabinetAlarmLevel));
			sb.append(String.format("\"side\":\"%s\",", cabinet.Side));
			sb.append(String.format("\"ratedPower\":%s,", cabinet.RatedVoltage * cabinet.RatedCurrent));
			// 机柜实时总功率
			sb.append(String.format("\"activePower\":%s,", getCabinetPowerBySignal(cabinet, activeSignals)));
			for (MdcTemperature mdcTemperature : thermal_sensors) {
				if (mdcTemperature.cabinetId == cabinet.CabinetId) {
					tempList.add(mdcTemperature);
				}
			}
			sb.append("\"tempSensors\":[");
			HashSet<Integer> mdcTemperatureDeviceIds = new HashSet<Integer>();
			for (MdcTemperature mdcTemperature : tempList) {
				mdcTemperatureDeviceIds.add(mdcTemperature.deviceId);
			}
			List<ActiveSignal> mdcTemperatureActiveSignals = new ArrayList<ActiveSignal>();
			for (Integer deviceId : mdcTemperatureDeviceIds) {
				ArrayList<ActiveSignal> tmpList = ConfigCache.getInstance().getActiveDeviceSignal(deviceId);
				if (tmpList != null) {
					mdcTemperatureActiveSignals.addAll(tmpList);
				}
			}
			ActiveSignalProvider activeSignalProvider = new ActiveSignalProvider();
			// 计算温场实时温度
			activeSignalProvider.getSignalDataByTemp(tempList, mdcTemperatureActiveSignals);
			StringBuffer tmpStringBuffer = new StringBuffer();
			for (MdcTemperature mdcTemperature : tempList) {
				tmpStringBuffer.append("{");
				tmpStringBuffer.append(String.format("\"x\":%s,", mdcTemperature.x));
				tmpStringBuffer.append(String.format("\"y\":%s,", mdcTemperature.y));
				tmpStringBuffer.append(String.format("\"val\":%s", mdcTemperature.val));
				tmpStringBuffer.append("},");
			}
			int tmpLength = tmpStringBuffer.toString().length();
			if (tmpLength > 0) {
				sb.append(tmpStringBuffer.toString().substring(0, tmpLength - 1));
			}
			sb.append("],");
			sb.append("\"devices\":[");
			// 获取机柜关联的监控设备
			String cabinetRefDeviceInfo = GetCabinetRefDeviceInfo(tmpCabinetDeviceMap, activeDeviceList, cabinet);
			if (cabinetRefDeviceInfo != null) {
				sb.append(cabinetRefDeviceInfo);
			}
			sb.append("]");
			sb.append("},");
		}
		if (sb.length() > 0) {
			String tmpString = sb.toString();
			return tmpString.substring(0, tmpString.length() - 1);
		}
		return null;
	}

	private String GetMDCEnvironmentAlarmInfo(List<MDCEnvironment> mdcEnvs) {
		StringBuffer sb = new StringBuffer();
		Boolean smokeDetectorAlarming = false;
		Boolean doorAOpened = false;
		Boolean doorBOpened = false;
		Boolean waterDetectorAAlarming = false;
		Boolean waterDetectorBAlarming = false;
		Boolean infraredDetectorAlarming = false;
		Boolean ceilingWindowOpened = false;
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		for(MDCEnvironment env : mdcEnvs){
			if(env.equipmentId == 0 || env.signalId == 0) continue;
			for (ActiveAlarm activeAlarm : alarms) {
				if(activeAlarm.deviceId == env.equipmentId && activeAlarm.signalId == env.signalId){
					if(env.type.equals("smoke"))//烟感
						smokeDetectorAlarming = true;
					if(env.type.equals("door")){//门
						if(env.site == 1) 
							doorAOpened = true;
						else 
							doorBOpened = true;
					}
					if(env.type.equals("water")){//水浸
						if(env.site == 2) //下面一排(3D前面的一排)为水浸A
							waterDetectorAAlarming = true;
						else 
							waterDetectorBAlarming = true;
					}
					if(env.type.equals("infrared"))//红外
						infraredDetectorAlarming = true;
					if(env.type.equals("skyFalling"))//天窗
						ceilingWindowOpened = true;
				}
			}
		}

		sb.append("\"mdc\":{");
		sb.append(String.format("\"smokeDetector\":{\"alarming\":%s},", smokeDetectorAlarming));
		sb.append(String.format("\"doorA\":{\"opened\":%s},", doorAOpened));
		sb.append(String.format("\"doorB\":{\"opened\":%s},", doorBOpened));
		sb.append(String.format("\"waterDetectorA\":{\"alarming\":%s},", waterDetectorAAlarming));
		sb.append(String.format("\"waterDetectorB\":{\"alarming\":%s},", waterDetectorBAlarming));
		sb.append("\"ThermalMapA\":[],");
		sb.append("\"ThermalMapB\":[],");
		sb.append(String.format("\"infraredDetector\":{\"alarming\":%s},", infraredDetectorAlarming));
		sb.append(String.format("\"ceilingWindow\":{\"opened\":%s}", ceilingWindowOpened));
		sb.append("},");
		return sb.toString();
	}

	private List<ActiveSignal> GetActiveSignalsByCabinetPowerDevice(Cabinet cabinet) {
		HashSet<Integer> cabinetPowerDeviceIds = new HashSet<Integer>();
		if (cabinet.PhaseACurrentDeviceId != null) {
			cabinetPowerDeviceIds.add(cabinet.PhaseACurrentDeviceId);
		}
		if (cabinet.PhaseAVoltageDeviceId != null) {
			cabinetPowerDeviceIds.add(cabinet.PhaseAVoltageDeviceId);
		}
		if (cabinet.PhaseBCurrentDeviceId != null) {
			cabinetPowerDeviceIds.add(cabinet.PhaseBCurrentDeviceId);
		}
		if (cabinet.PhaseBVoltageDeviceId != null) {
			cabinetPowerDeviceIds.add(cabinet.PhaseBVoltageDeviceId);
		}
		if (cabinet.PhaseCCurrentDeviceId != null) {
			cabinetPowerDeviceIds.add(cabinet.PhaseCCurrentDeviceId);
		}
		if (cabinet.PhaseCVoltageDeviceId != null) {
			cabinetPowerDeviceIds.add(cabinet.PhaseCVoltageDeviceId);
		}
		List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
		for (Integer deviceId : cabinetPowerDeviceIds) {
			ArrayList<ActiveSignal> tmpList = ConfigCache.getInstance().getActiveDeviceSignal(deviceId);
			if (tmpList != null) {
				activeSignals.addAll(tmpList);
			}
		}
		return activeSignals;
	}

	// 计算机柜实时三相功率之和
	private double getCabinetPowerBySignal(Cabinet cabinet, List<ActiveSignal> activeSignals) {
		double current = 0, voltage = 0, power = 0;

		current = getValueByDeviceIdAndSignal(cabinet.PhaseACurrentDeviceId, cabinet.PhaseACurrentSignalId,
				activeSignals);
		voltage = getValueByDeviceIdAndSignal(cabinet.PhaseAVoltageDeviceId, cabinet.PhaseAVoltageSignalId,
				activeSignals);
		power += current * voltage;

		current = getValueByDeviceIdAndSignal(cabinet.PhaseBCurrentDeviceId, cabinet.PhaseBCurrentSignalId,
				activeSignals);
		voltage = getValueByDeviceIdAndSignal(cabinet.PhaseBVoltageDeviceId, cabinet.PhaseBVoltageSignalId,
				activeSignals);
		power += current * voltage;

		current = getValueByDeviceIdAndSignal(cabinet.PhaseCCurrentDeviceId, cabinet.PhaseCCurrentSignalId,
				activeSignals);
		voltage = getValueByDeviceIdAndSignal(cabinet.PhaseCVoltageDeviceId, cabinet.PhaseCVoltageSignalId,
				activeSignals);
		power += current * voltage;

		return power;
	}

	private double getValueByDeviceIdAndSignal(Integer deviceId, Integer signalId, List<ActiveSignal> activeSignals) {
		if (deviceId == null || signalId == null || activeSignals == null) {
			return 0;
		}
		for (ActiveSignal as : activeSignals) {
			if (as.deviceId == deviceId && as.signalId == signalId) {
				return as.floatValue;
			}
		}
		return 0;
	}

	public List<ThermalSensors> getTemperature(String mdcId) {
		DatabaseHelper dbHelper = null;
		List<ThermalSensors> list = new ArrayList<ThermalSensors>();
		if(mdcId.equals("undefined") || mdcId.equals("NA")) return list;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("SELECT A.MDCId,A.CabinetId,B.Name,B.Side,A.SlideName,A.DeviceId,");
			sb.append("	 A.SignalId,A.x,A.y FROM thermal_sensors A ");
			sb.append("LEFT JOIN cabinet B ON A.CabinetId = B.Id ");
			sb.append(String.format("WHERE A.MDCId = %s AND A.DeviceId IS NOT NULL ORDER BY A.SlideName;", mdcId));
			DataTable dt = dbHelper.executeToTable(sb.toString());
			list = ThermalSensors.fromThermalSensors(dt);
		} catch (Exception e) {
			log.error("Database exception!", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return list;
	}

	public String getMdcNames() {
		ArrayList<Mdc> MdcList = null;
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("SELECT Id,Name FROM mdc;");
			dt = dbHelper.executeToTable(sql.toString());
			MdcList = Mdc.fromCabinetSignalListData(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return JsonHelper.ListjsonString("ret", MdcList);
	}
	
	public ArrayList<Mdc> getMdcConfigInfo(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		ArrayList<Mdc> mc = new ArrayList<Mdc>();
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM mdc;";
			dt = dbHelper.executeToTable(sql);
			mc = Mdc.fromCabinetSignalListDatas(dt);
		} catch (Exception e) {
			log.error("Database exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return mc;
	}

	/** return:{
		"mdcId":100000001,
		"mdcName" : "mdc",
		"racks" : [
			{
				"index": 1,
				"cabinetId":10001001,
				"name":"IT01",
				"state":"default",
				"face":"default",
				"level":0,
				"percent":100
			}
		]
	}*/
	public String getCabinetListInfo(String mdcId){
		try{
			ArrayList<Mdc> mdcs = getMdcConfigInfo();
			Mdc mdc = null;
			if(mdcs != null){
				for (Mdc item : mdcs){
					if(item.id.equals(mdcId)) {
						mdc = item;
						break;
					}
				}
				if(mdc == null)
					mdc = mdcs.get(0);
			}
			if(mdc == null) return "";

			JSONObject obj = new JSONObject();
			obj.put("mdcId",mdc.id);
			obj.put("mdcName",mdc.name);

			JSONArray arr = new JSONArray();
			List<Cabinet> cabinets = getAllCabinet(mdcId);
			int index = 1;
			for(Cabinet item : cabinets){
				JSONObject rack = new JSONObject();
				rack.put("index",index);
				rack.put("name",item.CabinetName);
				rack.put("state","default");
				rack.put("face","default");
				arr.put(rack);
				index ++;
			}
			obj.put("racks",arr);

			return obj.toString();
		}catch (Exception ex){
			return "";
		}
	}

	private List<Cabinet> getAllCabinet(String mdcId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("SELECT * FROM (SELECT * FROM Cabinet WHERE Side = 'A' ORDER BY Id DESC) T ");
			sb.append("UNION ");
			sb.append("SELECT * FROM (SELECT * FROM Cabinet WHERE Side = 'B' ORDER BY Id DESC) S;");
			if(!mdcId.equals("")){
				sb = new StringBuffer();
				sb.append("SELECT * FROM (SELECT * FROM Cabinet WHERE Side = 'A' ORDER BY Id DESC) T WHERE T.MDCId = "+mdcId);
				sb.append("UNION ");
				sb.append("SELECT * FROM (SELECT * FROM Cabinet WHERE Side = 'B' ORDER BY Id DESC) S WHERE S.MDCId = "+mdcId);
			}
			DataTable dt = dbHelper.executeToTable(sb.toString());
			return Cabinet.fromDataTable(dt);
		} catch (Exception e) {
			log.error("loadChartMdcConfig Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return new ArrayList<Cabinet>();
	}
}
