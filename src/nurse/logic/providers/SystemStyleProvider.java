package nurse.logic.providers;

import nurse.utility.BasePath;
import org.apache.log4j.Logger;

import java.io.File;

public class SystemStyleProvider {

    private static SystemStyleProvider instance = new SystemStyleProvider();
    private static Logger log = Logger.getLogger(SystemStyleProvider.class);

    public SystemStyleProvider() { }

    public static SystemStyleProvider getInstance(){
        return instance;
    }

    private static final String[] LoginFiles = new String[]{"bg.jpg","loginbg.jpg","logininfo.png","logo.png","loading.gif","loadingbg.png"};

    public boolean updateLoginFile(String oldStyle,String newStyle){
        //Blue/White : 将LoginFiles数组的文件改为_oldStyle文件，将_newStyle文件改为数组文件，实现文件替换功能
        String webPath = BasePath.getImagePath();
        for (String file : LoginFiles){//file = img/loginbg.jpg
            System.out.println("File:"+file+" =====================> ");
            //判断被修改的备用图示是否存在，如：白色背景的图是否存在
            String newFileName = spliceFile(file,"_"+newStyle);//newStyle = White ; newFile= img/loginbg_White.jpg
            File objFile = new File(webPath+newFileName);
            if(!objFile.exists()){
                System.out.println("File:"+webPath+newFileName+" Not Exists!");
                continue;
            }

            //拼接文件名
            String oldFile = spliceFile(file,"_"+oldStyle);//oldStyle = Blue ; oldFile= img/loginbg_Blue.jpg
            System.out.println("OldStyle:"+oldStyle+", OldFile:"+oldFile);
            //修改文件
            String oldFilePath = updateFile(webPath+file,webPath+oldFile); // img/loginbg.jpg 改为 img/loginbg_Blue.jpg
            System.out.println("OldFilePath:"+oldFilePath);

            //拼接文件名
            String newFile = spliceFile(file,"_"+newStyle);//newStyle = White ; newFile= img/loginbg_White.jpg
            System.out.println("NewStyle:"+newStyle+", NewFile:"+newFile);
            //修改文件
            String mewFilePath = updateFile(webPath+newFile,webPath+file);// img/loginbg_White.jpg 改为 img/loginbg.jpg
            System.out.println("NewFilePath:"+mewFilePath);
        }
        return true;
    }

    /**
     * 修改文件名
     * @param fileName 文件名
     * @param ch 追加字符
     * @return 新文件名
     */
    private String spliceFile(String fileName,String ch){
        StringBuffer newFile = new StringBuffer(fileName);

        int dotIndex = fileName.lastIndexOf(".");

        newFile.insert(dotIndex,ch);

        return newFile.toString();
    }

    /**
     * 修改文件名
     * @param oldFilePath 源文件
     * @param newFilePath 新文件
     * @return
     */
    private String updateFile(String oldFilePath,String newFilePath){
        File oldFile = new File(oldFilePath);

        if (!oldFile.exists()) { // 判断原文件是否存在（防止文件名冲突）
            log.error("Not File!"+oldFilePath);
            return oldFilePath;
        }

        if (!oldFile.isDirectory()) {
            File newFile = new File(newFilePath);
            try {
                oldFile.renameTo(newFile); // 修改文件名
                System.out.println(oldFilePath+" => "+newFilePath);
            } catch (Exception err) {
                log.error("Exception:",err);
                return null;
            }
            return newFilePath;
        }
        return oldFilePath;
    }
}

