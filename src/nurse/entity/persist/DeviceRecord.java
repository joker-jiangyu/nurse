package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.BaseEntity;

import java.util.ArrayList;

public class DeviceRecord {
    public int EquipmentRecordId;// '唯一编号'
    public int EquipmentId;// '设备信息表编号'
    public String UserName;//操作者
    public String IPAddress;//操作IP
    public String Operation;// '操作(维修、修改配置)'
    public String OperationTime;// '操作时间'
    public String Comment;// '备注'

    public static ArrayList<DeviceRecord> fromDataTable(DataTable dt) {
        ArrayList<DeviceRecord> ds = new ArrayList<DeviceRecord>();
        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();

        for(int i=0;i<rowCount;i++)
        {
            DeviceRecord dr = new DeviceRecord();

            dr.EquipmentRecordId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentRecordId"));
            dr.EquipmentId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
            dr.UserName = drs.get(i).getValueAsString("UserName");
            dr.IPAddress = drs.get(i).getValueAsString("IPAddress");
            dr.Operation = drs.get(i).getValueAsString("Operation");
            dr.OperationTime = BaseEntity.toTimeString(drs.get(i).getValueAsString("OperationTime"));
            dr.Comment = drs.get(i).getValueAsString("Comment");

            ds.add(dr);
        }
        return ds;
    }
}
