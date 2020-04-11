package nurse.logic.providers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.DeviceBaseType;
import nurse.entity.persist.SignalBaseType;
import nurse.entity.persist.SignalMeanings;
import nurse.entity.view.ActiveDevice;
import nurse.logic.handlers.ActiveDeviceDataHandler;
import nurse.logic.handlers.ActiveSignalDataHandler;
import nurse.utility.DatabaseHelper;
import nurse.utility.MainConfigHelper;

public class ConfigCache {
	private static Logger log = Logger.getLogger(ConfigCache.class);	
	private static ConfigCache instance = new ConfigCache();

	private ArrayList<ActiveDevice> activeDeviceCache = new ArrayList<ActiveDevice>();
	private ConcurrentHashMap<String, ActiveSignal> activeSignalCache = new ConcurrentHashMap<String,ActiveSignal>();
	private ConcurrentHashMap<String, ActiveSignal> activeBaseTypeSignalCache = new ConcurrentHashMap<String,ActiveSignal>();
	private ConcurrentHashMap<String, ArrayList<ActiveSignal>> activeDeviceSignalCache = new ConcurrentHashMap<String,ArrayList<ActiveSignal>>();
	private HashMap<String,SignalMeanings> signalMeaningsCache = new HashMap<String,SignalMeanings>();

	private ArrayList<DeviceBaseType> deviceBaseTypeCache = new ArrayList<DeviceBaseType>();
	private ArrayList<SignalBaseType> signalBaseTypeCache = new ArrayList<SignalBaseType>();

	private static String showBaseType = MainConfigHelper.getConfig().showBaseType;
	
	public static ConfigCache getInstance() {
		return instance;
	}

	public void Load(){
		loadActiveDevice();
		loadActiveSignal();
		loadActiveBaseTypeSignalCache();
		loadActiveDeviceSignalCache();
		loadSignalMeanings();
		loadDeviceBaseType();
		loadSignalBaseType();		
		//实时设备状态缓存
		ActiveDeviceDataHandler.getInstance().LoadNewActiveDevices();
	}
	
	private void loadActiveDeviceSignalCache() {
		ArrayList<ActiveSignal> ass = getAllActiveSignals();

		removeExcessActiveSignal(ass);//删除缓存中多余的信号
		for(ActiveSignal as :ass){
			if(showBaseType.equalsIgnoreCase("true"))
				if (as.baseTypeId == 0) continue;
			String key = String.valueOf(as.deviceId);
			
			if (!activeDeviceSignalCache.containsKey(key)){
				activeDeviceSignalCache.put(key, new ArrayList<ActiveSignal>());
			}else{
				removeActiveSignal(key,as);//删除相同的信号
			}
			activeDeviceSignalCache.get(key).add(as);
		}		
	}
	
	private synchronized void removeActiveSignal(String key,ActiveSignal as){
		Iterator<ActiveSignal> it = activeDeviceSignalCache.get(key).iterator();
		while(it.hasNext()){
			ActiveSignal item = it.next();
			if(item.signalId == as.signalId){
				it.remove();
			}
		}
	}
	
	private synchronized void removeExcessActiveSignal(ArrayList<ActiveSignal> ass){
		Iterator<ArrayList<ActiveSignal>> values = activeDeviceSignalCache.values().iterator();
		while(values.hasNext()){
			Iterator<ActiveSignal> list = values.next().iterator();
			while(list.hasNext()){
				ActiveSignal olds = list.next();
				boolean is = false;
				for(ActiveSignal news : ass){
					if(olds.deviceId == news.deviceId && olds.signalId == news.signalId){
						is = true;
					}
				}
				if(!is) list.remove();//缓存的信号在新信号列表中不存在
			}
		}
	}

	private void loadActiveBaseTypeSignalCache() {
		ArrayList<ActiveSignal> ass = getAllActiveSignals();
		
		for(ActiveSignal as :ass){
			if (as.baseTypeId == 0) continue;
			String key = String.valueOf(as.deviceId).concat(String.valueOf(as.baseTypeId));
			activeBaseTypeSignalCache.put(key, as);
		}
	}
	
