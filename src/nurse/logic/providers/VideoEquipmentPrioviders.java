package nurse.logic.providers;



import java.sql.CallableStatement;
import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.AisleDeviceLocation;
import nurse.entity.persist.Camera;
import nurse.entity.persist.VideoEquipment;
import nurse.utility.DatabaseHelper;
import nurse.utility.JsonHelper;

/**
 * 视频设备
 * @author Administrator
 *
 */
public class VideoEquipmentPrioviders {
	private static Logger log = Logger.getLogger(VideoEquipmentPrioviders.class);
	private static VideoEquipmentPrioviders instance = new VideoEquipmentPrioviders();

	public static VideoEquipmentPrioviders getInstance() {
		return instance;
	}

	/**
	 * 查询回放视频
	 * @return
	 */
	public static String getAllPlayback(){
		DatabaseHelper dbh = new DatabaseHelper();
		DataTable dt = null;
		String sql = "SELECT EquipmentId,EquipmentName,IpAddress,`Port`,ChanNum,UserName,UserPwd FROM tbl_videoequipment where VideoType = 2 GROUP BY EquipmentId;";
		StringBuffer result = new StringBuffer("[");
		try {
			dt = dbh.executeToTable(sql);
			for(int i=0;i<dt.getRowCount();i++){
				result.append(String.format("{id:'%s',name:'%s',ip:'%s',port:'%s',channelno:'%s',username:'%s',pwd:'%s'},",
						dt.getValue(i, 0),dt.getValue(i, 1),dt.getValue(i, 2),dt.getValue(i, 3),dt.getValue(i, 4),dt.getValue(i, 5),
						dt.getValue(i, 6)));
			}
			result.deleteCharAt(result.length()-1);
		} catch (Exception e) {
			log.error(e);
		}finally{
			dbh.close();
		}
		result.append("]");
		return result.toString();
	}
	/**
	 * 查询所有视频设备与监控点 列表
	 * @return
	 */
	public static String getAllMonitor(){
		DatabaseHelper dbh = new DatabaseHelper();
		DataTable dt = null;
		try {
			String sql = "SELECT * FROM TBL_Camera;";
			dt = dbh.executeToTable(sql);
			ArrayList<Camera> list = Camera.fromDataTable(dt);
			
			sql = "SELECT * FROM TBL_VideoEquipment;";
			dt = dbh.executeToTable(sql);
			ArrayList<VideoEquipment> ves = VideoEquipment.fromDataTable(dt, list);
			return JsonHelper.ListjsonString("ret", ves);
			
			/*StringBuffer result = new StringBuffer("[");
			String sql = "select EquipmentId,EquipmentName from tbl_videoequipment GROUP BY EquipmentId;";
			dt = dbh.executeToTable(sql);
			for(int i=0;i<dt.getRowCount();i++){
				result.append(String.format("{vId:'%s',vName:'%s',data:[", dt.getValue(i, 0),dt.getValue(i, 1)));
				String sql2 = String.format("select a.EquipmentId,b.CameraName,a.IpAddress,a.`Port`,b.ChanNum,a.UserName,a.UserPwd,b.CameraId from tbl_videoequipment a,tbl_camera b where A.EquipmentId = B.EquipmentId and B.EquipmentId = %s",
						dt.getValue(i, 0));
				DataTable dt2 = dbh.executeToTable(sql2);
				for(int j=0;j<dt2.getRowCount();j++){
					result.append(String.format("{id:'%s',name:'%s',ip:'%s',port:'%s',channelno:'%s',username:'%s',pwd:'%s',cameraid:'%s'},",
							dt2.getValue(j, 0),dt2.getValue(j, 1),dt2.getValue(j, 2),dt2.getValue(j, 3),dt2.getValue(j, 4),dt2.getValue(j, 5),
							dt2.getValue(j, 6),dt2.getValue(j, 7)));
				}
				result.deleteCharAt(result.length()-1);
				result.append("]},");
			}
			result.deleteCharAt(result.length()-1);
			result.append("]");*/
			
		} catch (Exception e) {
			log.error("getAllMonitor Exception:"+e);
		}finally{
			dbh.close();
		}
		return JsonHelper.ListjsonString("ret", new ArrayList<VideoEquipment>());
	}
	/**
	 * 加载所有视频设备信息
	 * @return
	 */
	public static String loadVideoEquipment(){
		DatabaseHelper dbh = new DatabaseHelper();
		DataTable dt = null;
		String sql = "select EquipmentId,EquipmentName,VideoType,IpAddress,Port,ChanNum,UserName,UserPwd from tbl_videoequipment GROUP BY EquipmentId;";
		StringBuffer sb = new StringBuffer("[");
		try {
			dt = dbh.executeToTable(sql);
			for(int i=0;i<dt.getRowCount();i++){
				sb.append(String.format("{EquipmentId:'%s',EquipmentName:'%s',VideoType:'%s',IpAddress:'%s',Port:'%s',ChanNum:'%s',UserName:'%s',UserPwd:'%s',Cameras:[",
						dt.getValue(i, 0),dt.getValue(i, 1),dt.getValue(i, 2),dt.getValue(i, 3),dt.getValue(i, 4),dt.getValue(i, 5),dt.getValue(i, 6),dt.getValue(i, 7)));
				String sql2 = String.format("select CameraId,CameraName,ChanNum from tbl_camera where EquipmentId = %s GROUP BY CameraId;", dt.getValue(i, 0));
				DataTable dt2 = dbh.executeToTable(sql2);
				for(int j=0;j<dt2.getRowCount();j++){
					sb.append(String.format("{CameraId:'%s',CameraName:'%s',ChanNum:'%s'},", 
							dt2.getValue(j, 0),dt2.getValue(j, 1),dt2.getValue(j, 2)));
				}
				if(dt2.getRowCount()>0) sb.deleteCharAt(sb.length()-1);
				sb.append("]},");
			}
			sb.deleteCharAt(sb.length()-1);
		} catch (Exception e) {
			log.error(e);
		}finally{
			dbh.close();
		}
		sb.append("]");
		return sb.toString();
	}
	/**
	 * 新增视频设备
	 */
	public static int saveVideoEquipment(VideoEquipment ve){
		int line = -1;
		DatabaseHelper dbh = new DatabaseHelper();
		DataTable dt = null;
		String sql = String.format("insert into tbl_videoequipment values(null,100000003,'%s',%d,'%s',%d,%d,'%s','%s',sysdate());",
					ve.getEquipmentName(),ve.getVideoType(),ve.getIpAddress(),ve.getPort(),ve.getChanNum(),ve.getUserName(),ve.getUserPwd());
		try {
			line += dbh.executeNoQuery(sql);
			sql = "SELECT EquipmentId FROM tbl_videoequipment ORDER BY EquipmentId DESC LIMIT 0,1";
			dt = dbh.executeToTable(sql);
			for (int i=0;i<dt.getRowCount();i++) {
				ve.setEquipmentId(Integer.parseInt(dt.getValue(i, 0).toString()));
				for(int j=1;j<=ve.getNumber();j++){
					String name = "Camera"+j;
					int charNum = j;
					sql = String.format("insert into tbl_camera values(null,%s,'%s',%s,sysdate());",
							ve.getEquipmentId(),name,charNum);
					line += dbh.executeNoQuery(sql);
				}
			}
			return line;
		} catch (Exception e) {
			log.error(e);
			return -1;
		}finally{
			dbh.close();
		}
	}
	/**
	 * 修改视频设备
	 * @param ve
	 */
	public static int updateVideoEquipment(VideoEquipment ve){
		DatabaseHelper dbh = new DatabaseHelper();
		String sql = String.format("update tbl_videoequipment set EquipmentName = '%s',VideoType = %s,IpAddress='%s',`Port`=%d,ChanNum=%s,UserName='%s',UserPwd='%s',AddTime=SYSDATE() where EquipmentId = %s",
				ve.getEquipmentName(),ve.getVideoType(),ve.getIpAddress(),ve.getPort(),ve.getChanNum(),ve.getUserName(),ve.getUserPwd(),ve.getEquipmentId());
		try {
			return dbh.executeNoQuery(sql);
		} catch (Exception e) {
			log.error(e);
			return -1;
		}finally{
			dbh.close();
		}
	}
	public static int deleteVideoEquipment(String equipmentId){
		DatabaseHelper dbh = new DatabaseHelper();
		String sql = String.format("delete from tbl_camera where EquipmentId = %s;", equipmentId);
		try {
			dbh.executeNoQuery(sql);
			sql = String.format("delete from tbl_videoequipment where EquipmentId = %s", equipmentId);
			return dbh.executeNoQuery(sql);
		} catch (Exception e) {
			log.error(e);
			return -1;
		}finally{
			dbh.close();
		}
	}
	
