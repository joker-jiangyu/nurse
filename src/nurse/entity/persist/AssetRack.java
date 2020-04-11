package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class AssetRack {
	public int RackId;//资产条编号
	public int CabinetId;// 机柜编号，关联Cabinet机柜表
	public String CabinetName;// 机柜名称
	public String RackIP;// 资产条IP
	public String RackMask;// 资产条子网掩码
	public String RackGateway;// 资产条默认网关
	public int RackPort;// 资产条端口
	public String ServerIP;// 服务器IP
	public int ServerPort;// 服务器端口
	public String DeviceId;// 资产条设备ID
	public int Status;// 状态；0:中断  1:正常  2:告警
	public String UsedDate;// 修改时间
	public int Monitoring;//是否实时监控 1:启动 0关闭 
	public String Description;
	
	public int TotalSpace;//总空间
	public int SurplusSpace;//剩余空间
	
	public static ArrayList<AssetRack> fromDataTable(DataTable dt) {
		ArrayList<AssetRack> ars = new ArrayList<AssetRack>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++){
			DataRow dr = drs.get(i);
			AssetRack ar = new AssetRack();
			ar.RackId = Integer.parseInt(dr.getValueAsString("RackId"));
			ar.CabinetId = Integer.parseInt(dr.getValueAsString("CabinetId"));
			ar.CabinetName = dr.getValueAsString("Name");
			ar.RackIP = dr.getValueAsString("RackIP");
			ar.RackMask = dr.getValueAsString("RackMask");
			ar.RackGateway = dr.getValueAsString("RackGateway");
			ar.RackPort = dr.getValueAsString("RackPort") == null ? -1 : Integer.parseInt(dr.getValueAsString("RackPort"));
			ar.ServerIP = dr.getValueAsString("ServerIP");
			ar.ServerPort = Integer.parseInt(dr.getValueAsString("ServerPort"));
			ar.DeviceId = dr.getValueAsString("DeviceId");
			ar.Status = Integer.parseInt(dr.getValueAsString("Status"));
			ar.UsedDate = dr.getValueAsString("UsedDate");
			ar.Monitoring = Integer.parseInt(dr.getValueAsString("Monitoring"));
			ar.Description = dr.getValueAsString("Description");
			
			ars.add(ar);
		}
		return ars;
	}
	
	public static ArrayList<AssetRack> fromRackDataTable(DataTable dt) {
		ArrayList<AssetRack> ars = new ArrayList<AssetRack>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++){
			DataRow dr = drs.get(i);
			AssetRack ar = new AssetRack();
			ar.RackId = Integer.parseInt(dr.getValueAsString("RackId"));
			ar.CabinetId = Integer.parseInt(dr.getValueAsString("CabinetId"));
			ar.CabinetName = dr.getValueAsString("Name");
			ar.RackIP = dr.getValueAsString("RackIP");
			ar.RackMask = dr.getValueAsString("RackMask");
			ar.RackGateway = dr.getValueAsString("RackGateway");
			ar.RackPort = dr.getValueAsString("RackPort") == null ? -1 : Integer.parseInt(dr.getValueAsString("RackPort"));
			ar.ServerIP = dr.getValueAsString("ServerIP");
			ar.ServerPort = Integer.parseInt(dr.getValueAsString("ServerPort"));
			ar.DeviceId = dr.getValueAsString("DeviceId");
			ar.Status = Integer.parseInt(dr.getValueAsString("Status"));
			ar.UsedDate = dr.getValueAsString("UsedDate");
			ar.Monitoring = Integer.parseInt(dr.getValueAsString("Monitoring"));
			ar.Description = dr.getValueAsString("Description");
			
			ar.TotalSpace = dr.getValueAsString("TotalSpace") == null ? 0 : Integer.parseInt(dr.getValueAsString("TotalSpace"));
			if(dr.getValueAsString("SurplusSpace") == null)
				ar.SurplusSpace = 0;
			else
				ar.SurplusSpace = ar.TotalSpace - Integer.parseInt(dr.getValueAsString("SurplusSpace"));
			
			ars.add(ar);
		}
		return ars;
	}
	
	public String toString(){
		return String.format("{RackId:%s,CabinetId:%s,CabinetName:%s,RackIP:%s,RackMask:%s,RackGateway:%s,"
				+ "RackGateway:%s,RackPort:%s,ServerIP:%s,ServerPort:%s,DeviceId:%s,Status:%s,UsedDate:%s,"
				+ "Monitoring:%s,Description:%s}",
				RackId,CabinetId,CabinetName,RackIP,RackMask,RackGateway,RackGateway,RackPort,ServerIP,ServerPort,
				DeviceId,Status,UsedDate,Monitoring,Description);
	}
}
