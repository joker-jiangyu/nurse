package nurse.logic.handlers;

import java.io.File;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.conf.MainConfig;
import nurse.entity.persist.Equipment;
import nurse.entity.persist.EquipmentTemplate;
import nurse.entity.persist.Station;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.*;
import nurse.utility.*;

public class EquipmentDataHandler extends DataHandlerBase {
	private static final String getDefaultEquipment = "getDefaultEquipment";
	private static final String getSameNameEquipment = "getSameNameEquipment";
	private static final String getInsertEquipment = "getInsertEquipment";
	private static final String getAllEquipmentList = "getAllEquipmentList";
	private static final String deleteEquipment = "deleteEquipment";
	private static final String reLoadEquipment = "reLoadEquipment";
	private static final String getLimitEquipment = "getLimitEquipment";
	private static final String getEquipmentNums = "getEquipmentNums";
	private static final String getIOEquipments = "getIOEquipments";
	private static final String updateEquipment = "updateEquipment";
	private static final String checkEquipmentConfig = "checkEquipmentConfig";

	private static final String createConfigManager = "createConfigManager";
	private static final String reloadFsu = "reloadFsu";
	private static final String rebindingEquipmentTemplate = "rebindingEquipmentTemplate";
	private static final String getHostEquipments = "getHostEquipments";

