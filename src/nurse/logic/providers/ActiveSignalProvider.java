package nurse.logic.providers;

import java.lang.reflect.Field;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import nurse.common.DataColumnCollection;
import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.AisleThermalHumidity;
import nurse.entity.persist.Cabinet;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.Mdc;
import nurse.entity.persist.MdcTemperature;
import nurse.entity.persist.ThermalSensors;
import nurse.logic.handlers.ActiveSignalDataHandler;
import nurse.utility.DatabaseHelper;
import nurse.utility.JsonHelper;


public class ActiveSignalProvider {

	public ActiveSignalProvider() {
	}
	
	private static ActiveSignalProvider instance = new ActiveSignalProvider();
	private static Logger log = Logger.getLogger(ActiveSignalProvider.class);
	private static HashMap<String, List<CabinetDeviceMap>> mapGroupsPower = new HashMap<String, List<CabinetDeviceMap>>();
	private static HashMap<String, List<Mdc>> mapGroupsMdc = new HashMap<String, List<Mdc>>();
	private static HashMap<String,Long> oldTime = new HashMap<String,Long>();//mPue插入时间
	private static HashMap<String,Long> recordTime = new HashMap<String,Long>();//mPue最后录入时间
	private static HashMap<String,String> hisMPUE = new HashMap<String,String>();
	private static HashMap<String, ArrayList<MdcTemperature>> mapTemps = new HashMap<String, ArrayList<MdcTemperature>>();
	private static HashMap<Integer,Set<Integer>> allDevices = new HashMap<Integer,Set<Integer>>();
	private static HashMap<String, Set<Integer>> powerDeviceIds = new HashMap<String,Set<Integer>>();
	private static HashMap<String, MdcTemperature> temperatureMap = new HashMap<String, MdcTemperature>();
	private static HashMap<String, List<ThermalSensors>> thermalSensorsMap = new HashMap<String, List<ThermalSensors>>();
	private static HashMap<String, Set<Integer>> DeviceCabinetMap = new HashMap<String, Set<Integer>>();
	private static HashMap<String, CabinetDeviceMap> CabinetPowerMap = new HashMap<String, CabinetDeviceMap>();
	private static HashMap<String, List<MdcTemperature>> CabinetTemperatureMap = new HashMap<String, List<MdcTemperature>>();
	
	//配电 KPI path
	private static final String mPueDataTotle = "mPueData.totleSignalId.list";
	private static final String mPueData = "mPueData.signalId.list";
	private static final String itLoadDataListOtherEnergy = "itLoadDataList.otherEnergy.list";
	private static final String itLoadDataListRatedLoad = "itLoadDataList.ratedLoad.list";
	private static final String totalPower = "totalPower.totleSignalId.list";
	private static final String totalElectricity = "totalElectricity.signalId.list";
	
	//Aisle ThermalHumidity
	private static HashMap<String, List<AisleThermalHumidity>> aisleThermalHumidity = new HashMap<String, List<AisleThermalHumidity>>();
	
	//MDC Charts
	private static Set<Integer> idHashSet = new HashSet<Integer>();
	private static List<Mdc> ChartMdcConfig = new ArrayList<Mdc>();
	private static List<Cabinet> ChartCabinetsConfig = new ArrayList<Cabinet>();
	private static List<CabinetDeviceMap> ChartCabinetDevicesConfig = new ArrayList<CabinetDeviceMap>();
	
	public static ActiveSignalProvider getInstance(){
		return instance;
	}
	
	public static void closeHashMap(){
		mapGroupsPower = new HashMap<String, List<CabinetDeviceMap>>();
		mapGroupsMdc = new HashMap<String, List<Mdc>>();
		allDevices = new HashMap<Integer,Set<Integer>>();
		powerDeviceIds = new HashMap<String,Set<Integer>>();
		mapTemps = new HashMap<String, ArrayList<MdcTemperature>>();
		thermalSensorsMap = new HashMap<String, List<ThermalSensors>>();
		//机柜弹出框定时刷新
		DeviceCabinetMap = new HashMap<String, Set<Integer>>();
		CabinetPowerMap = new HashMap<String, CabinetDeviceMap>();
		CabinetTemperatureMap = new HashMap<String, List<MdcTemperature>>();
		//PUE采集时间
		oldTime = new HashMap<String,Long>();
		//通道温湿度
		aisleThermalHumidity = new HashMap<String, List<AisleThermalHumidity>>();
		//图表MDC配置
		ChartMdcConfig = new ArrayList<Mdc>();
		ChartCabinetsConfig = new ArrayList<Cabinet>();
		ChartCabinetDevicesConfig = new ArrayList<CabinetDeviceMap>();
	}

