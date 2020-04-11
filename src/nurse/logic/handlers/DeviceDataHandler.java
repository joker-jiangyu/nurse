package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import nurse.entity.persist.Device;
import nurse.entity.persist.DeviceInfo;
import nurse.entity.persist.DeviceRecord;
import nurse.entity.persist.EquipmentBaseType;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.DeviceProvider;
import nurse.utility.Base64Helper;
import nurse.utility.BaseEntity;
import nurse.utility.JsonHelper;

public class DeviceDataHandler  extends DataHandlerBase {

	private static final String GetDevicesByType = "getDevicesByType";
	private static final String GETALLDEVICESTYPE = "getAllDevicesType";
	private static final String GetDeviceInfo = "GetDeviceInfo";
	private static final String GetDeviceRecord = "GetDeviceRecord";
	private static final String ModifyDeviceInfo = "ModifyDeviceInfo";
	
	public DeviceDataHandler() {
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep, String inetIp) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DeviceDataHandler.GetDevicesByType))
		{
			rep.responseResult = HandleGetDevicesByType(req.requestParams);
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(DeviceDataHandler.GETALLDEVICESTYPE))
		{
			rep.responseResult = HandleGetAllDevicesType();
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(DeviceDataHandler.GetDeviceInfo)){
			rep.responseResult = HandleGetDeviceInfo(req.requestParams);
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(DeviceDataHandler.GetDeviceRecord)){
			rep.responseResult = HandleGetDeviceRecord(req.requestParams);
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(DeviceDataHandler.ModifyDeviceInfo)){
			rep.responseResult = HandleModifyDeviceInfo(req.requestParams,inetIp);
		}
	}

	private String HandleGetDevicesByType(String requestParams) {
		
		int typeId = Integer.valueOf(requestParams);
		ArrayList<Device> ds = DeviceProvider.getInstance().GetAllDevices();
		
		List<Device> typeDevices = ds.stream()
				.filter(d -> d.baseTypeId == typeId)
				.collect(Collectors.toList());
		
		return JsonHelper.ListjsonString("ret", typeDevices);
	}
	/**
	 * 显示所有设备列
	 * */
	private String HandleGetAllDevicesType(){
		List<EquipmentBaseType> lists = DeviceProvider.getInstance().getAllDeviceType();
		return JsonHelper.ListjsonString("ret",lists);
	}

	private String HandleGetDeviceInfo(String requestParams){
		//requestParams => EquipmentId
        ArrayList<DeviceInfo> list = DeviceProvider.getInstance().getDeviceInfoById(requestParams);
		return JsonHelper.ListjsonString("ret", list);
	}

	private String HandleGetDeviceRecord(String requestParams){
        //requestParams => EquipmentId
        ArrayList<DeviceRecord> list = DeviceProvider.getInstance().getDeviceRecordById(requestParams);
        return JsonHelper.ListjsonString("ret", list);
    }

    private String HandleModifyDeviceInfo(String requestParams,String ipAddress){
		//requestParams => EquipmentId|EquipmentModel|EquipmentVersion|ImagesPath|UsedDate|WarrantyPeriod|MaintenanceTime|
		//	ConfigSetting|PatchName|PatchVersion|DigitalSignature|Location|Comment|EquipmentSN|InstallTime|UserName
		DeviceInfo info = new DeviceInfo();
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		info.EquipmentId = BaseEntity.getSplitInt(split,0);
		info.EquipmentModel = BaseEntity.getSplitString(split,1);
		info.EquipmentVersion = BaseEntity.getSplitString(split,2);
		info.ImagesPath = BaseEntity.getSplitString(split,3);
		info.UsedDate = BaseEntity.getSplitInt(split,4);
		info.WarrantyPeriod = BaseEntity.getSplitInt(split,5);
		info.MaintenanceTime = getDateTime(BaseEntity.getSplitString(split,6));
		info.ConfigSetting = BaseEntity.getSplitString(split,7);
		info.PatchName = BaseEntity.getSplitString(split,8);
		info.PatchVersion = BaseEntity.getSplitString(split,9);
		info.DigitalSignature = BaseEntity.getSplitString(split,10);
		info.Location = BaseEntity.getSplitString(split,11);
		info.Comment = BaseEntity.getSplitString(split,12);
		info.EquipmentSN = BaseEntity.getSplitString(split,13);
		info.InstallTime = getDateTime(BaseEntity.getSplitString(split,14));
		String UserName = BaseEntity.getSplitString(split,15);

		if(DeviceProvider.getInstance().updDeviceInfo(info,UserName,ipAddress))
			return "OK";
		else
			return "ERROR";
	}

	//时间字符串是否存在 HH:mm:ss 不存在添加 存在不操作
	private String getDateTime(String date){
		if(date.indexOf(":") > -1 && date.lastIndexOf(":") > date.indexOf(":"))
			return date;
		else
			return String.format("%s 00:00:00",date);
	}
}
