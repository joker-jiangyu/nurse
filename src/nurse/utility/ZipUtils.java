package nurse.utility;

import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.util.Zip4jConstants;
import org.apache.log4j.Logger;

import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class ZipUtils {
    private static Logger log = Logger.getLogger(ZipUtils.class);
    /**
     * 废弃！ zip压缩 toZip("E:/Test/RB1024H", "E:/Test/RB1024H.zip");
     * @param inputFile 待压缩文件夹/文件名
     * @param outputFile 生成的压缩包名字
     */
    @Deprecated
    public static void toZip(String inputFile, String outputFile){
        try {
            //创建zip输出流
            ZipOutputStream out = new ZipOutputStream(new FileOutputStream(outputFile));
            //创建缓冲输出流
            BufferedOutputStream bos = new BufferedOutputStream(out);
            File input = new File(inputFile);
            compress(out, bos, input,null);
            bos.close();
            out.close();
        }catch (Exception ex){
            log.error("toZip Exception:",ex);
        }
    }
    /**
     * @param name 压缩文件名，可以写为null保持默认
     */
    //递归压缩
    public static void compress(ZipOutputStream out, BufferedOutputStream bos, File input, String name){
        try{
            if (name == null) {
                name = input.getName();
            }
            //如果路径为目录（文件夹）
            if (input.isDirectory()) {
                //取出文件夹中的文件（或子文件夹）
                File[] flist = input.listFiles();

                if (flist.length == 0)//如果文件夹为空，则只需在目的地zip文件中写入一个目录进入
                {
                    out.putNextEntry(new ZipEntry(name + "/"));
                } else//如果文件夹不为空，则递归调用compress，文件夹中的每一个文件（或文件夹）进行压缩
                {
                    for (int i = 0; i < flist.length; i++) {
                        compress(out, bos, flist[i], name + "/" + flist[i].getName());
                    }
                }
            } else//如果不是目录（文件夹），即为文件，则先写入目录进入点，之后将文件写入zip文件中
            {
                out.putNextEntry(new ZipEntry(name));
                FileInputStream fos = new FileInputStream(input);
                BufferedInputStream bis = new BufferedInputStream(fos);
                int len=-1;
                //将源文件写入到zip文件中
                byte[] buf = new byte[1024];
                while ((len = bis.read(buf)) != -1) {
                    bos.write(buf,0,len);
                }
                bis.close();
                fos.close();
            }
        }catch (Exception ex){
            log.error("compress Exception:",ex);
        }
    }

    /**
     * 废弃！zip解压 unZip("E:/Test/RB1024H.zip","E:/Test");
     * @param inputFile 待解压文件名
     * @param destDirPath  解压路径
     */
    @Deprecated
    public static void unZip(String inputFile,String destDirPath){
        try{
            File srcFile = new File(inputFile);//获取当前压缩文件
            // 判断源文件是否存在
            if (!srcFile.exists()) {
                log.error(srcFile.getPath() + "所指文件不存在");
            }
            //开始解压
            //构建解压输入流
            ZipInputStream zIn = new ZipInputStream(new FileInputStream(srcFile));
            ZipEntry entry = null;
            File file = null;
            while ((entry = zIn.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    file = new File(destDirPath, entry.getName());
                    if (!file.exists()) {
                        new File(file.getParent()).mkdirs();//创建此文件的上级目录
                    }
                    OutputStream out = new FileOutputStream(file);
                    BufferedOutputStream bos = new BufferedOutputStream(out);
                    int len = -1;
                    byte[] buf = new byte[1024];
                    while ((len = zIn.read(buf)) != -1) {
                        bos.write(buf, 0, len);
                    }
                    // 关流顺序，先打开的后关闭
                    bos.close();
                    out.close();
                }
            }
        }catch (Exception ex){
            log.error("unZip Exception:",ex);
        }
    }

    //删除文件夹
    //param folderPath 文件夹完整绝对路径
    public static boolean delFolder(String folderPath) {
        boolean flag = false;
        try {
            delAllFile(folderPath); //删除完里面所有内容
            String filePath = folderPath;
            filePath = filePath.toString();
            java.io.File myFilePath = new java.io.File(filePath);
            myFilePath.delete(); //删除空文件夹
            flag = true;
            System.out.println("Existence Deletes Files:"+filePath);
        } catch (Exception e) {
            return flag;
        }
        return flag;
    }
    //删除指定文件夹下所有文件
    //param path 文件夹完整绝对路径
    public static boolean delAllFile(String path) {
        boolean flag = false;
        File file = new File(path);
        if (!file.exists()) {
            return flag;
        }
        if (!file.isDirectory()) {
            return flag;
        }
        String[] tempList = file.list();
        File temp = null;
        for (int i = 0; i < tempList.length; i++) {
            if (path.endsWith(File.separator)) {
                temp = new File(path + tempList[i]);
            } else {
                temp = new File(path + File.separator + tempList[i]);
            }
            if (temp.isFile()) {
                temp.delete();
            }
            if (temp.isDirectory()) {
                delAllFile(path + "/" + tempList[i]);//先删除文件夹里面的文件
                delFolder(path + "/" + tempList[i]);//再删除空文件夹
                flag = true;
            }
        }
        return flag;
    }

    /*public static void main(String[] args) {
        try {
            //压缩
            //toZip("E:/Test/RB1024H", "E:/Test/RB1024H.zip");

            //解压
            //unZip("E:/Test/RB1024H.zip","E:/Test");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }*/

    /**
     * 压缩文件夹
     * @param inputFile 压缩包名称
     * @param destDirPath 压缩文件夹
     */
    public static void toZip4j(String inputFile,String destDirPath){
        try {
            ZipFile zipFile = new ZipFile(inputFile);

            ZipParameters parameters = new ZipParameters();
            parameters.setCompressionMethod(Zip4jConstants.COMP_DEFLATE);
            parameters.setCompressionLevel(Zip4jConstants.DEFLATE_LEVEL_NORMAL);

            zipFile.addFolder(destDirPath, parameters);
        }catch (Exception e){
            log.error("toZip4j Exception:",e);
        }
    }

    /**
     * 解压ZIP
     * @param inputFile 压缩包名称
     * @param destDirPath 解压目录
     */
    public static void unZip4j(String inputFile,String destDirPath){
        try {
            ZipFile zipFile = new ZipFile(inputFile);
            zipFile.extractAll(destDirPath);
        }catch (Exception e){
            log.error("unZip4j Exception:",e);
        }
    }
}