	public ActiveSignal getActiveBaseTypeSignal(int deviceId, int baseTypeId){
		ActiveSignalDataHandler.proxy.subscribeByDevice(deviceId);
		String key = String.valueOf(deviceId).concat(String.valueOf(baseTypeId));
		if(activeBaseTypeSignalCache.containsKey(key))
			return activeBaseTypeSignalCache.get(key);
		
		return null;
	}
	
	public ArrayList<ActiveSignal> getActiveDeviceSignal(int deviceId){
		ActiveSignalDataHandler.proxy.subscribeByDevice(deviceId);
		String key = String.valueOf(deviceId);
		if(activeDeviceSignalCache.containsKey(key))
			return activeDeviceSignalCache.get(key);
		
		return new ArrayList<ActiveSignal>();
	}
	
	public void loadActiveDevice() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            
            sb.append("SELECT A.EquipmentId, A.EquipmentName, A.EquipmentTemplateId,B.EquipmentCategory,A.ConnectState, IFNULL(B.EquipmentBaseType, 0) as baseType,\r\n");
            sb.append("A.EquipmentStyle, A.UsedDate, A.Vendor,\r\n");
            sb.append("D.ItemValue,D.ItemAlias from TBL_Equipment A \r\n");
            sb.append("INNER JOIN tbl_equipmenttemplate B ON A.EquipmentTemplateId = B.EquipmentTemplateId\r\n");
            sb.append("INNER JOIN TBL_DataItem D ON D.ItemId = B.EquipmentCategory AND D.EntryId = 7\r\n");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            this.activeDeviceCache = ActiveDevice.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all devices", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
	}

	private void loadSignalBaseType() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("select A.BaseTypeId,A.SignalName,'' as Description,B.EquipmentId  from tbl_signal A ");
            sb.append("LEFT JOIN tbl_equipment B on A.EquipmentTemplateId=B.EquipmentTemplateId ");
            sb.append("where A.BaseTypeId is not null and B.EquipmentId is not null;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            this.signalBaseTypeCache = SignalBaseType.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all sig basetypes", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<SignalBaseType> getSignalBaseTypes(){
		return this.signalBaseTypeCache;
	}

	private void loadDeviceBaseType() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT *  from tbl_equipmentbasetype;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            this.deviceBaseTypeCache = DeviceBaseType.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all device basetypes", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
	}
	
	public ArrayList<DeviceBaseType> getDeviceBaseTypes(){
		return this.deviceBaseTypeCache;
	}

	private void loadSignalMeanings() {
		ArrayList<SignalMeanings> sms = SignalMeaningsProvider.getInstance().getAllSignalMeanings();
		
		for(SignalMeanings sm : sms){
			String key = String.valueOf(sm.EquipmentTemplateId).concat(String.valueOf(sm.SignalId)).concat(String.valueOf(sm.StateValue));
			signalMeaningsCache.put(key, sm);
		}
	}

	private void loadActiveSignal() {
		
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			
			sb.append("select A.StationId,A.EquipmentId,A.EquipmentName,A.EquipmentTemplateId,B.SignalId,B.SignalName,B.SignalCategory,B.Description,B.DisplayIndex, B.ShowPrecision,B.Unit,B.BaseTypeId,C.BaseTypeName,'' as StationName ");
			sb.append("from tbl_equipment A ");
			sb.append("join tbl_signal B on A.EquipmentTemplateId=B.EquipmentTemplateId ");
			sb.append("left join tbl_signalbasedic C on C.BaseTypeId=B.BaseTypeId ");
			if(showBaseType.equalsIgnoreCase("true"))
				sb.append("where B.BaseTypeId is not null;");
			//sb.append("where B.Visible = 1;");
			String sql = sb.toString(); 
			DataTable dt = dbHelper.executeToTable(sql);
			int count = dt.getRowCount();
			if(count==0) return;
			
			addActiveSignalToCache(dt);			
		} catch (Exception e) {
			log.error("no data of signal");
		} finally {
			if(dbHelper != null) dbHelper.close();
		}	
	}

	private void addActiveSignalToCache(DataTable dt) {

		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		activeSignalCache.clear();//清除原有的数据
		for(int i=0;i<rowCount;i++)
		{
			ActiveSignal si = new ActiveSignal();
			si.siteId= (int) drs.get(i).getValue("StationId");
			si.siteName =drs.get(i).getValueAsString("StationName");	
			si.deviceId = (int) drs.get(i).getValue("EquipmentId");
			si.equipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			si.deviceName = drs.get(i).getValueAsString("EquipmentName");	
			String baseTypeIdStr = drs.get(i).getValueAsString("BaseTypeId");
			si.baseTypeId = (baseTypeIdStr == null || baseTypeIdStr.equals("")) ? 0: Integer.parseInt(baseTypeIdStr);
			String signalIdStr = drs.get(i).getValueAsString("SignalId");
			si.signalId = (signalIdStr==null || signalIdStr.equals(""))?0:Integer.parseInt(signalIdStr);
			si.signalName = drs.get(i).getValueAsString("SignalName");	
			si.baseTypeName= drs.get(i).getValueAsString("SignalName");
			si.showPrecision = (String) drs.get(i).getValue("ShowPrecision");
			si.unit = drs.get(i).getValueAsString("Unit");
			si.description = drs.get(i).getValueAsString("Description");
			String signalCategoryStr = drs.get(i).getValueAsString("SignalCategory");
			si.SignalCategory= (signalCategoryStr==null || signalCategoryStr.equals(""))?0: Integer.parseInt(signalCategoryStr);
			si.displayIndex = Integer.parseInt(dt.getRows().get(i).getValueAsString("DisplayIndex")); 

			String key = String.valueOf(si.deviceId).concat(String.valueOf(si.signalId));
//			if (si.baseTypeId == 0) 
//				System.out.println(key + "\t" + si.deviceName + "\t" + si.signalName + "\t" + si.baseTypeName);
			activeSignalCache.put(key, si);
		}		
	}

	public ActiveSignal getActiveSignal(int deviceId, int signalId){
		ActiveSignalDataHandler.proxy.subscribeByDevice(deviceId);
		String key = String.valueOf(deviceId).concat(String.valueOf(signalId));
		if(activeSignalCache.containsKey(key))
			return activeSignalCache.get(key);
		
		return new ActiveSignal();
	}
	
	public SignalMeanings getSignalMeanings(int equipmentTemplateId, int signalId, short stateValue){
		String key = String.valueOf(equipmentTemplateId).concat(String.valueOf(signalId)).concat(String.valueOf(stateValue));
		if(signalMeaningsCache.containsKey(key))
			return signalMeaningsCache.get(key);
		
		return new SignalMeanings();
	}

	public ArrayList<ActiveSignal> getAllActiveSignals() {
		ArrayList<ActiveSignal> ass = new ArrayList<ActiveSignal>();
		ass.addAll(activeSignalCache.values());
		return ass;
	}

	public ArrayList<ActiveDevice> getAllActiveDevices() {
		return this.activeDeviceCache;
	}
	
	public void closeActiveSignalsByDevice(String deviceId){
		if(activeDeviceSignalCache.containsKey(deviceId)){
			activeDeviceSignalCache.remove(deviceId);
		}
	} 
	
	/** 根据BaseType查询ActiveDevice */
	public ArrayList<ActiveDevice> getEquipmentTemplatesByBaseType(String[] baseTypes){
		if(baseTypes.length == 1 && baseTypes[0].equals("")){
			return activeDeviceCache;
		}
		ArrayList<ActiveDevice> ets = new ArrayList<ActiveDevice>();
		for(String bt : baseTypes){
			int ebt = CabinetDeviceMap.parseInt(bt);
			for(ActiveDevice et : activeDeviceCache){
				if(et.baseTypeId == CabinetDeviceMap.parseInt(ebt)){
					ets.add(et);
				}
			}
		}
		return ets;
	}
}
