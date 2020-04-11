package nurse.logic.handlers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileNotFoundException; 
import java.io.IOException;  
import java.io.UnsupportedEncodingException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

import org.json.JSONObject;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.UploadFileProviders;
import nurse.utility.Base64Helper;
import nurse.utility.BasePath;
import nurse.utility.DataUri;

public class UploadFileHandler extends DataHandlerBase {

	private static final String SaveFile = "saveFile";
	private static final String DeleteFile = "deleteFile";
	private static final String DeleteDirectory = "deleteDirectory";
	
	private static final String GetAllJsonTemplates = "GetAllJsonTemplates";
	private static final String GetNowJsonPath = "GetNowJsonPath";
	private static final String DownloadDiagramsJson = "DownloadDiagramsJson";
	private static final String UploadDiagramsJson = "UploadDiagramsJson";
	private static final String DeleteInstancesJson = "DeleteInstancesJson";
	private static final String GetAllJsonInstances = "GetAllJsonInstances";
	private static final String CopyJsonInstance = "CopyJsonInstance";
	
	public UploadFileHandler() {
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.SaveFile))
		{
			rep.responseResult = handleSaveFile(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.DeleteFile))
		{
			rep.responseResult = handleDeleteFile(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.DeleteDirectory))
		{
			rep.responseResult = handleDeleteDirectory(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.GetAllJsonTemplates)){
			rep.responseResult = HandleGetAllJsonTemplates(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.GetNowJsonPath)){
			rep.responseResult = HandleGetNowJsonPath(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.DownloadDiagramsJson)){
			rep.responseResult = HandleDownloadDiagramsJson(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.UploadDiagramsJson)){
			rep.responseResult = HandleUploadDiagramsJson(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.DeleteInstancesJson)){
			rep.responseResult = HandleDeleteInstancesJson(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.GetAllJsonInstances)){
			rep.responseResult = HandleGetAllJsonInstances(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(UploadFileHandler.CopyJsonInstance)){
			rep.responseResult = HandleCopyJsonInstance(req.requestParams);
		}
	}

	private String handleDeleteFile(String requestParams) {

		Path p = null;
		String filename = null;
		
        String encoding = System.getProperty("file.encoding");
        try {
        	//String utfStr =URLDecoder.decode(requestParams, "UTF-8");
        	String utfStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
			filename = new String(utfStr.getBytes(), encoding);
			p = Paths.get(BasePath.getPath(), "web/", filename);
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}

		if (!filename.toLowerCase().contains("upload"))
		{
			return "only upload dir's file can be deleted.";
		}
		
		String strFilePath = p.toString();
    	strFilePath.replace('\\', '/');
		File f = new File(strFilePath); 
		
		if (f.exists()) 
		{
			
			try
			{
				f.delete();
			}catch(Exception e)
			{ 
				return "fail to delete file";
			}
		}
			
		return filename;		
	}

	private String handleSaveFile(String requestParams) {
		JSONObject req = new JSONObject(requestParams);

		DataUri uri = new DataUri(req.getString("file"));
		
		Path p = null;
		String filename = null;
		
		
        String encoding = System.getProperty("file.encoding");
        try {
        	String utfStr = new String(Base64.getDecoder().decode(req.getString("name")), "UTF-8");
			filename = new String(utfStr.getBytes(), encoding);
			p = Paths.get(BasePath.getPath(), "web/upload/", filename);
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}
        
        try {
        	Path filePath = Paths.get(BasePath.getPath(), "web/upload/");
        	String strFolderPath = filePath.toString();
        	strFolderPath.replace('\\', '/');
        	File dir = new File(strFolderPath);   
        	
        	//如果文件夹不存在则创建     
        	if  (!dir.exists()  && !dir.isDirectory())       
        	{        
        		dir.mkdirs();// 创建多级目录 
        	}
        } catch (Exception e) {
        	e.printStackTrace();
        }
		
        String strFilePath = p.toString();
        strFilePath.replace('\\', '/');
        File f = new File(strFilePath);  

		if (f.exists()) 
		{
			f.delete();
		}

		try
		{
			FileOutputStream out= new FileOutputStream(f);
			out.write(uri.getData());
			out.close();
		}catch(Exception e){
			e.printStackTrace();
		}
			
		return "upload/" + filename;		
	}
	
	private String handleDeleteDirectory(String requestParams) {

		String path = null;
		
		//��ȡϵͳ����  
        String encoding = System.getProperty("file.encoding");
        try {
        	//String utfStr =URLDecoder.decode(requestParams, "UTF-8");
        	String utfStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	path = new String(utfStr.getBytes(), encoding);
        	path.replace('\\', '/');
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}
	
		try
		{
			deletefile(path);
		}catch(Exception e)
		{ 
			return "fail to delete directory";
		}
			
		return path;		
	}

	/** 
	 * ɾ��ĳ���ļ����µ������ļ��к��ļ� 
	 * 
	 * @param delpath 
	 *            String 
	 * @throws FileNotFoundException 
	 * @throws IOException 
	 * @return boolean 
	 */  
	public static boolean deletefile(String delpath) throws Exception { 
		
	 try {  
		 File file = new File(delpath);  
		// ���ҽ����˳���·������ʾ���ļ������� ��һ��Ŀ¼ʱ������ true   
		if (!file.isDirectory()) {  
			file.delete();  
		} else if (file.isDirectory()) {  
			String[] filelist = file.list();  
			for (int i = 0; i < filelist.length; i++) {  
				File delfile = new File(delpath + "/" + filelist[i]);  
				if (!delfile.isDirectory()) {  
					delfile.delete();  
					System.out.println(delfile.getAbsolutePath() + "ɾ���ļ��ɹ�");  
				} else if (delfile.isDirectory()) {  
					deletefile(delpath + "/" + filelist[i]);  
				}  
			}  
			System.out.println(file.getAbsolutePath()+"ɾ���ɹ�");  
			file.delete();  
		}  
 
	 } catch (FileNotFoundException e) {  
		 System.out.println("deletefile() Exception:" + e.getMessage());  
	 }  
	 
	 return true;  
	}  

	private String HandleGetAllJsonTemplates(String requestParams){
		return Base64Helper.encode(UploadFileProviders.getInstance().getAllJsonTemplates());
	}
	
	private String HandleGetNowJsonPath(String requestParams){
		//requestParams => EquipmentId|EquipmentBaseType
		String[] split = requestParams.split("\\|");
		String equipmentId = split[0];
		String equipmentBaseType = split[1];
		
		return UploadFileProviders.getInstance().getNowJsonPath(equipmentId,equipmentBaseType);
	}
	
	private String HandleDownloadDiagramsJson(String requestParams){
		//requestParams => templates(/instances)|path
		String[] split = requestParams.split("\\|");
		String jsonPath = split[0];
		String downloadPath = "";//split[1];
		return UploadFileProviders.getInstance().downloadDiagramsJson(jsonPath,downloadPath);
	}
	
	private String HandleUploadDiagramsJson(String requestParams){
		//requestParams => templates(/instances)|fileName|jsonObejct
		String[] split = requestParams.split("\\|");
		String path = split[0];
		String fileName = String.format("%s.json", split[1]);
		String jsonObject = split[2];
		return UploadFileProviders.getInstance().uploadDiagramsJson(path,fileName,jsonObject);
	}
	
	private String HandleDeleteInstancesJson(String requestParams){
		//requestParams => path
		try {
			if(deletefile(requestParams))
				return "OK";
			else
				return "ERROR";
		} catch (Exception e) {
			return "File Not Exist";
		}
	}
	
	private String HandleGetAllJsonInstances(String requestParams){
		return Base64Helper.encode(UploadFileProviders.getInstance().getAllJsonInstances());
	}
	
	private String HandleCopyJsonInstance(String requestParams){
		// requestParams => filePage|deviceId
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		String filePage = split[0];
		String deviceId = split[1];
		return UploadFileProviders.getInstance().copyJsonInstance(filePage,deviceId);
	}
}
