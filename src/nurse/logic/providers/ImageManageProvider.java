package nurse.logic.providers;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.Logger;

import nurse.utility.BasePath;

public class ImageManageProvider {
	private static ImageManageProvider instance = new ImageManageProvider();
	private static Logger log = Logger.getLogger(ImageManageProvider.class);
	private static String os = null;//保存当前系统类型
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
	
	public static ImageManageProvider getInstance() {
		return instance;
	}
	
	/**
	 * 根据目录加载图片(*.png,*.jpg,*.gif)
	 * @param path 目录
	 * @return [{'img\diagram\1.png'},{'img\diagram\2.png'}]
	 */
	public String loadImagesByPath(String path){
		try{
			String result = "[%s]";
			String cfg = "";
			//Windows
			String wFile = BasePath.getPath();
			wFile = wFile.substring(0,wFile.replace('\\', '/').lastIndexOf("/"));
			String file = wFile+"/web/"+path;
			//Linux
			if(os.equals("Linux") || os.equals("linux")){
				file = BasePath.getWebDirByEnv("/web/"+path);
			}
			file = file.replace('\\', '/');
			
			List<String> list = getAllFile(file,false);
			for(String name : list){
				//只获取图片文件
				if(name.indexOf(".png") == -1 && name.indexOf(".gif") == -1 
						&& name.indexOf(".jpg") == -1 && name.indexOf(".svg") == -1) 
					continue;
				
				String value = name.replace('\\', '/');
				value = value.substring(value.lastIndexOf("/")+1);
				if(cfg.equals("")) cfg += String.format("{\"file\":\"%s/%s\"}", path,value);
				else cfg += String.format(",{\"file\":\"%s/%s\"}", path,value);
			}
			result = String.format(result, cfg);
			return result;
		} catch (Exception e) {
			log.error("loadImagesByPath Exception:",e);
			return "[]";
		}
	}    
	
	/**
     * 获取路径下的所有文件/文件夹
     * @param directoryPath 需要遍历的文件夹路径
     * @param isAddDirectory 是否将子文件夹的路径也添加到list集合中
     * @return
     */
    private static List<String> getAllFile(String directoryPath,boolean isAddDirectory) {
        List<String> list = new ArrayList<String>();
        File baseFile = new File(directoryPath);
        if (baseFile.isFile() || !baseFile.exists()) {
            return list;
        }
        File[] files = baseFile.listFiles();
        for (File file : files) {
            if (file.isDirectory() && isAddDirectory) {
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
}
