package nurse.utility;

import java.io.File;  
import java.net.URL;  
import java.net.URLDecoder;
import java.util.Properties;  
  
public class BasePath {  
	private static String os = null;//保存当前系统类型
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
	
    public static String getPath() {  
        URL url = BasePath.class.getProtectionDomain().getCodeSource().getLocation();  
        String filePath = null;  
        try {  
            filePath = URLDecoder.decode(url.getPath(), "utf-8");// 转化为utf-8编码  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
        if (filePath.endsWith(".jar")) {// 可执行jar包运行的结果里包含".jar"  
            // 截取路径中的jar包名  
            filePath = filePath.substring(0, filePath.lastIndexOf("/") + 1);  
        }  
          
        File file = new File(filePath);  
          
        // /If this abstract pathname is already absolute, then the pathname  
        // string is simply returned as if by the getPath method. If this  
        // abstract pathname is the empty abstract pathname then the pathname  
        // string of the current user directory, which is named by the system  
        // property user.dir, is returned.  
        filePath = file.getAbsolutePath();//得到windows下的正确路径  
        return filePath;  
    }  
    
    public static String combine(String path1, String path2)
    {
        File file1 = new File(path1);
        File file2 = new File(file1, path2);
        return file2.getPath();
    }
    
    public static String getDirByEnv(String path)
    {
    	String baseDir = BasePath.getPath();
    	return combine(baseDir, path);
    }
    
    public static String getWebDirByEnv(String path)
    {
    	String baseDir = BasePath.getPath();
    	
		if (baseDir.contains("classes") && baseDir.contains("target")){
			int i = baseDir.indexOf("target");
			if (i > 1){
				baseDir = baseDir.substring(0, i-1);
			}
		}
		
    	return combine(baseDir, path);
    }

    /**
     * 推荐
     * @return E:/code/nurse/target/web/ | /home/app/web/web/
     */
    public static String getWebPath(){
    	//Windows   => ../nurse/target/web/
		String wFile = BasePath.getPath();
		wFile = wFile.substring(0,wFile.replace('\\', '/').lastIndexOf("/"));
		String file = wFile+"/web/";
		//Linux     => /home/app/web/web
		if(os.equals("Linux") || os.equals("linux")){
			file = BasePath.getWebDirByEnv("/web/")+"/";
		}
		file = file.replace('\\', '/');
		return file;
    }

    public static String getImagePath(){
        //Windows   => ../nurse/target/web/img/
        String wFile = BasePath.getPath();
        wFile = wFile.substring(0,wFile.replace('\\', '/').lastIndexOf("/"));
        wFile = wFile.replace("target","");
        String file = wFile+"web/img/";
        //Linux     => /home/app/web/web/img/
        if(os.equals("Linux") || os.equals("linux")){
            file = BasePath.getWebDirByEnv("/web/")+"/img/";
        }
        file = file.replace('\\', '/');
        return file;
    }
}  
