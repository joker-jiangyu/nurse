package nurse.logic.providers;

import org.apache.log4j.Logger;

import nurse.utility.DatabaseHelper;
import nurse.utility.MainConfigHelper;

/**
 * 监控点
 * @author Administrator
 *
 */
public class CameraProviders {
	private static Logger log = Logger.getLogger(MainConfigHelper.class);

	/**
	 * 新增监控点
	 */
	public static int saveCamera(String EquipmentId,String cameraName,String chanNum){
		DatabaseHelper dbh = new DatabaseHelper();
		String sql = String.format("insert into tbl_camera values(null,%s,'%s',%s,sysdate());", EquipmentId,cameraName,chanNum);
		try {
			return dbh.executeNoQuery(sql);
		} catch (Exception e) {
			log.error(e);
			return -1;
		}finally{
			dbh.close();
		}
	}
	/**
	 * 修改监控点
	 */
	public static int updateCamera(String cameraId,String cameraName,String chanNum){
		DatabaseHelper dbh = new DatabaseHelper();
		String sql = String.format("update tbl_camera set CameraName = '%s',ChanNum = %s,AddTime=SYSDATE() where CameraId = %s;",
				cameraName,chanNum,cameraId);
		try {
			return dbh.executeNoQuery(sql);
		} catch (Exception e) {
			log.error(e);
			return -1;
		}finally{
			dbh.close();
		}
	}
	
	public static int deleteCamera(String cameraId){
		DatabaseHelper dbh = new DatabaseHelper();
		String sql = String.format("delete from tbl_camera where CameraId = %s;",cameraId);
		try {
			return dbh.executeNoQuery(sql);
		} catch (Exception e) {
			log.error(e);
			return -1;
		}finally{
			dbh.close();
		}
	}
}
