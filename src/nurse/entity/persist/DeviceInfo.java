package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.BaseEntity;

import java.util.ArrayList;

public class DeviceInfo {

    public int EquipmentInfoId;//'唯一编号'
    public int EquipmentId;//'设备表编号'
    public String EquipmentName;//设备名称
    public String EquipmentModel;//'设备型号'
    public String EquipmentVersion;// '设备版本号'
    public String EquipmentSN;//序列号
    public String InstallTime;//安装日期
    public int UsedDate;//运行时间
    public String ImagesPath;// '设备图'
    public int WarrantyPeriod;// '保固期(年)'
    public String MaintenanceTime;// '维修时间'
    public String ConfigSetting;//配置设置
    public String PatchName;// '补丁名称'
    public String PatchVersion;// '补丁版本'
    public String DigitalSignature;// '数字签名'
    public String Location;// '设备位置'
    public String Comment;// '备注'

    public static ArrayList<DeviceInfo> fromDataTable(DataTable dt) {
        ArrayList<DeviceInfo> dis = new ArrayList<DeviceInfo>();
        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();

        for(int i=0;i<rowCount;i++)
        {
            DeviceInfo di = new DeviceInfo();

            //di.EquipmentInfoId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentInfoId"));
            di.EquipmentId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
            di.EquipmentName = drs.get(i).getValueAsString("EquipmentName");
            di.EquipmentModel = drs.get(i).getValueAsString("EquipmentModel");
            di.EquipmentVersion = drs.get(i).getValueAsString("EquipmentVersion");
            di.EquipmentSN = drs.get(i).getValueAsString("EquipmentSN");
            di.InstallTime = BaseEntity.toTimeString(drs.get(i).getValueAsString("InstallTime"));
            di.UsedDate = drs.get(i).getValueAsString("UsedDate") == null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("UsedDate"));
            di.ImagesPath = drs.get(i).getValueAsString("ImagesPath");
            di.WarrantyPeriod = drs.get(i).getValueAsString("WarrantyPeriod") == null ? 0 : Integer.parseInt(drs.get(i).getValueAsString("WarrantyPeriod"));
            di.MaintenanceTime = BaseEntity.toTimeString(drs.get(i).getValueAsString("MaintenanceTime"));
            di.ConfigSetting = drs.get(i).getValueAsString("ConfigSetting");
            di.PatchName = drs.get(i).getValueAsString("PatchName");
            di.PatchVersion = drs.get(i).getValueAsString("PatchVersion");
            di.DigitalSignature = drs.get(i).getValueAsString("DigitalSignature");
            di.Location = drs.get(i).getValueAsString("Location");
            di.Comment = drs.get(i).getValueAsString("Comment");


            dis.add(di);
        }
        return dis;
    }

    public String toString(){
        return String.format(EquipmentName+","+EquipmentModel+","+EquipmentVersion+","+EquipmentSN+","+
                InstallTime+","+UsedDate+","+ImagesPath+","+WarrantyPeriod+","+MaintenanceTime+","+
                ConfigSetting+","+PatchName+","+PatchVersion+","+DigitalSignature+","+Location+","+Comment);
    }
}
