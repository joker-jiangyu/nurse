package nurse.entity.persist;

import java.util.ArrayList;
import java.util.List;


import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.JsonHelper;

/**
 * 视频设备 实体类
 * @author Administrator
 *
 */
public class VideoEquipment {
	public int equipmentId; // 设备ID 主键自增长
	public int stationId; // 局站编号 100000003
	public String equipmentName; // 设备名称
	public int videoType; // 设备类型，1为监控视频、2为回放视频
	public String ipAddress; // 设备IP地址 *
	public int port; // 设备端口号 *
	public int chanNum; // 通道号（0/1/2） *
	public String userName; // 用户名
	public String userPwd; // 用户密码
	public String addTime; // 添加时间
	public String cameraJson; //监控点
	public int Number;//通道个数
	public String getCameraJson() {
		return cameraJson;
	}
	public void setCameraJson(String cameraJson) {
		this.cameraJson = cameraJson;
	}
	public int getEquipmentId() {
		return equipmentId;
	}
	public void setEquipmentId(int equipmentId) {
		this.equipmentId = equipmentId;
	}
	public int getStationId() {
		return stationId;
	}
	public void setStationId(int stationId) {
		this.stationId = stationId;
	}
	public String getEquipmentName() {
		return equipmentName;
	}
	public void setEquipmentName(String equipmentName) {
		this.equipmentName = equipmentName;
	}
	public int getVideoType() {
		return videoType;
	}
	public void setVideoType(int videoType) {
		this.videoType = videoType;
	}
	public String getIpAddress() {
		return ipAddress;
	}
	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}
	public int getPort() {
		return port;
	}
	public void setPort(int port) {
		this.port = port;
	}
	public int getChanNum() {
		return chanNum;
	}
	public void setChanNum(int chanNum) {
		this.chanNum = chanNum;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getUserPwd() {
		return userPwd;
	}
	public void setUserPwd(String userPwd) {
		this.userPwd = userPwd;
	}
	public String getAddTime() {
		return addTime;
	}
	public void setAddTime(String addTime) {
		this.addTime = addTime;
	}
	public int getNumber() {
		return Number;
	}
	public void setNumber(int number) {
		Number = number;
	}
	public static ArrayList<VideoEquipment> fromDataTable(DataTable dt,List<Camera> cameras){
		ArrayList<VideoEquipment> ds = new ArrayList<VideoEquipment>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			VideoEquipment ve = new VideoEquipment();
			ve.setEquipmentId(Integer.parseInt(drs.get(i).getValue("EquipmentId").toString()));
			ve.setStationId(Integer.parseInt(drs.get(i).getValue("StationId").toString()));
			ve.setEquipmentName(drs.get(i).getValue("EquipmentName").toString());
			ve.setVideoType(Integer.parseInt(drs.get(i).getValue("VideoType").toString()));
			ve.setIpAddress(drs.get(i).getValue("IpAddress").toString());
			ve.setPort(Integer.parseInt(drs.get(i).getValue("Port").toString()));
			ve.setChanNum(Integer.parseInt(drs.get(i).getValue("ChanNum").toString()));
			ve.setUserName(drs.get(i).getValue("UserName").toString());
			ve.setUserPwd(drs.get(i).getValue("UserPwd").toString());
			List<Camera> list = new ArrayList<Camera>();
			for (int j = 0; j < cameras.size(); j++) {
				Camera camera = cameras.get(j);
				if(camera.getEquipmentId() == ve.getEquipmentId()){
					list.add(camera);
				}
			}
			ve.setCameraJson(JsonHelper.ListjsonArray(list).toString());
			ds.add(ve);
		}		
		return ds;
	}
}
