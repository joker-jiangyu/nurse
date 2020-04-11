package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

/**
 * 监控点实体类
 * @author Administrator
 *
 */
public class Camera {
	public int cameraId; // 视频ID 主键自增长
	public int equipmentId; // 设备ID
	public String cameraName; // 视频名称
	public int chanNum; // 视频通道（0/1/2）
	public String addTime; // 添加时间
	public int getCameraId() {
		return cameraId;
	}
	public void setCameraId(int cameraId) {
		this.cameraId = cameraId;
	}
	public int getEquipmentId() {
		return equipmentId;
	}
	public void setEquipmentId(int equipmentId) {
		this.equipmentId = equipmentId;
	}
	public String getCameraName() {
		return cameraName;
	}
	public void setCameraName(String cameraName) {
		this.cameraName = cameraName;
	}
	public int getChanNum() {
		return chanNum;
	}
	public void setChanNum(int chanNum) {
		this.chanNum = chanNum;
	}
	public String getAddTime() {
		return addTime;
	}
	public void setAddTime(String addTime) {
		this.addTime = addTime;
	}
	
	public static ArrayList<Camera> fromDataTable(DataTable dt){
		ArrayList<Camera> ds = new ArrayList<Camera>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Camera c = new Camera();
			c.setCameraId(Integer.parseInt(drs.get(i).getValue("CameraId").toString()));
			c.setEquipmentId(Integer.parseInt(drs.get(i).getValue("EquipmentId").toString()));
			c.setCameraName(drs.get(i).getValue("CameraName").toString());
			c.setChanNum(Integer.parseInt(drs.get(i).getValue("ChanNum").toString()));
			ds.add(c);
		}		
		return ds;
	}
}
