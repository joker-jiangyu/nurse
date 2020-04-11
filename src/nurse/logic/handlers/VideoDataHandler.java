package nurse.logic.handlers;

import java.io.UnsupportedEncodingException;
import java.util.Base64;

import org.apache.log4j.Logger;

import nurse.entity.persist.VideoEquipment;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.CameraProviders;
import nurse.logic.providers.VideoEquipmentPrioviders;
import nurse.utility.Base64Helper;
import nurse.utility.MainConfigHelper;

/**
 * 录像设备
 * @author Administrator
 *
 */
public class VideoDataHandler extends DataHandlerBase{
	private static Logger log = Logger.getLogger(MainConfigHelper.class);
	
	private static final String GETALLPLAYBACK = "getAllPlayback";//回放视频的设备列表
	private static final String GETALLMONITOR = "getAllMonitor";//监控视频的设备列表
	
	private static final String LOADVIDEOEQUIPMENT = "loadVideoEquipment";
	private static final String SAVEVIDEOEQUIPMENT = "saveVideoEquipment";
	private static final String UPDATEVIDEOEQUIPMENT = "updateVideoEquipment";
	private static final String DELETEVIDEOEQUIPMENT = "deleteVideoEquipment";
	private static final String SAVECAMERA = "saveCamera";
	private static final String UPDATECAMERA = "updateCamera";
	private static final String DELETECAMERA = "deleteCamera"; 
	
	private static final String GETCAMERA="getcamera";
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.GETALLPLAYBACK)){
			rep.responseResult = getAllPlayback();
		}else if (GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.GETALLMONITOR)){
			rep.responseResult = getAllMonitor();
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.LOADVIDEOEQUIPMENT)){
			rep.responseResult = loadVideoEquipment();
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.SAVEVIDEOEQUIPMENT)){
			rep.responseResult = saveVideoEquipment(req.requestParams);
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.UPDATEVIDEOEQUIPMENT)){
			rep.responseResult = updateVideoEquipment(req.requestParams);
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.DELETEVIDEOEQUIPMENT)){
			rep.responseResult = deleteVideoEquipment(req.requestParams);
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.SAVECAMERA)){
			rep.responseResult = saveCamera(req.requestParams);
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.UPDATECAMERA)){
			rep.responseResult = updateCamera(req.requestParams);
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.DELETECAMERA)){
			rep.responseResult = deleteCamera(req.requestParams);
		}else if(GetCommandName(req.requestCommand).equalsIgnoreCase(VideoDataHandler.GETCAMERA)){
			rep.responseResult = getCamera(req.requestParams);
		}
		
	}
	/**
	 * 查询回放设备
	 * @return
	 */
	private static String getAllPlayback(){
		return VideoEquipmentPrioviders.getAllPlayback();
	}
	/**
	 * 查询监控设备
	 * @return
	 */
	private static String getAllMonitor(){
		return VideoEquipmentPrioviders.getAllMonitor();
	}
	
	private static String loadVideoEquipment(){
		return VideoEquipmentPrioviders.loadVideoEquipment();
	}
	/**
	 * requestParams = "eName|videoType|ipAddress|port|chanNum|userName|userPwd";
	 * */
	private static String saveVideoEquipment(String requestParams){
		try {
		String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
		String[] split = infoStr.split("\\|");
		if(split.length != 8) return "参数错误";
		
		VideoEquipment ve = new VideoEquipment();
		ve.setEquipmentName(split[0]);
		ve.setVideoType(Integer.parseInt(split[1]));
		ve.setIpAddress(split[2]);
		ve.setPort(Integer.parseInt(split[3]));
		ve.setChanNum(Integer.parseInt(split[4]));
		ve.setUserName(split[5]);
		ve.setUserPwd(split[6]);
		ve.setNumber(Integer.parseInt(split[7]));
		if(VideoEquipmentPrioviders.saveVideoEquipment(ve)>-1)
			return "OK";
		else
			return "新增失败";
		} catch (UnsupportedEncodingException e) {
			log.error("New failed");
			return "新增失败";
		}
	}
	
	private static String getCamera(String requestParams){
		
		String result = "";
		String[] split = requestParams.split("_");
		if(split.length < 2) return "";
		result=VideoEquipmentPrioviders.getCamera(split[0],split[1]);
		return result;
	}
	
	
	
	
	/**
	 * requestParams = "eId|videoType|eName|ipAddress|port|chanNum|userName|userPwd";
	 * */
	private static String updateVideoEquipment(String requestParams){
		try {
			String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
			String[] split = infoStr.split("\\|");
			if(split.length != 8) return "参数错误";
			
			VideoEquipment ve = new VideoEquipment();
			ve.setEquipmentId(Integer.parseInt(split[0]));
			ve.setEquipmentName(split[1]);
			ve.setVideoType(Integer.parseInt(split[2]));
			ve.setIpAddress(split[3]);
			ve.setPort(Integer.parseInt(split[4]));
			ve.setChanNum(Integer.parseInt(split[5]));
			ve.setUserName(split[6]);
			ve.setUserPwd(split[7]);
			if(VideoEquipmentPrioviders.updateVideoEquipment(ve)>-1)
				return "OK";
			else
				return "修改失败";
		} catch (Exception e) {
			log.error("Modify failed",e);
			return "修改失败";
		}
	}
	
	private static String deleteVideoEquipment(String requestParams){
		String equipmentId = Base64Helper.decode(requestParams);
		if(VideoEquipmentPrioviders.deleteVideoEquipment(equipmentId)>-1)
			return "OK";
		else
			return "删除失败";
	}
	/**
	 * requestParams = "eId,cName|chanNum"
	 * */
	private static String saveCamera(String requestParams){
		try {
			String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
			String[] split = infoStr.split("\\|");
			if(split.length != 3) return "参数错误";
			if(CameraProviders.saveCamera(split[0],split[1], split[2])>-1)
				return "OK";
			else
				return "新增失败";
		} catch (Exception e) {
			log.error("New failed");
			return "新增失败";
		}
	}
	/**
	 * requestParams = "cId|cName|chanNum"
	 * */
	private static String updateCamera(String requestParams){
		try {
			String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
			String[] split = infoStr.split("\\|");
			if(split.length != 3) return "参数错误";
			if(CameraProviders.updateCamera(split[0],split[1], split[2])>-1)
				return "OK";
			else
				return "修改失败";
		} catch (Exception e) {
			log.error("Modify failed");
			return "修改失败";
		}
		}
	
	private static String deleteCamera(String requestParams){
		String cameraId = Base64Helper.decode(requestParams);
		if(CameraProviders.deleteCamera(cameraId)>-1)
			return "OK";
		else
			return "删除失败";
	}
}