	public ArrayList<ActiveSignal> getAllActiveSignals() {
		//return MockHelper.getActiveSignals();	
		DatabaseHelper dbHelper = null;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append("select StationId,StationName,EquipmentId,EquipmentName,");
	            sb.append("BaseTypeId,BaseTypeName,SignalId,FloatValue,Meanings,ShowPrecision,SignalCategory,Unit,SampleTime ");
	            sb.append("from tbl_activesignal");
	            DataTable dt = dbHelper.executeToTable(sb.toString());
	            
	            return ActiveSignal.fromDataTable(dt);
			} catch (Exception e) {
				log.error("fail to read all sig basetypes", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return null;
				
	}
	//add Subscribe
	public void addSubscribeSignal(){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
            dbHelper = new DatabaseHelper();
            String sql = "select count(*) from tsl_subscribesignal";
            dt = dbHelper.executeToTable(sql);
            if(dt.getRows().get(0).getValueAsString(0).equals("0")){
            	sql = String.format("insert into tsl_subscribesignal values(%s,%s,%s,0,0,SYSDATE(),SYSDATE(),SYSDATE())",
            			0,0,0);
            	dbHelper.executeNoQuery(sql);
            }
		} catch (Exception e) {
			log.error(e);
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	/** split string and group */
	public Set<Integer> groupsPowerKpi(String mdcId,JSONObject json){
		if(!powerDeviceIds.containsKey(mdcId+"pki")){ 
			if(!mapGroupsMdc.containsKey(mdcId+mPueDataTotle)){
				//即时mPUE
				mapGroupsMdc.put(mdcId+mPueDataTotle, getMdcByKey(mPueDataTotle,json));
				mapGroupsPower.put(mdcId+mPueData, getCabinetsByKey(mPueData,json));
			}
			//IT负载
			mapGroupsPower.put(mdcId+itLoadDataListOtherEnergy, getCabinetsByKey(itLoadDataListOtherEnergy,json));
			mapGroupsPower.put(mdcId+itLoadDataListRatedLoad, getCabinetsByKey(itLoadDataListRatedLoad,json));
			//总功率
			mapGroupsMdc.put(mdcId+totalPower, getMdcByKey(totalPower,json));
			//总电量
			mapGroupsPower.put(mdcId+totalElectricity, getCabinetsByKey(totalElectricity,json));

			Set<Integer> deviceIds = new HashSet<Integer>();
			try {
				Set<String> keySet = mapGroupsPower.keySet();
				for(String k : keySet){
					if(k.indexOf(mdcId) >= 0){
						List<CabinetDeviceMap> cdms = mapGroupsPower.get(k);
						for(CabinetDeviceMap cdm : cdms){
							Field[] fields = CabinetDeviceMap.class.getDeclaredFields();
							for(Field f : fields){
								String attrName = f.getName();
								if(attrName.indexOf("DeviceId") > -1){
									String val = (String) f.get(cdm);
									if(val == null || val.equals("")) continue;
									deviceIds.add(CabinetDeviceMap.parseInt(val));
								}
							}
						}
					}
				}
			} catch (Exception e) {
				log.error("Access Exception:"+e);
			}
			powerDeviceIds.put(mdcId+"pki", deviceIds);
		}
		return powerDeviceIds.get(mdcId+"pki");
		
	}
	//根据path的值获得集合
	private List<CabinetDeviceMap> getCabinetsByKey(String path,JSONObject json){
		String[] keys = path.split("\\.");
		String jsonStr = json.toString();
		List<CabinetDeviceMap> list = new ArrayList<CabinetDeviceMap>();
		try {
			for(String key : keys){
				if(jsonStr.indexOf("[") == 0){
					jsonStr = groupingJson(key,jsonStr);
					continue;
				}
				JSONObject jj = new JSONObject(jsonStr);
				jsonStr = jj.get(key).toString();
			}
			list = CabinetDeviceMap.getJsonListCabinet(jsonStr);
		} catch (Exception e) {
			log.error("JSON Format Error",e);
		}
		return list;
	}
	
	private List<Mdc> getMdcByKey(String path,JSONObject json){
		String[] keys = path.split("\\.");
		String jsonStr = json.toString();
		List<Mdc> list = new ArrayList<Mdc>();
		try {
			for(String key : keys){
				if(jsonStr.indexOf("[") == 0){
					jsonStr = groupingJson(key,jsonStr);
					continue;
				}
				JSONObject jj = new JSONObject(jsonStr);
				jsonStr = jj.get(key).toString();
			}
			list = Mdc.getJsonListCabinet(jsonStr);
		} catch (Exception e) {
			log.error("JSON Format Error",e);
		}
		return list;
	}
	
	public String groupingJson(String key,String jsonParams){

		JSONArray jarr = new JSONArray(jsonParams);
		for(int i = 0;i<jarr.length();i++){
			JSONObject jj = new JSONObject(jarr.get(i).toString());
			Set<String> keySet = jj.keySet();
			for(String k : keySet){
				if(k.equals(key)){
					Object obj = jj.get(key);
					return obj.toString();
				} 
			}
		}
		return "{}";
	}
	
	public String getmPueDataList(String mdcId){
		String result = "";
		try {
			Date date = new Date();//当前时间毫秒数  
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");  
	        Date newDate = sdf.parse(sdf.format(date));//获得当前时间的年月日
	        //最后记录时间和当前时间不同一天
	        if(!oldTime.containsKey(mdcId)){
	        	result = MdcAlarmProvider.getInstance().getPuerecord(mdcId);
	        	oldTime.put(mdcId, newDate.getTime());
	        	hisMPUE.put(mdcId, result);
	        }else{
	        	if(newDate.getTime() != oldTime.get(mdcId)){//时间不相同说明不是同一天，将当前的时间存储到缓存
		        	result = MdcAlarmProvider.getInstance().getPuerecord(mdcId);
		        	oldTime.put(mdcId, newDate.getTime());
		        	hisMPUE.put(mdcId, result);
	        	}else
	        		result = hisMPUE.get(mdcId);
	        }
		} catch (ParseException e) {
			log.error("SimpleDateFormat Exception:"+e);
		}
		return result;
	}
	
	
	public double getmPueData(String mdcId,List<ActiveSignal> activeSignals){
		double totlePower = 0,power = 0;
		//总设备功率
		if(!mapGroupsMdc.containsKey(mdcId+mPueDataTotle)) return 0;
		List<Mdc> totlePowers = mapGroupsMdc.get(mdcId+mPueDataTotle);
		for(Mdc cdm : totlePowers){
			double dou = getMdcBySingal(cdm,activeSignals);
			if(cdm.power != dou && dou != 0) cdm.power = dou;
			totlePower += cdm.power;
		}
		//IT设备功率
		List<CabinetDeviceMap> powers = mapGroupsPower.get(mdcId+mPueData);
		for(CabinetDeviceMap cdm : powers){
			double dou = getPowerBySingal(cdm,activeSignals);
			if(cdm.power != dou && dou != 0) cdm.power = dou;
			power += cdm.power;
		}
		double fruit = totlePower/power;//mPUE
		if(totlePower == 0 || power == 0)
			fruit = 0;
		return fruit;
	}
	
	public String getItLoadDataList(String mdcId,List<ActiveSignal> activeSignals){
		double otherPower = 0,retedPower = 0,totlePower = 0;
		if(!mapGroupsPower.containsKey(mdcId+itLoadDataListOtherEnergy)) 
			return "{\"value\":\"0\",\"type\":\"OtherEnergy\"},{\"value\":\"0\",\"type\":\"RatedLoad\"}";
		//IT负载
		List<CabinetDeviceMap> reted = mapGroupsPower.get(mdcId+itLoadDataListRatedLoad);
		for(CabinetDeviceMap cdm : reted){
			double dou = getPowerBySingal(cdm,activeSignals);
			if(cdm.power != dou && dou != 0) cdm.power = dou;
			retedPower += cdm.power;
		}
		retedPower /= 1000;//单位位kw
		//总能耗
		List<Mdc> total = mapGroupsMdc.get(mdcId+totalPower);
		for(Mdc cdm : total){
			double dou = getMdcBySingal(cdm,activeSignals);
			if(cdm.power != dou && dou != 0) cdm.power = dou;
			totlePower += cdm.power;
		}
		totlePower /= 1000;//单位位kw
		otherPower = totlePower - retedPower;
		if(otherPower < 0) otherPower = 0; 
		return String.format("{\"value\":\"%s\",\"type\":\"OtherEnergy\"},{\"value\":\"%s\",\"type\":\"RatedLoad\"}",
						otherPower,retedPower);
	}
	
	public double getTotalPower(String mdcId,List<ActiveSignal> activeSignals){
		double totlePower = 0;
		if(!mapGroupsMdc.containsKey(mdcId+totalPower)) return 0;
		List<Mdc> total = mapGroupsMdc.get(mdcId+totalPower);
		for(Mdc cdm : total){
			double dou = getMdcBySingal(cdm,activeSignals);
			if(cdm.power != dou && dou != 0) cdm.power = dou;
			totlePower += cdm.power;
		}
		totlePower /= 1000;//单位为kw
		return totlePower;
	}
	
	public double getTotalElectricity(String mdcId,List<ActiveSignal> activeSignals){
		double power = 0;
		if(!mapGroupsPower.containsKey(mdcId+totalElectricity)) return 0;
		List<CabinetDeviceMap> total = mapGroupsPower.get(mdcId+totalElectricity);
		for(CabinetDeviceMap cdm : total){
			double dou = getSumBySignal(cdm,activeSignals);
			if(cdm.power != dou && dou != 0) cdm.power = dou;
			power += cdm.power;
		}
		return power;
	}
	
	public Set<Integer> getMapTempList(String mdcId,String splits){
		Set<Integer> devices = new HashSet<Integer>();
		String topKey = String.format("%stopRank", mdcId);//MdcId + topRank
		String bottomKey = String.format("%sbottomRank", mdcId);
		if(mapTemps.containsKey(topKey) && mapTemps.containsKey(bottomKey)){
			for(MdcTemperature tk : mapTemps.get(topKey)){
				devices.add(tk.deviceId);
			}
			for(MdcTemperature tk : mapTemps.get(bottomKey)){
				devices.add(tk.deviceId);
			}
			return devices;
		} 
		ArrayList<MdcTemperature> topTemps = new ArrayList<MdcTemperature>();
		ArrayList<MdcTemperature> bottomTemps = new ArrayList<MdcTemperature>();
		String[] temps = splits.split("\\;");
		for(String temp : temps){
			String[] t = temp.split("\\|");

			MdcTemperature mt = new MdcTemperature();
			mt.deviceId = CabinetDeviceMap.parseInt(t[0]);
			mt.signalId = CabinetDeviceMap.parseInt(t[1]);
			mt.x = CabinetDeviceMap.parseDouble(t[2]);
			mt.y = CabinetDeviceMap.parseDouble(t[3]);
			mt.side = t[5];
			if(mt.side.equals("A")) topTemps.add(mt);
			else bottomTemps.add(mt);
			//添加设备编号
			devices.add(mt.deviceId);
		}
		mapTemps.put(topKey, topTemps);
		mapTemps.put(bottomKey, bottomTemps);
		return devices;
	}
	
	public String getTempDataString(String mdcId,List<ActiveSignal> activeSignals){
		String topKey = String.format("%stopRank", mdcId);//MdcId + topRank
		String bottomKey = String.format("%sbottomRank", mdcId);
		String str = "";
		StringBuffer sb = new StringBuffer();
		sb.append("{");
		
		sb.append("\"topRank\":[");
		if(!mapTemps.containsKey(topKey)) return "";
		ArrayList<MdcTemperature> topList = mapTemps.get(topKey);
		getSignalDataByTemp(topList,activeSignals);
		for(MdcTemperature mt : topList){
			if(mt.val == -1) continue;
			str += String.format("{\"x\":\"%s\",\"y\":\"%s\",\"val\":\"%s\"},", 
					mt.x,mt.y,mt.val);
		}
		str = (str.length() == 0) ? "" : str.substring(0,str.length()-1);
		sb.append(str);
		sb.append("],");
		
		str = "";
		sb.append("\"bottomRank\":[");
		ArrayList<MdcTemperature> bottomList = mapTemps.get(bottomKey);
		getSignalDataByTemp(bottomList,activeSignals);
		for(MdcTemperature mt : bottomList){
			if(mt.val == -1) continue;
			str += String.format("{\"x\":\"%s\",\"y\":\"%s\",\"val\":\"%s\"},", 
					mt.x,mt.y,mt.val);
		}
		str = (str.length() == 0) ? "" : str.substring(0,str.length()-1);
		sb.append(str);
		sb.append("]");
		sb.append("}");
		return sb.toString();
	}
	
	//根据温场数据获得信号值(0-1)
	public void getSignalDataByTemp(ArrayList<MdcTemperature> temps,List<ActiveSignal> activeSignals){
		for(MdcTemperature mt : temps){
			double v = -1;
			for(ActiveSignal as : activeSignals){
				if(as.deviceId == mt.deviceId && as.signalId == mt.signalId){
					if(as.floatValue >= 18 && as.floatValue <= 38){
						v = (as.floatValue - 18) / 20;
						v = 1 - CabinetDeviceMap.parseDouble(String.format("%.2f", v));
					}else if(as.floatValue < 18){
						v = 1;
					}else if(as.floatValue > 38){
						v = 0;
					}
					if(mt.val != v) mt.val = v;
					break;
				 }
			}
			if(v == -1) mt.val = -1;//采集失败
		}
	}
	//根据温场数据获得信号值
	public void getTempDataByList(ArrayList<MdcTemperature> temps,List<ActiveSignal> activeSignals){
		double value = 0;
		for(MdcTemperature mt : temps){
			for(ActiveSignal as : activeSignals){
				if(as.deviceId == mt.deviceId && as.signalId == mt.signalId){
					value = (double)Math.round(as.floatValue*10)/10;
					if(mt.val != value) mt.val = value;
					break;
				 }
			}
		}
	}
	
	// 将Json转成集合并存储到HashMap中，已设备编号为Key
	public Set<Integer> groupedByCabinetId(String mdcId,List<CabinetDeviceMap> cdmList){
		if(powerDeviceIds.containsKey(mdcId+"Cabinet")) 
			return powerDeviceIds.get(mdcId+"Cabinet");
		Set<Integer> deviceIds = new HashSet<Integer>(); 
		try {
			//获得对象的所有属性列
			Field[] fields = CabinetDeviceMap.class.getDeclaredFields();
			for(CabinetDeviceMap cdm : cdmList){
				for(Field f : fields){
					String attrName = f.getName();
					if(attrName.indexOf("DeviceId") > -1){
						String val = (String)f.get(cdm);
						if(val == null || val.equals("")) continue;
						deviceIds.add(CabinetDeviceMap.parseInt(val));
					}
				}
			}
			powerDeviceIds.put(mdcId+"Cabinet", deviceIds);
		} catch (Exception e) {
			log.error("Access Exception:"+e);
		}
		return deviceIds;
	}
	// 计算三相功率之和
	public synchronized double getPowerBySingal(CabinetDeviceMap cd,List<ActiveSignal> activeSignals){
		double current = 0,voltage = 0,power = 0;

		current = getValueByDeviceIdAndSignal(cd.PhaseACurrentDeviceId,cd.PhaseACurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(cd.PhaseAVoltageDeviceId,cd.PhaseAVoltageSignalId,activeSignals);
		power += current * voltage;
		
		current = getValueByDeviceIdAndSignal(cd.PhaseBCurrentDeviceId,cd.PhaseBCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(cd.PhaseBVoltageDeviceId,cd.PhaseBVoltageSignalId,activeSignals);
		power += current * voltage;
		
		current = getValueByDeviceIdAndSignal(cd.PhaseCCurrentDeviceId,cd.PhaseCCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(cd.PhaseCVoltageDeviceId,cd.PhaseCVoltageSignalId,activeSignals);
		power += current * voltage;

		return power;
	}

	public synchronized double getPowerBySingal(Cabinet cd,List<ActiveSignal> activeSignals){
		double current = 0,voltage = 0,power = 0;

		current = getValueByDeviceIdAndSignal(cd.PhaseACurrentDeviceId,cd.PhaseACurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(cd.PhaseAVoltageDeviceId,cd.PhaseAVoltageSignalId,activeSignals);
		power += current * voltage;
		
		current = getValueByDeviceIdAndSignal(cd.PhaseBCurrentDeviceId,cd.PhaseBCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(cd.PhaseBVoltageDeviceId,cd.PhaseBVoltageSignalId,activeSignals);
		power += current * voltage;
		
		current = getValueByDeviceIdAndSignal(cd.PhaseCCurrentDeviceId,cd.PhaseCCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(cd.PhaseCVoltageDeviceId,cd.PhaseCVoltageSignalId,activeSignals);
		power += current * voltage;

		return power;
	}
	// 计算所有信号之和
	public double getSumBySignal(CabinetDeviceMap cd,List<ActiveSignal> activeSignals){
		double sum = 0;
		
		sum += getValueByDeviceIdAndSignal(cd.PhaseACurrentDeviceId,cd.PhaseACurrentSignalId,activeSignals);
		sum += getValueByDeviceIdAndSignal(cd.PhaseAVoltageDeviceId,cd.PhaseAVoltageSignalId,activeSignals);
		sum += getValueByDeviceIdAndSignal(cd.PhaseBCurrentDeviceId,cd.PhaseBCurrentSignalId,activeSignals);		
		sum += getValueByDeviceIdAndSignal(cd.PhaseBVoltageDeviceId,cd.PhaseBVoltageSignalId,activeSignals);
		sum += getValueByDeviceIdAndSignal(cd.PhaseCCurrentDeviceId,cd.PhaseCCurrentSignalId,activeSignals);
		sum += getValueByDeviceIdAndSignal(cd.PhaseCVoltageDeviceId,cd.PhaseCVoltageSignalId,activeSignals);
		
		return sum;
	}
	// 计算MDC的两路三相功率之和
	public double getMdcBySingal(Mdc mdc,List<ActiveSignal> activeSignals){
		double current = 0,voltage = 0,power = 0;
		
		current = getValueByDeviceIdAndSignal(mdc.line1PhaseACurrentDeviceId,mdc.line1PhaseACurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(mdc.line1PhaseAVoltageDeviceId,mdc.line1PhaseAVoltageSignalId,activeSignals);
		power += current * voltage;

		current = getValueByDeviceIdAndSignal(mdc.line1PhaseBCurrentDeviceId,mdc.line1PhaseBCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(mdc.line1PhaseBVoltageDeviceId,mdc.line1PhaseBVoltageSignalId,activeSignals);
		power += current * voltage;
		
		current = getValueByDeviceIdAndSignal(mdc.line1PhaseCCurrentDeviceId,mdc.line1PhaseCCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(mdc.line1PhaseCVoltageDeviceId,mdc.line1PhaseCVoltageSignalId,activeSignals);
		power += current * voltage;

		current = getValueByDeviceIdAndSignal(mdc.line2PhaseACurrentDeviceId,mdc.line2PhaseACurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(mdc.line2PhaseAVoltageDeviceId,mdc.line2PhaseAVoltageSignalId,activeSignals);
		power += current * voltage;

		current = getValueByDeviceIdAndSignal(mdc.line2PhaseBCurrentDeviceId,mdc.line2PhaseBCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(mdc.line2PhaseBVoltageDeviceId,mdc.line2PhaseBVoltageSignalId,activeSignals);
		power += current * voltage;
		
		current = getValueByDeviceIdAndSignal(mdc.line2PhaseCCurrentDeviceId,mdc.line2PhaseCCurrentSignalId,activeSignals);
		voltage = getValueByDeviceIdAndSignal(mdc.line2PhaseCVoltageDeviceId,mdc.line2PhaseCVoltageSignalId,activeSignals);
		power += current * voltage;
		
		return power;
	}
	
	
	private synchronized double getValueByDeviceIdAndSignal(String deviceId,String signalId,List<ActiveSignal> activeSignals){
		if(deviceId == null || signalId == null || deviceId.equals("") || signalId.equals("")) 
			return 0;
		for(ActiveSignal as : activeSignals){
			if(as.deviceId == CabinetDeviceMap.parseInt(deviceId) && as.signalId == CabinetDeviceMap.parseInt(signalId)){
				return as.floatValue;
			}
		}
		return 0;
	}
	private synchronized double getValueByDeviceIdAndSignal(int deviceId,int signalId,List<ActiveSignal> activeSignals){
		if(deviceId == 0 || signalId == 0) return 0;
		for(ActiveSignal as : activeSignals){
			if(as.deviceId == deviceId && as.signalId == signalId){
				return as.floatValue;
			}
		}
		return 0;
	}
	//查询MDC表的所有MDCID和对应的deviceID key:MDCID value:deviceId
	public HashMap<Integer,Set<Integer>> getAllMdcByDevices(){
		if(allDevices.keySet().size() !=0 ) return allDevices;
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("SELECT ");
			sb.append("	 Id,");
			sb.append("   Line1PhaseACurrentDeviceId,");
			sb.append("   Line1PhaseAVoltageDeviceId,");
			sb.append("   Line1PhaseBCurrentDeviceId,");
			sb.append("   Line1PhaseBVoltageDeviceId,");
			sb.append("   Line1PhaseCCurrentDeviceId,");
			sb.append("   Line1PhaseCVoltageDeviceId,");
			sb.append("   Line2PhaseACurrentDeviceId,");
			sb.append("   Line2PhaseAVoltageDeviceId,");
			sb.append("   Line2PhaseBCurrentDeviceId,");
			sb.append("   Line2PhaseBVoltageDeviceId,");
			sb.append("   Line2PhaseCCurrentDeviceId,");
			sb.append("   Line2PhaseCVoltageDeviceId ");
			sb.append("FROM mdc;");
	        DataTable dt = dbHelper.executeToTable(sb.toString());
	        Set<Integer> values = null;
	        int count = dt.getRowCount();
	        DataRowCollection drs = dt.getRows();
	        DataColumnCollection columns = drs.getColumns();
			int colSize = columns.size();
			for(int i = 0;i<count;i++){
				DataRow dataRow = dt.getRows().get(i);
				String id = dataRow.getValueAsString("Id");
				if(id == null || id.equals("")) continue;
				int key = CabinetDeviceMap.parseInt(id);
				values = new HashSet<Integer>();
				for(int j = 0;j<colSize;j++){
					String colName = columns.get(j).getCaptionName();
					if(colName.indexOf("DeviceId") >= 0){
						String deviceId = dataRow.getValueAsString(colName);
						if(deviceId == null || deviceId.equals("")) continue;
						values.add(CabinetDeviceMap.parseInt(deviceId));
					}
				}
				//MDC对应的IT柜
				sb = new StringBuffer();
				sb.append("SELECT PhaseACurrentDeviceId,PhaseAVoltageDeviceId,PhaseBCurrentDeviceId,PhaseBVoltageDeviceId,");
				sb.append("PhaseCCurrentDeviceId,PhaseCVoltageDeviceId FROM cabinet WHERE CabinetType = 'RACK' ");
				sb.append(String.format("AND MDCId = %s;", key));
				DataTable dts = dbHelper.executeToTable(sb.toString());
				int counts = dts.getRowCount();
				DataRowCollection drcs = dts.getRows();
				DataColumnCollection columnss = drcs.getColumns();
				int colSizes = columnss.size();
				for(int x = 0;x < counts;x ++){
					dataRow = dts.getRows().get(x);
					for(int y = 0;y<colSizes;y++){
						String colName = columnss.get(y).getCaptionName();
						if(colName.indexOf("DeviceId") >= 0){
							String deviceId = dataRow.getValueAsString(colName);
							if(deviceId == null || deviceId.equals("")) continue;
							values.add(CabinetDeviceMap.parseInt(deviceId));
						}
					}
				}
				allDevices.put(key, values);
			}
		} catch (Exception e) {
			log.error("Database anomaly:"+e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return allDevices;
	}
	
	//定时一天添加一次mPue值到puerecord表
	public void insertmPueRecord(String mdcId,double mPueData,Date current,SimpleDateFormat sdf){
		DatabaseHelper dbHelper = null;
		try {
	        dbHelper = new DatabaseHelper();
	        String sql = String.format("SELECT collectTime FROM puerecord WHERE MDCId = %s ORDER BY collectTime DESC LIMIT 1;", mdcId);
	        DataTable dt = dbHelper.executeToTable(sql);
	        String old = "";
	        for(int i = 0;i<dt.getRowCount();i++){
	        	old = dt.getRows().get(i).getValueAsString("collectTime");
	        }
	        //获得mPue最后的插入时间
	        Date oldDate = old.equals("") ? sdf.parse("1970-01-01") : sdf.parse(old);
	        recordTime.put(mdcId,oldDate.getTime());
	        //比较两个时间的凌晨大小，区别不同于一天。
	        if(recordTime.get(mdcId) < current.getTime()){
	        	//获得当时时间字符串
	        	String dateStr = sdf.format(current);
	        	sql = String.format("INSERT INTO puerecord VALUES(%s,%s,'%s');", mdcId,mPueData,dateStr);
	        	dbHelper.executeNoQuery(sql);
	        }
	        oldTime.remove(mdcId);
		} catch (Exception e) {
			log.error("Database anomaly:"+e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public void timerInsertmPueRecord(){
		if(ActiveSignalDataHandler.proxy == null) return;
		try {
			//获得所有的MDC的ID
			//所有的设备ID根据MDCID分组
			HashMap<Integer,Set<Integer>> allDevices = getAllMdcByDevices();
			for(Integer mdcId : allDevices.keySet()){
				Date date = new Date();
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");  
		        Date current = sdf.parse(sdf.format(date));//获得时间的年月日
		        //最后记录时间和当前时间不同一天
		        if(recordTime.containsKey(mdcId) && recordTime.get(mdcId) >= current.getTime()) continue;
		        
				List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
				for(Integer equipId : allDevices.get(mdcId)){
					ArrayList<ActiveSignal> ads = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
					if(ads != null) activeSignals.addAll(ads);
				}
				if(activeSignals.size() == 0) break;
				//获得mPUE的JSON
				addmPueHashMap(mdcId);
				double mPueData = getmPueData(String.valueOf(mdcId),activeSignals);
	            mPueData = (double)Math.round(mPueData*100)/100;

				//定时一天添加一次mPue值到puerecord表
				if(mPueData >= 1)
					insertmPueRecord(String.valueOf(mdcId),mPueData,current,sdf);
			}
		} catch (Exception e) {
			log.error("Database anomaly:",e);
		}
	}
	
	private void addmPueHashMap(Integer mdcId){
		if(mapGroupsMdc.containsKey(mdcId+mPueDataTotle)) return;
		try {
			//总功率
			String json = JsonHelper.ListjsonString("list", MdcAlarmProvider.getInstance().getTotalPower(String.valueOf(mdcId)));
			JSONObject obj = new JSONObject(json);
			List<Mdc> totals = Mdc.getJsonListCabinet(obj.get("list").toString());
			mapGroupsMdc.put(mdcId+mPueDataTotle, totals);
			//IT功率
			json = JsonHelper.ListjsonString("list",MdcAlarmProvider.getInstance().getRatedLoad(String.valueOf(mdcId)));
			obj = new JSONObject(json);
			List<CabinetDeviceMap> reteds = CabinetDeviceMap.getJsonListCabinet(obj.get("list").toString());
			mapGroupsPower.put(mdcId+mPueData, reteds);
		} catch (Exception e) {
			log.error("JSON Format Error",e);
		}
	}
	
	public List<ThermalSensors> getThermalSensorsList(String jsonParams){
		ArrayList<ThermalSensors> tsList = new ArrayList<ThermalSensors>();
		JSONArray array = new JSONArray(jsonParams);
		String mdcId = "";
		for(int i = 0;i<array.length();i++){
			JSONObject param = new JSONObject(array.get(i).toString());
			ThermalSensors ts = new ThermalSensors();
			
			mdcId = param.getString("mdcId");
			if(thermalSensorsMap.containsKey(mdcId)) return thermalSensorsMap.get(mdcId);
			
			ts.mdcId = mdcId;
			ts.id = CabinetDeviceMap.parseInt(param.getString("id"));
			ts.name = param.getString("name");
			ts.side = param.getString("side");
			ts.temps = param.get("temps").toString();
			
			tsList.add(ts);
		}
		thermalSensorsMap.put(mdcId,tsList);
		return thermalSensorsMap.get(mdcId);
	}
	
	public Set<Integer> getTemperatureDeviceids(List<ThermalSensors> tsList){
		Set<Integer> deviceIds = new HashSet<Integer>();
		String mdcId = "";
		for(ThermalSensors ts : tsList){
			mdcId = ts.mdcId;
			if(powerDeviceIds.containsKey(mdcId+"ThermalSensors"))
				return powerDeviceIds.get(mdcId+"ThermalSensors");

			if(ts.temps != null && !ts.temps.equals("")){
				JSONObject obj = new JSONObject(ts.temps);
				if(obj.get("deviceId") == null || Integer.parseInt(obj.getString("deviceId")) <= 0)
					continue;
				
				MdcTemperature mt = new MdcTemperature();
				mt.slideName = obj.getString("slideName");
				mt.deviceId = CabinetDeviceMap.parseInt(obj.getString("deviceId"));
				mt.signalId = CabinetDeviceMap.parseInt(obj.getString("signalId"));
				mt.x = CabinetDeviceMap.parseDouble(obj.getString("x"));
				mt.y = CabinetDeviceMap.parseDouble(obj.getString("y"));
				
				String key = String.format("%s|%s|%s|%s|%s",mt.slideName,mt.deviceId,mt.signalId,mt.x,mt.y);
				temperatureMap.put(key, mt);
								
				deviceIds.add(mt.deviceId);
			}
		}
		powerDeviceIds.put(mdcId+"ThermalSensors", deviceIds);
		return powerDeviceIds.get(mdcId+"ThermalSensors");
	}
	
	public String getTemperatureJson(List<ThermalSensors> tsList,List<ActiveSignal> activeSignals){
		for(ThermalSensors ts : tsList){
			JSONObject obj = new JSONObject(ts.temps);
			String key = String.format("%s|%s|%s|%s|%s",obj.getString("slideName"),obj.getString("deviceId"),
					obj.getString("signalId"),obj.getString("x"),obj.getString("y"));
			if(!temperatureMap.containsKey(key)) continue;
			MdcTemperature mt = temperatureMap.get(key);
			for(ActiveSignal as : activeSignals){
				if(mt.deviceId == as.deviceId && mt.signalId == as.signalId){
					double value = (double)Math.round(as.floatValue*10)/10;
					if(value != 0 && value != mt.val)
						mt.val = value;
				}
			}
			ts.temps = JsonHelper.jsonObject(mt).toString();
		}
		return JsonHelper.ListjsonString("ret", tsList);
	}
	
	public String getCabinetInfoById(String mdcId,String cabinetId,ArrayList<ActiveSignal> activeSignals){
		
		StringBuffer sb = new StringBuffer();
		sb.append("{\"ret\":{");
		
		//\"ratedPower\":%s,\"activePower\":%s,
		sb.append(gitCabinetRatedPowerAndActivePower(mdcId,cabinetId,activeSignals));
		
		//\"cabinetBottomTemperature\":%s,\"cabinetMiddleTemperature\":%s,\"cabinetTopTemperature\":%s
		sb.append(getCabinetTemperature(mdcId,cabinetId,activeSignals));
		
		sb.append("}}");
		return sb.toString();
	}
	private String gitCabinetRatedPowerAndActivePower(String mdcId,String cabinetId,ArrayList<ActiveSignal> activeSignals){
		DatabaseHelper dbHelper = null;
		double ratedPower = 0,activePower = 0;
		String key = String.format("%s|%s", mdcId,cabinetId);
		try {
			CabinetDeviceMap cdm = new CabinetDeviceMap();
			
			if(CabinetPowerMap.containsKey(key))
				 cdm = CabinetPowerMap.get(key);
			else{
				dbHelper = new DatabaseHelper();
				StringBuffer sb = new StringBuffer();
				sb.append("SELECT ");
				sb.append("	A.RatedCurrent,");
				sb.append("	A.RatedVoltage,");
				sb.append(" A.PhaseACurrentDeviceId, ");
				sb.append("	A.PhaseACurrentSignalId, ");
				sb.append("	A.PhaseAVoltageDeviceId, ");
				sb.append("	A.PhaseAVoltageSignalId, ");
				sb.append("	A.PhaseBCurrentDeviceId, ");
				sb.append("	A.PhaseBCurrentSignalId, ");
				sb.append("	A.PhaseBVoltageDeviceId, ");
				sb.append("	A.PhaseBVoltageSignalId, ");
				sb.append("	A.PhaseCCurrentDeviceId, ");
				sb.append("	A.PhaseCCurrentSignalId, ");
				sb.append("	A.PhaseCVoltageDeviceId, ");
				sb.append("	A.PhaseCVoltageSignalId  ");
				sb.append(String.format("FROM cabinet A WHERE A.MDCId = %s ", mdcId));
				sb.append("AND A.Id LIKE '%"+cabinetId+"';");
				DataTable dt = dbHelper.executeToTable(sb.toString());
				for(int i = 0; i < dt.getRowCount(); i++){
					DataRow dr = dt.getRows().get(i);
					cdm.ratedCurrent = CabinetDeviceMap.parseDouble(dr.getValueAsString("RatedCurrent"));
					cdm.ratedVoltage = CabinetDeviceMap.parseDouble(dr.getValueAsString("RatedVoltage"));
					
					cdm.PhaseACurrentDeviceId = dr.getValueAsString("PhaseACurrentDeviceId");
					cdm.PhaseACurrentSignalId = dr.getValueAsString("PhaseACurrentSignalId");
					cdm.PhaseAVoltageDeviceId = dr.getValueAsString("PhaseAVoltageDeviceId");
					cdm.PhaseAVoltageSignalId = dr.getValueAsString("PhaseAVoltageSignalId");
					cdm.PhaseBCurrentDeviceId = dr.getValueAsString("PhaseBCurrentDeviceId");
					cdm.PhaseBCurrentSignalId = dr.getValueAsString("PhaseBCurrentSignalId");
					cdm.PhaseBVoltageDeviceId = dr.getValueAsString("PhaseBVoltageDeviceId");
					cdm.PhaseBVoltageSignalId = dr.getValueAsString("PhaseBVoltageSignalId");
					cdm.PhaseCCurrentDeviceId = dr.getValueAsString("PhaseCCurrentDeviceId");
					cdm.PhaseCCurrentSignalId = dr.getValueAsString("PhaseCCurrentSignalId");
					cdm.PhaseCVoltageDeviceId = dr.getValueAsString("PhaseCVoltageDeviceId");
					cdm.PhaseCVoltageSignalId = dr.getValueAsString("PhaseCVoltageSignalId");		
				}
				CabinetPowerMap.put(key, cdm);
			}
			double ratedCurrent = CabinetDeviceMap.parseDouble(cdm.ratedCurrent);
			double ratedVoltage = CabinetDeviceMap.parseDouble(cdm.ratedVoltage);
			ratedPower = ratedCurrent * ratedVoltage;//额定功率
			if(activeSignals.size() == 0)
				activePower = 0;
			else
				activePower = getPowerBySingal(cdm,activeSignals);//实时功率
			return String.format("\"ratedPower\":%s,\"activePower\":%s,", ratedPower,activePower);
		} catch (Exception e) {
			log.error("Database anomaly:"+e);
		}finally{
			if(dbHelper != null)dbHelper.close();
		}
		return "\"ratedPower\":0,\"activePower\":0,";
	}
	
	public Set<Integer> getDeviceIdByCabinet(String mdcId,String cabinetId){
		DatabaseHelper dbHelper = null;
		Set<Integer> deviceIds = new HashSet<Integer>();
		String key = String.format("%s|%s", mdcId,cabinetId);
		if(DeviceCabinetMap.containsKey(key))
			return DeviceCabinetMap.get(key);
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("SELECT ");
			sb.append(" A.PhaseACurrentDeviceId, ");
			sb.append("	A.PhaseAVoltageDeviceId, ");
			sb.append("	A.PhaseBCurrentDeviceId, ");
			sb.append("	A.PhaseBVoltageDeviceId, ");
			sb.append("	A.PhaseCCurrentDeviceId, ");
			sb.append("	A.PhaseCVoltageDeviceId ");
			sb.append(String.format("FROM cabinet A WHERE A.MDCId = %s ", mdcId));
			sb.append("AND A.Id LIKE '%"+cabinetId+"';");
			DataTable dt = dbHelper.executeToTable(sb.toString());
			for(int i = 0; i < dt.getRowCount(); i++){
				DataRow dr = dt.getRows().get(i);
				deviceIds.add(CabinetDeviceMap.parseInt(dr.getValueAsString("PhaseACurrentDeviceId")));
				deviceIds.add(CabinetDeviceMap.parseInt(dr.getValueAsString("PhaseAVoltageDeviceId")));
				deviceIds.add(CabinetDeviceMap.parseInt(dr.getValueAsString("PhaseBCurrentDeviceId")));
				deviceIds.add(CabinetDeviceMap.parseInt(dr.getValueAsString("PhaseBVoltageDeviceId")));
				deviceIds.add(CabinetDeviceMap.parseInt(dr.getValueAsString("PhaseCCurrentDeviceId")));
				deviceIds.add(CabinetDeviceMap.parseInt(dr.getValueAsString("PhaseCVoltageDeviceId")));
			}
			
			String sql = "SELECT DeviceId FROM thermal_sensors WHERE MDCId = "+mdcId+" AND CabinetId LIKE '%"+cabinetId+"';";
			dt = dbHelper.executeToTable(sql);
			for(int i = 0; i < dt.getRowCount(); i++){
				DataRow dr = dt.getRows().get(i);			
				int deviceId = CabinetDeviceMap.parseInt(dr.getValueAsString("DeviceId"));
				deviceIds.add(deviceId);
			}
			DeviceCabinetMap.put(key, deviceIds);
		} catch (Exception e) {
			log.error("Database anomaly:"+e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return deviceIds;
	}
	
	private String getCabinetTemperature(String mdcId,String cabinetId,ArrayList<ActiveSignal> activeSignals){
		if(activeSignals.size() == 0)
			return "\"cabinetBottomTemperature\":0,\"cabinetMiddleTemperature\":0,\"cabinetTopTemperature\":0";
		
		DatabaseHelper dbHelper = null;
		//分别是50 、 100 、 150 位置的温度
		double bottomTemp = 0,middleTemp = 0,topTemp = 0,value = 0;
		List<MdcTemperature> list = new ArrayList<MdcTemperature>();
		String key = String.format("%s|%s", mdcId,cabinetId);
		try {
			if(CabinetTemperatureMap.containsKey(key))
				list = CabinetTemperatureMap.get(key);
			else{
				dbHelper = new DatabaseHelper();
				String sql = "SELECT DeviceId,SignalId,y FROM thermal_sensors WHERE MDCId = "+mdcId+" AND CabinetId LIKE '%"+cabinetId+"' AND DeviceId IS NOT NULL AND SignalId IS NOT NULL;";
				DataTable dt = dbHelper.executeToTable(sql);
				for(int i = 0; i < dt.getRowCount(); i++){
					DataRow dr = dt.getRows().get(i);	
					MdcTemperature mt = new MdcTemperature();
					mt.deviceId = CabinetDeviceMap.parseInt(dr.getValueAsString("DeviceId"));
					mt.signalId = CabinetDeviceMap.parseInt(dr.getValueAsString("SignalId"));
					mt.y = CabinetDeviceMap.parseInt(dr.getValueAsString("y"));
					list.add(mt);
				}
				CabinetTemperatureMap.put(key, list);
			}
			for(MdcTemperature mt : list){
				for(ActiveSignal as : activeSignals){
					if(as.deviceId == mt.deviceId && as.signalId == mt.signalId){
						value = (double)Math.round(as.floatValue*10)/10;
						break;
					 }
				}
				if(mt.y >= 0 && mt.y <= 50) bottomTemp = value;
				else if(mt.y > 50 && mt.y <= 100) middleTemp = value;
				else if(mt.y > 100) topTemp = value;
			}
			return String.format("\"cabinetBottomTemperature\":%s,\"cabinetMiddleTemperature\":%s,\"cabinetTopTemperature\":%s",
					bottomTemp,middleTemp,topTemp);
		} catch (Exception e) {
			log.error("Database anomaly:"+e);
		}finally{
			if(dbHelper != null)dbHelper.close();
		}
		return "\"cabinetBottomTemperature\":0,\"cabinetMiddleTemperature\":0,\"cabinetTopTemperature\":0";
	}

	public List<AisleThermalHumidity> getAisleThermalHumidity(String mdcId) {
		DatabaseHelper dbHelper = null;
		List<AisleThermalHumidity> list = new ArrayList<AisleThermalHumidity>();
		try
        {
            dbHelper = new DatabaseHelper();
    		if(aisleThermalHumidity.containsKey(mdcId)) 
    			return getThermalHumidityValue(aisleThermalHumidity.get(mdcId));
    		
            String sql = String.format("SELECT * FROM MDC_AisleThermalHumidity WHERE MDCId = %s AND TDeviceId IS NOT NULL OR HDeviceId IS NOT NULL;", mdcId);
            DataTable dt = dbHelper.executeToTable(sql);
            ArrayList<AisleThermalHumidity> aths = AisleThermalHumidity.fromDataTable(dt);
            aisleThermalHumidity.put(mdcId, aths);
            
            list = getThermalHumidityValue(aisleThermalHumidity.get(mdcId));
		} catch (Exception e) {
			log.error("GetAisleThermalHumidity Exception", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return list;
	}
	
	private List<AisleThermalHumidity> getThermalHumidityValue(List<AisleThermalHumidity> aths){
		try {
			ArrayList<ActiveSignal> ads = new ArrayList<ActiveSignal>();
			for(AisleThermalHumidity ath : aths){
				int deviceId = ath.tDeviceId != null && !ath.tDeviceId.equals("") ? Integer.parseInt(ath.tDeviceId) : 0;
				int signalId = ath.tSignalId != null && !ath.tSignalId.equals("") ? Integer.parseInt(ath.tSignalId) : 0;

				if(deviceId > 0){
					ads = ConfigCache.getInstance().getActiveDeviceSignal(deviceId);
					for(ActiveSignal as : ads){
						if(as.signalId == signalId)
							ath.tValue = as.getCurrentValue();
					}
				}

				int id = ath.hDeviceId != null && !ath.hDeviceId.equals("") ? Integer.parseInt(ath.hDeviceId) : 0;
				signalId = ath.hSignalId != null && !ath.hSignalId.equals("") ? Integer.parseInt(ath.hSignalId) : 0;
				
				if(deviceId != id){
					ads = ConfigCache.getInstance().getActiveDeviceSignal(id);
				}
				deviceId = id;
				if(deviceId > 0){
					ads = ConfigCache.getInstance().getActiveDeviceSignal(deviceId);
					for(ActiveSignal as : ads){
						if(as.signalId == signalId)
							ath.hValue = as.getCurrentValue();
					}
				}
			}
		} catch (Exception e) {
			log.error("GetThermalHumidityValue Exception", e);
		} finally {
			
		}
		return aths;
	}
	
	/* MDC图表  *******************************/
	/** 实时PUE */
	public String getActivePueChartsData(){
		try {
			if(ChartMdcConfig.size() == 0) ChartMdcConfig = loadChartMdcConfig();
			if(ChartCabinetsConfig.size() == 0) ChartCabinetsConfig = loadChartCabinetsConfig();
			if(idHashSet.size() == 0) idHashSet = loadMdcDeviceIdList();
			
			List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
			if (idHashSet != null) {
				for (Integer equipId : idHashSet) {
					ArrayList<ActiveSignal> tmpList = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
					if (tmpList != null) {
						activeSignals.addAll(tmpList);
					}
				}
			}
			if(activeSignals.size() == 0) return "0.0";
			
			double totlePower = 0,power = 0;
			//总设备功率
			for(Mdc mdc : ChartMdcConfig){
				double dou = getMdcBySingal(mdc,activeSignals);
				if(mdc.power != dou && dou != 0) mdc.power = dou;
				totlePower += mdc.power;
			}
			
			//IT设备功率
			List<Cabinet> cdms = ChartCabinetsConfig;
			for(Cabinet cdm : cdms){
				if(!cdm.CabinetType.equals("RACK")) continue;
				double dou = getPowerBySingal(cdm,activeSignals);
				if(dou != 0)
					power += dou;
			}
			double fruit = totlePower/power;//mPUE
			if(totlePower == 0 || power == 0)
				fruit = 0;
			
			return String.format("%.2f", fruit);
		} catch (Exception e) {
			log.error("getActivePueChartsData Exception:",e);
		}
		return "0.0";
	}
	
	/** 实时MDC功率 */
	public String getActivePowerChartsData(){
		try {
			if(ChartMdcConfig.size() == 0) ChartMdcConfig = loadChartMdcConfig();
			if(idHashSet.size() == 0) idHashSet = loadMdcDeviceIdList();
			
			List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
			if (idHashSet != null) {
				for (Integer equipId : idHashSet) {
					ArrayList<ActiveSignal> tmpList = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
					if (tmpList != null) {
						activeSignals.addAll(tmpList);
					}
				}
			}
			if(activeSignals.size() == 0) return "0.0";
			
			double totlePower = 0;
			//总设备功率
			for(Mdc mdc : ChartMdcConfig){
				double dou = getMdcBySingal(mdc,activeSignals);
				if(mdc.power != dou && dou != 0) mdc.power = dou;
				totlePower += mdc.power;
			}
			totlePower /= 1000;// 单位kW
			return String.format("%.2f", totlePower);
		} catch (Exception e) {
			log.error("getActivePowerChartsData Exception:",e);
		}
		return "0.0";
	} 
	
	/** MDC空间使用率 */
	public String getMdcSpaceChartsData(){
		try {
			if(ChartMdcConfig.size() == 0) 
				ChartMdcConfig = loadChartMdcConfig();
			if(ChartCabinetDevicesConfig.size() == 0)
				ChartCabinetDevicesConfig = loadChartCabinetDevicesConfig();

			double totleSpace = 0,space = 0;
			for(Mdc mc :ChartMdcConfig){
				totleSpace += mc.cabinetNumber*mc.cabinetUHeight;
			}
			
			for(CabinetDeviceMap cdm : ChartCabinetDevicesConfig ){
				if(cdm.UHeight == null) cdm.UHeight = 0;
				space += cdm.UHeight;
			}
			double result = 100;
			if(space > 0)
				result = (space/totleSpace)*100;
			else
				result = 0;

			if(result > 100) result = 100;
			double other = 100 - result;
			return String.format("{\"other\":\"%s\",\"usage\":\"%s\",\"value\":\"%s\"}",
					String.format("%.2f", other),String.format("%.2f", result),String.format("%.0f", space));
		} catch (Exception e) {
			log.error("getMdcSpaceChartsData Exception:",e);
		}
		return "{\"other\":1,\"usage\":0}";
	}
	
	public String getItLoadChartsData(){
		try {
			if(ChartCabinetsConfig.size() == 0) ChartCabinetsConfig = loadChartCabinetsConfig();
			if(idHashSet.size() == 0) idHashSet = loadMdcDeviceIdList();
			
			List<ActiveSignal> activeSignals = new ArrayList<ActiveSignal>();
			if (idHashSet != null) {
				for (Integer equipId : idHashSet) {
					ArrayList<ActiveSignal> tmpList = ConfigCache.getInstance().getActiveDeviceSignal(equipId);
					if (tmpList != null) {
						activeSignals.addAll(tmpList);
					}
				}
			}
			if(activeSignals.size() == 0) return "{\"other\":1,\"usage\":0}";
			
			//IT负载
			double retedPower = 0,totlePower = 0;
			List<Cabinet> cdms = ChartCabinetsConfig;
			for(Cabinet cdm : cdms){
				if(!cdm.CabinetType.equals("RACK")) continue;
				double dou = getPowerBySingal(cdm,activeSignals);
				if(dou != 0)
					retedPower += dou;
			}
			retedPower /= 1000;//单位位kw
			//总能耗
			for(Mdc mdc : ChartMdcConfig){
				double dou = getMdcBySingal(mdc,activeSignals);
				if(mdc.power != dou && dou != 0) mdc.power = dou;
				totlePower += mdc.power;
			}
			totlePower /= 1000;//单位位kw
			
			double usage = 100;
			if(retedPower > 0)
				usage = (retedPower / totlePower)*100;
			else
				usage = 0;
			
			if(usage > 100) usage = 100; 
			double other = 100 - usage;
			
			return String.format("{\"other\":\"%s\",\"usage\":\"%s\",\"value\":\"%s\"}",
					String.format("%.2f", other),String.format("%.2f", usage),String.format("%.2f", retedPower));
		} catch (Exception e) {
			log.error("getItLoadChartsData Exception:",e);
		}
		return "{\"other\":1,\"usage\":0}";	
	}
	
	//获取所有MDC的设备编号集合
	private Set<Integer> loadMdcDeviceIdList(){
		if(ChartMdcConfig.size() == 0) ChartMdcConfig = loadChartMdcConfig();
		if(ChartCabinetsConfig.size() ==0) ChartCabinetsConfig = loadChartCabinetsConfig();
		Set<Integer> devcdids = getMdcDeviceIds(ChartMdcConfig);
		devcdids.addAll(getCabinetDeviceIds(ChartCabinetsConfig));
		
		return devcdids;
	}
	
	//获取所有的MDC表的配置
	private List<Mdc> loadChartMdcConfig(){
		try {
			return MdcAlarmProvider.getInstance().getMdcConfigInfo();
		} catch (Exception e) {
			log.error("loadChartMdcConfig Exception:",e);
		}
		return new ArrayList<Mdc>();
	}
	
	//获取所有的Cabinet表的配置
	public List<Cabinet> loadChartCabinetsConfig(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT * FROM cabinet;";
			DataTable dt = dbHelper.executeToTable(sql);
			return Cabinet.fromDataTable(dt).stream().filter(c -> c.isNotNull() == true).collect(Collectors.toList());
		} catch (Exception e) {
			log.error("loadChartMdcConfig Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return new ArrayList<Cabinet>();
	}
	
	//获取所有的Cabinet_Device_Map表的配置
	private List<CabinetDeviceMap> loadChartCabinetDevicesConfig(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT * FROM MDC_CabinetDeviceMap;";
			DataTable dt = dbHelper.executeToTable(sql);
			return CabinetDeviceMap.fromCabinetDeviceMapTable(dt).stream().filter(c -> c.isDeviceNotNull() == true).collect(Collectors.toList());
		} catch (Exception e) {
			log.error("loadChartCabinetDevicesConfig Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return new ArrayList<CabinetDeviceMap>();
	}
	
	private Set<Integer> getMdcDeviceIds(List<Mdc> mdcs){
		Set<Integer> ints = new HashSet<Integer>();
		try {
			for(Mdc mdc : mdcs){
				Field[] fields = Mdc.class.getDeclaredFields();
				for(Field f : fields){
					String attrName = f.getName();
					if(attrName.indexOf("DeviceId") > -1){
						String val = (String) f.get(mdc);
						if(val == null || val.equals("")) continue;
						ints.add(CabinetDeviceMap.parseInt(val));
					}
				}
			}
		} catch (Exception e) {
			log.error("getMdcDeviceIds Exception:",e);
		}
		return ints;
	}
	
	private Set<Integer> getCabinetDeviceIds(List<Cabinet> cdms){
		Set<Integer> ints = new HashSet<Integer>();
		try {
			for(Cabinet cdm : cdms){
				Field[] fields = Cabinet.class.getDeclaredFields();
				for(Field f : fields){
					String attrName = f.getName();
					if(attrName.indexOf("DeviceId") > -1){
						Integer val = Integer.parseInt(f.get(cdm).toString());
						if(val == null || val == 0) continue;
						ints.add(val);
					}
				}
			}
		} catch (Exception e) {
			log.error("getMdcDeviceIds Exception:",e);
		}
		return ints;
	}

}
