package nurse.logic.providers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Properties;

import nurse.utility.MainConfigHelper;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import nurse.entity.persist.Equipment;
import nurse.entity.persist.EquipmentBaseType;
import nurse.utility.BasePath;
import nurse.utility.DataUri;

public class UploadFileProviders {
	private static UploadFileProviders instance = new UploadFileProviders();
	private static Logger log = Logger.getLogger(UploadFileProviders.class);
	private static String os = null;//保存当前系统类型
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}

	public static UploadFileProviders getInstance() {
		return instance;
	}

	public String getAllJsonTemplates(){
		String arr = "[%s]";
		String cfg = "{\"id\":\"%s\",\"name\":\"%s\",\"value\":\"%s\"}";

		//是否是iView版本
		String urlTemp = "/diagrams/templates";
		if(MainConfigHelper.getConfig().loginPage.equalsIgnoreCase("iview"))
			urlTemp = "/diagrams/iView/templates";

		String file = BasePath.getPath()+urlTemp;
		if(os.equals("Linux") || os.equals("linux")){
			file = BasePath.getWebDirByEnv(urlTemp);
		}
		List<String> list = getAllFile(file,false);
		
		ArrayList<EquipmentBaseType> deviceBaseTypes = TemplateProvider.getInstance().GetEquipmentBaseType();
		
		String result = "";
		for(int i = 0;i < list.size();i++){
			String value = list.get(i).replace('\\', '/');
    		if(value.lastIndexOf("/") == -1 || value.lastIndexOf(".json") == -1) continue;
			if(i > 0) result += ",";
			String id = value.substring(value.lastIndexOf("/")+1,value.lastIndexOf(".json"));
			String name = "";
			try {
				for(EquipmentBaseType ebt : deviceBaseTypes){
					if(ebt.baseEquipmentId == Integer.parseInt(id)){
						name = ebt.baseEquipmentName;
						break;
					}
				}
			} catch (Exception e) {}
			if(name.equals(""))
				name = id;
			
			result += String.format(cfg, id , name ,value);
		}
		arr = String.format(arr, result);
		return arr;
	}
	
    /**
     * 获取路径下的所有文件/文件夹
     * @param directoryPath 需要遍历的文件夹路径
     * @param isAddDirectory 是否将子文件夹的路径也添加到list集合中
     * @return
     */
    public static List<String> getAllFile(String directoryPath,boolean isAddDirectory) {
        List<String> list = new ArrayList<String>();

        File baseFile = new File(directoryPath);
        if (baseFile.isFile() || !baseFile.exists()) {
            return list;
        }

        File[] files = baseFile.listFiles();
        for (File file : files) {
            if (file.isDirectory()) {
                if(isAddDirectory){
                    list.add(file.getAbsolutePath());
                }

                list.addAll(getAllFile(file.getAbsolutePath(),isAddDirectory));
            } else {
                list.add(file.getAbsolutePath());
            }
        }
        return list;
    }

    /**
     * 根据设备编号查询当前组态页面所在位置
     * @param equipmentId 设备编号或是设备基类编号
     * @return 组态路径
     */
    public String getNowJsonPath(String equipmentId,String equipmentBaseType){

		//是否是iView版本
		String urlIns = "/diagrams/instances";
		/*if(MainConfigHelper.getConfig().loginPage.equalsIgnoreCase("iview"))
			urlIns = "/diagrams/iView/instances";*/
    	//在实体组态目录查找是否存在该组态页面
		String file = BasePath.getPath()+urlIns;
		List<String> list = getAllFile(file,false);
    	for(String fn : list){
    		fn = fn.replace('\\', '/');
    		if(fn.lastIndexOf("/") == -1 || fn.lastIndexOf(".json") == -1) continue;
			String fileName = fn.substring(fn.lastIndexOf("/")+1,fn.lastIndexOf(".json"));
			if(fileName.equals(equipmentId))
				return fn;
    	}
		//是否是iView版本
		String urlTemp = "/diagrams/templates";
		if(MainConfigHelper.getConfig().loginPage.equalsIgnoreCase("iview"))
			urlTemp = "/diagrams/iView/templates";
		//不存在，在模板组态目录查找该组态页面
		file = BasePath.getPath()+urlTemp;
		list = getAllFile(file,false);
    	for(String fn : list){
    		fn = fn.replace('\\', '/');
    		if(fn.lastIndexOf("/") == -1 || fn.lastIndexOf(".json") == -1) continue;
			String fileName = fn.substring(fn.lastIndexOf("/")+1,fn.lastIndexOf(".json"));
			if(fileName.equals(equipmentBaseType))
				return fn;
    	}
    	return "";
    } 
    
    public String downloadDiagramsJson(String jsonPath,String downloadPath){
        //需要复制的目标文件或目标文件夹  
        File file = new File(jsonPath);  
        //复制到的位置  
        jsonPath = jsonPath.replace('\\', '/');
        String fileName = jsonPath.substring(jsonPath.lastIndexOf("/")+1);
        String topathname = BasePath.getWebDirByEnv("web/upload/" + fileName);
        topathname = topathname.replace('\\', '/');

    	//如果文件夹不存在则创建
        File wodnloadFile = new File(BasePath.getWebDirByEnv("web/upload/"));
    	if (!wodnloadFile.exists() && !wodnloadFile.isDirectory()){        
    		wodnloadFile.mkdirs();// 创建多级目录 
    	}
    	
        File toFile = new File(topathname);  
        try {  
            copyJson(file, toFile);
            return topathname;
        } catch (Exception e) {  
            log.error("DownloadDiagramsJson Exception:", e);
        } 
        return "ERROR";
    }
    
    public static void copyJson(File file, File toFile) throws Exception {  
        byte[] b = new byte[1024];  
        int a;  
        FileInputStream fis;  
        FileOutputStream fos;  
        if (file.isDirectory()) {  
            String filepath = file.getAbsolutePath();  
            filepath=filepath.replaceAll("\\\\", "/");  
            String toFilepath = toFile.getAbsolutePath();  
            toFilepath=toFilepath.replaceAll("\\\\", "/");  
            int lastIndexOf = filepath.lastIndexOf("/");  
            toFilepath = toFilepath + filepath.substring(lastIndexOf ,filepath.length());  
            File copy=new File(toFilepath);  
            //复制文件夹  
            if (!copy.exists()) {  
                copy.mkdir();  
            }  
            //遍历文件夹  
            for (File f : file.listFiles()) {  
            	copyJson(f, copy);  
            }  
        } else {  
            if (toFile.isDirectory()) {  
                String filepath = file.getAbsolutePath();  
                filepath=filepath.replaceAll("\\\\", "/");  
                String toFilepath = toFile.getAbsolutePath();  
                toFilepath=toFilepath.replaceAll("\\\\", "/");  
                int lastIndexOf = filepath.lastIndexOf("/");  
                toFilepath = toFilepath + filepath.substring(lastIndexOf ,filepath.length());  
                  
                //写文件  
                File newFile = new File(toFilepath);  
                fis = new FileInputStream(file);  
                fos = new FileOutputStream(newFile);  
                while ((a = fis.read(b)) != -1) {  
                    fos.write(b, 0, a);  
                }  
            } else {  
                //写文件  
                fis = new FileInputStream(file);  
                fos = new FileOutputStream(toFile);  
                while ((a = fis.read(b)) != -1) {  
                    fos.write(b, 0, a);  
                }  
            }  
  
        }  
    }  
  
    
    public String uploadDiagramsJson(String path,String fileName,String jsonObejct){
    	JSONObject req = new JSONObject(jsonObejct);

		DataUri uri = new DataUri(req.getString("file"));
		
		Path p = null;


		String url = "/diagrams/";
		//是否是iView版本
		/*if(MainConfigHelper.getConfig().loginPage.equalsIgnoreCase("iview"))
			url = "/diagrams/iView/";*/
        try {
        	if(path.equals("templates")){//默认模板，文件名为源文件名
            	String encoding = System.getProperty("file.encoding");
            	String utfStr = new String(Base64.getDecoder().decode(req.getString("name")), "UTF-8");
    			fileName = new String(utfStr.getBytes(), encoding);
        	}
			p = Paths.get(BasePath.getPath(), url+path+"/", fileName);
		} catch (Exception e) {
        	log.error("UploadDiagramsJson LoadFile Exception:",e);
		}
        
        try {
        	Path filePath = Paths.get(BasePath.getPath(), url+path+"/");
        	String strFolderPath = filePath.toString();
        	strFolderPath.replace('\\', '/');
        	File dir = new File(strFolderPath);   
        	
        	//如果文件夹不存在则创建     
        	if (!dir.exists()  && !dir.isDirectory()){        
        		dir.mkdirs();// 创建多级目录 
        	}
        } catch (Exception e) {
        	log.error("UploadDiagramsJson MkdirsFile Exception:",e);
        }
		
        String strFilePath = p.toString();
        strFilePath.replace('\\', '/');
        File f = new File(strFilePath);  

		if (f.exists()){
			f.delete();
		}

		try{
			FileOutputStream out= new FileOutputStream(f);
			out.write(uri.getData());
			out.close();
		}catch(Exception e){
        	log.error("UploadDiagramsJson UploadFile Exception:",e);
		}
			
		return "/diagrams/"+path+"/" + fileName;		
    }
   
    
    public String getAllJsonInstances(){
		String arr = "[%s]";
		String cfg = "{\"id\":\"%s\",\"name\":\"%s\",\"value\":\"%s\"}";

		//是否是iView版本
		String url = "/diagrams/instances";
		/*if(MainConfigHelper.getConfig().loginPage.equalsIgnoreCase("iview"))
			url = "/diagrams/iView/instances";*/

		String file = BasePath.getPath()+url;
		if(os.equals("Linux") || os.equals("linux")){
			file = BasePath.getWebDirByEnv(url);
		}
		List<String> list = getAllFile(file,false);
		
		ArrayList<Equipment> equipments = EquipmentProvider.getInstance().GetAllEquipments();
		
		String result = "";
		for(int i = 0;i < list.size();i++){
			String value = list.get(i).replace('\\', '/');
    		if(value.lastIndexOf("/") == -1 || value.lastIndexOf(".json") == -1) continue;
			if(i > 0) result += ",";
			String id = value.substring(value.lastIndexOf("/")+1,value.lastIndexOf(".json"));
			String name = "";
			try {
				for(Equipment ets : equipments){
					if(ets.EquipmentId == Integer.parseInt(id)){
						name = ets.EquipmentName;
						break;
					}
				}
			} catch (Exception e) {}
			if(name.equals(""))
				name = id;
			
			result += String.format(cfg, id , name ,value);
		}
		arr = String.format(arr, result);
		return arr;
    }

    public String copyJsonInstance(String filePage,String deviceId){
    	try {
    		if(!os.equals("Linux") && !os.equals("linux")){
    			return "NotLinuxSystem";
    		}
			//是否是iView版本
			String url = " /home/app/web/diagrams/instances/";
			/*if(MainConfigHelper.getConfig().loginPage.equalsIgnoreCase("iview"))
				url = " /home/app/web/diagrams/iView/instances/";*/

    		String[] cmd_date = new String[]{"/bin/sh", "-c",
    				"/bin/cp "+filePage+url+deviceId+".json"};
    		SystemSettingProvider.getInstance().getSystemData(cmd_date);
		} catch (Exception e) {
			log.error("CopyJsonInstance Exception:"+e);
		}
    	return "OK";
    }
}