	public static String getCamera(String equipmentId,String cameraId){
		String result="";
		DatabaseHelper dbh = new DatabaseHelper();
		DataTable dt = null;
		String sql = String.format("select b.IpAddress,b.`Port`,a.ChanNum,b.UserName,b.UserPwd from tbl_camera a left join  tbl_videoequipment b on a.equipmentid=b.equipmentid where a.equipmentid=%s and a.cameraid=%s", equipmentId,cameraId);
		try {
				dt = dbh.executeToTable(sql);
				if(dt.getRowCount()==0) return result;
				result=String.format("{ip:'%s',port:'%s',channum:'%s',username:'%s',userpwd:'%s'}", dt.getValue(0, 0),dt.getValue(0, 1),dt.getValue(0, 2),dt.getValue(0,3),dt.getValue(0,4));
		} catch (Exception e) {
			log.error(e);
			return result;
		}finally{
			dbh.close();
		}
		return result;
	}
	
	public AisleDeviceLocation setVideo(String[] split){
		String id = split[0];
		String deviceType = split[1];
		String tableName = "TBL_VideoEquipment";
		String rows = split[2];
		String cols = split[3];
		VideoEquipment ve = new VideoEquipment();
		ve.setEquipmentId(split[4].equals("") ? 0 : Integer.parseInt(split[4]));
		ve.setEquipmentName(split[5]);
		ve.setVideoType(Integer.parseInt(split[6]));
		ve.setIpAddress(split[7]);
		ve.setPort(Integer.parseInt(split[8]));
		ve.setChanNum(Integer.parseInt(split[9]));
		ve.setUserName(split[10]);
		ve.setUserPwd(split[11]);
		ve.setNumber(Integer.parseInt(split[12]));
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			CallableStatement stat = dbHelper.prepareProcedure("PRO_InitVideoCamera","?,?,?,?,?,?,?,?,?");
			stat.setInt(1, ve.equipmentId);
	        stat.setString(2, ve.equipmentName);
	        stat.setInt(3, ve.videoType);
	        stat.setString(4, ve.ipAddress);
	        stat.setInt(5, ve.port);
	        stat.setInt(6, ve.chanNum);
	        stat.setString(7, ve.userName);
	        stat.setString(8, ve.userPwd);
	        stat.setInt(9, ve.Number);
	        
	        DataTable dt = dbHelper.executeQuery(stat);
			
			if(dt.getRowCount() > 0){
				String tableId = dt.getRows().get(0).getValueAsString(0);
				if(tableId == null) return null;
				AisleDeviceLocation adl = new AisleDeviceLocation();
				adl.Id = (id.equals("") || id.equals("undefined") ) ? -1 : Integer.parseInt(id);
				adl.TableId = Integer.parseInt(tableId);
				adl.TableName = tableName;
				adl.DeviceType = deviceType;
				adl.TableRow = Integer.parseInt(rows);
				adl.TableCol = Integer.parseInt(cols);
				return adl;
			}
		} catch (Exception e) {
			log.error("setVideo() Exception:",e); 
		}
		return null;
	}
}