	public EquipmentDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getDefaultEquipment)){
			rep.responseResult = HandleGetDefaultEquipment(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getSameNameEquipment)){
			rep.responseResult = HandleGetSameNameEquipment(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getInsertEquipment)){
			rep.responseResult = HandleGetInsertEquipment(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getAllEquipmentList)){
			rep.responseResult = HandleGetAllEquipmentList(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.deleteEquipment)){
			rep.responseResult = HandleDeleteEquipment(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.reLoadEquipment)){
			rep.responseResult = HandleReLoadEquipment(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getLimitEquipment)){
			rep.responseResult = HandleGetLimitEquipment(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getEquipmentNums)){
			rep.responseResult = HandleGetEquipmentNums(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getIOEquipments)){
			rep.responseResult = HandleGetIOEquipments(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.updateEquipment)){
			rep.responseResult = HandleUpdateEquipment(req.requestParams, inetIp);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.checkEquipmentConfig)){
			rep.responseResult = HandleCheckEquipmentConfig(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.createConfigManager)){
			rep.responseResult = HandleCreateConfigManager(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.reloadFsu)){
			rep.responseResult = HandleReloadFsu(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.rebindingEquipmentTemplate)){
			rep.responseResult = HandleRebindingEquipmentTemplate(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentDataHandler.getHostEquipments)){
			rep.responseResult = HandleGetHostEquipments(req.requestParams);
		}
		
	}
		
	
	private String HandleGetDefaultEquipment(String requestParams) {
		
		String result = "fail to get default equipment";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
			int monitorUnitId = Integer.parseInt(paras[0]);
			int equipmentTemplateId = Integer.parseInt(paras[1]);

			ArrayList<Equipment> temp = EquipmentProvider.getInstance().GetDefaultEquipment(monitorUnitId, equipmentTemplateId);
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleGetSameNameEquipment(String requestParams) {
		
		String result = "fail to get same name equipment";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	
        	String[] paras = infoStr.split("\\|");
			int monitorUnitId = Integer.parseInt(paras[0]);
			String equipmentName = paras[1];

			DataTable dtEquipment = EquipmentProvider.getInstance().GetEquipmentsByMUId(monitorUnitId);
			int rowCount = dtEquipment.getRowCount();
			DataRowCollection drs = dtEquipment.getRows();
        	
        	for(int i=0;i<rowCount;i++)
    		{
        		String EquipmentName = (String) drs.get(i).getValue("EquipmentName");
        		if(EquipmentName.equals(equipmentName))
        		{
        			result = "Yes";
        			return result;
        		}
    		}
			
        	result = "No";

        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleGetInsertEquipment(String requestParams, String inetIp) {
		
		String result = "fail to get insert equipment";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\|");
        	
			int EquipmentId = Integer.parseInt(paras[0]);
			String EquipmentName = paras[1];
			int StationId = Integer.parseInt(paras[2]);
			int EquipmentTemplateId = Integer.parseInt(paras[3]);
			int SamplerUnitId = Integer.parseInt(paras[4]);
			int MonitorUnitId = Integer.parseInt(paras[5]);
			String UserName = paras.length > 6 ?  paras[6] : "";

			String EquipmentNo = "";//�豸�ʲ���
			String EquipmentModule = "";
			String EquipmentStyle = "";
            int EquipmentState = 1;
            int HouseId = 1;
            int ConnectState = 2;
            int EquipmentClass = -1;
            String EventExpression = "";
            String Description = "";
            int DisplayIndex = 0;
            String InstalledModule = "";
           
            ArrayList<EquipmentTemplate> equipmentTemplates = EquipmentTemplateProvider.getInstance().GetEquipmentTemplate(EquipmentTemplateId);
            
            String Vendor = "";
            String Unit = "";
            int EquipmentCategory = 99;
        	int EquipmentType = 1;
        	String Property = "";
        	
        	if(equipmentTemplates.size() > 0)
        	{
        		EquipmentTemplate equipmentTemplate = equipmentTemplates.get(0);
        		Vendor = equipmentTemplate.Vendor == null ? "" : equipmentTemplate.Vendor;
        		Unit = equipmentTemplate.Unit == null ? "" : equipmentTemplate.Unit;
        		EquipmentCategory = equipmentTemplate.EquipmentCategory;
        		EquipmentType = equipmentTemplate.EquipmentType;
        		Property = equipmentTemplate.Property == null ? "" : equipmentTemplate.Property;
        	}
            
        	Date date = new Date();
        	DateFormat format=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
			String UpdateTime=format.format(date);

			if(EquipmentId < 0)
			{
				//EquipmentId = EquipmentProvider.getInstance().GetMaxEquipmentId();
				EquipmentId = EquipmentProvider.getInstance().GenerateEquipmentId();
				boolean bRet = EquipmentProvider.getInstance().InsertEquipment(StationId, EquipmentId, EquipmentName, EquipmentNo, EquipmentModule, EquipmentStyle, EquipmentCategory, EquipmentType, EquipmentClass, EquipmentState, EventExpression, Property, Description, EquipmentTemplateId, HouseId, MonitorUnitId, SamplerUnitId, DisplayIndex, ConnectState, UpdateTime, Vendor, Unit, InstalledModule);
				if(bRet)
				{
					int nums = EquipmentProvider.getInstance().GetEquipmentNums();
					result = String.format("%d", nums);
					
					//添加Door表数据
					if(DoorProvider.getInstance().isDoorDeviceByEmpTempId(EquipmentTemplateId)){
						DoorProvider.getInstance().insertDoor(StationId, EquipmentId);
					}
					//添加到默认的组态分类
					ConfigureMoldProvider.getInstance().initConfigureMold(EquipmentId, EquipmentName, EquipmentTemplateId);

					//设备信息
					DeviceProvider.getInstance().addDeviceInfo(EquipmentId,UserName,inetIp);
				}
			}
            
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}

	private String HandleGetAllEquipmentList(String requestParams) {
		
		ArrayList<Equipment> temp = EquipmentProvider.getInstance().GetAllEquipments();
		
		return JsonHelper.ListjsonString("ret", temp);
	}
	
	private String HandleDeleteEquipment(String requestParams) {

		String result = "fail to delete equipment";
        
        try{
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\|");
        	
			int StationId = Integer.parseInt(paras[0]);
			int EquipmentId = Integer.parseInt(paras[1]);
			int SamplerUnitId = Integer.parseInt(paras[2]);
			
			int PortId = EquipmentProvider.getInstance().GetPortIdByEquipmentId(EquipmentId);
			
        	boolean bRet = EquipmentProvider.getInstance().DelEquipment(StationId, EquipmentId);
        	
        	int equipmentNums = EquipmentProvider.getInstance().GetEquipmentsBySamplerUnitId(SamplerUnitId);
        	if(equipmentNums > 0)
        	{
        		
        	}
        	else
        	{
        		//需要删除采集单元
        		EquipmentProvider.getInstance().DelSamplerUnit(SamplerUnitId);
        		
        		int samplerUnits = EquipmentProvider.getInstance().GetSmaplerUnitsByPortId(PortId);
        		if (samplerUnits <= 0)
        		{
        			//需要删除端口
        			EquipmentProvider.getInstance().DelPort(PortId);
        		}
        	}
        	
        	if(bRet)
			{
				int nums = EquipmentProvider.getInstance().GetEquipmentNums();
				result = String.format("%d", nums);
				
				//删除设备相关的文件
				EquipmentProvider.getInstance().removeEquipmentDependentFile(EquipmentId);
				//删除tbl_activeevent表中对应的事件
				EquipmentProvider.getInstance().deleteActiveeventByEquipmentId(EquipmentId);
				//移除缓存的对应设备的事件
				ActiveAlarmProvider.getInstance().closeAlarmCache(EquipmentId);
				//删除Door表
				//DoorProvider.getInstance().deleteDoorByEquipmentId(EquipmentId);
				//删除设备组态分组,根据设备编号
				ConfigureMoldProvider.getInstance().DeleteConfigureMoldByEquipmentId(EquipmentId);
				//删除Cabinet_Device_Map表的同设备编号的数据
				MdcConfigProvider.getInstance().deleteCabinetDeviceByEquipmentId(EquipmentId);
				//删除设备信息与设备操作
				DeviceProvider.getInstance().deleteDevice(EquipmentId);
			}
        
        	//删除设备详情信号缓存
        	ConfigCache.getInstance().closeActiveSignalsByDevice(String.valueOf(EquipmentId));
        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}

	private String HandleReLoadEquipment(String requestParams, String inetIp) {
		String result = "fail to reload equipment";
		//重新加载MainConfig.xml配置
		MainConfigHelper.loadConfigs();
		//根据MainConfig配置生成首页路径
		ConfigureMoldProvider.getInstance().LoadConfigureMoldHome();

        try{
			//备份设备配置数据
        	EquipmentProvider.getInstance().BackupEquipmentData();
        	
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\|");
        	
			int StationId = Integer.parseInt(paras[0]);
			String StationName = paras[1];
			
        	boolean bRet = EquipmentProvider.getInstance().ReloadEquipment(StationId, StationName);
            
        	if(bRet)
			{
				result = "OK";
				if(ActiveSignalDataHandler.proxy==null) 
					ActiveSignalDataHandler.proxy = new RealDataProvider();
				for(int i=0;i<3;i++){
					ActiveSignalDataHandler.proxy.GetData(8888);
				}
				
	            //配置生效后，判断是否要通知上层中心同步配置
	            if(SyncConfigProvider.getInstance().IsEnableSyncConfig())
	            {
	            	SyncConfigProvider.getInstance().StartSyncConfig();
	            }
			}

    		//清空存储MDC的HashMap 
    		MdcAlarmDataHandler.closeHashMap();
    		ActiveSignalProvider.closeHashMap();
    		ActiveSignalDataHandler.closeHashMap();
    		
    		//重新缓存配置
    		ConfigCache.getInstance().Load();
    		EventProvider.getInstance().initLoad();

			//“配置生效”后重新加载数据库数据到缓存中
			ActiveDeviceDataHandler.getInstance().LoadNewActiveDevices();
			BaseTypeProvider.getInstance().clearBaseTypeList();
			//缓存所有KPI文件的页面所有图表内容
			KPIBagProvider.getInstance().loadKPIDataInfo();
			
			//【配置生效】初始化并解析DoorControlGovern存储到缓存中
			DoorGovernHelper.getInstance().initDoorControlGovern();
			
			//用户操作日志
			UserOperationLogProviders.getInstance().insertUserOperationLog(60, paras[2], inetIp, null, null, "", null, "");

        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}
	
	private String HandleGetLimitEquipment(String requestParams) {
		String result = "fail to get limit equipment";
        
        try{

        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\|");
        	
			int index = Integer.parseInt(paras[0]);
			int size = Integer.parseInt(paras[1]);
			
			ArrayList<Equipment> temp = EquipmentProvider.getInstance().GetLimitEquipments(index, size);
    		
    		return JsonHelper.ListjsonString("ret", temp);
        
        } catch (Exception e) {
			e.printStackTrace();
			
		}
        
        return result;
	}
	
	private String HandleGetEquipmentNums(String requestParams) {
		
		String result = "fail to get equipment nums";
        
        try{
        	int nums = EquipmentProvider.getInstance().GetEquipmentNums();
        
        	return Integer.toString(nums);
        } catch (Exception e) {
			e.printStackTrace();

		}
        
        return result;
	}
	
	private String HandleGetIOEquipments(String requestParams) {
		
		int stationId = Integer.valueOf(requestParams);
		String result = "fail to get io equipments";
        
        try{
			ArrayList<Equipment> temp = EquipmentProvider.getInstance().GetIOEquipmentsByStationId(stationId);
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleUpdateEquipment(String requestParams, String inetIp){
		// requestParams => EquipmentId|EquipmentName|SamplerUnitId
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		int equipmentId = Integer.parseInt(split[0]);
		String equipmentName = split[1];
		String vendor = split[2];
		int samplerUnitId = Integer.parseInt(split[3]);
		String userName = split.length > 4 ? split[4] : "";

		DeviceProvider.getInstance().outputDeviceOperation(equipmentId,equipmentName,null,null,null,userName,inetIp);

		return EquipmentProvider.getInstance().updateEquipment(equipmentId,equipmentName,vendor,samplerUnitId);
	}
	
	//判断设备配置是否重复
	private String HandleCheckEquipmentConfig(String requestParams){
		// requestParams => EquipmentId|EquipmentName|PortNo|Address
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		int equipmentId = Integer.parseInt(split[0]);
		String equipmentName = split[1];
		int portNo = Integer.parseInt(split[2]);
		String address = split[3];

		return EquipmentProvider.getInstance().checkEquipmentConfig(equipmentId,equipmentName,portNo,address);
	}
	
	private String HandleCreateConfigManager(String requestParams){
		//备份配置文件
		ConfManagerProvider.getInstance().InitCongigManager();
		return "OK";
	}

	private String HandleReloadFsu(String requestParams){
		String result = "fail to reload equipment";

		try{
			ArrayList<Station> temp = StationProvider.getInstance().GetAllStations();

			boolean bRet = EquipmentProvider.getInstance().ReloadEquipment(temp.get(0).StationId, temp.get(0).StationName);

			if(bRet)
			{
				result = "OK";
				if(ActiveSignalDataHandler.proxy==null)
					ActiveSignalDataHandler.proxy = new RealDataProvider();
				for(int i=0;i<3;i++){
					ActiveSignalDataHandler.proxy.GetData(8888);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();

			return result;
		}

		return result;
	}

	private String HandleRebindingEquipmentTemplate(String requestParams){
		 // requestParams => equipmentId|equipmentTemplateId
		try{
			String[] split = requestParams.split("\\|");
			int equipmentId = Integer.parseInt(split[0]);
			int equipmentTemplateId = Integer.parseInt(split[1]);

			return EquipmentProvider.getInstance().rebindingEquipmentTemplate(equipmentId,equipmentTemplateId);
		}catch (Exception ex){
			return "Parameter Error";
		}
	}

	private String HandleGetHostEquipments(String requestParams) {

		int stationId = Integer.valueOf(requestParams);
		String result = "fail to get io equipments";

		try{
			ArrayList<Equipment> temp = EquipmentProvider.getInstance().GetHostEquipmentsByStationId(stationId);

			return JsonHelper.ListjsonString("ret", temp);
		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
	}
}
