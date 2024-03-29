package nurse.logic.handlers;

import java.io.*; 
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.Base64;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.ArrayList;
import java.util.List;
import java.util.zip.CRC32;
import java.util.zip.CheckedOutputStream;

import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.utility.BasePath;

public class ZipFileHandler extends DataHandlerBase {

	private static final String CompressionFile = "compressionFile";
	private static final String DecompressionFile = "decompressionFile";
	private static List list = new ArrayList();
	
	public ZipFileHandler() {
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ZipFileHandler.CompressionFile))
		{
			rep.responseResult = handleCompressionFile(req.requestParams);
		}
		
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ZipFileHandler.DecompressionFile))
		{
			rep.responseResult = handleDecompressionFile(req.requestParams);
		}
	}

	private String handleDecompressionFile(String requestParams) {

		Path path = null;
		String filename = null;
		
		String sourcePath = null;
		String descPath = null;
		String name = null;
		//获取系统编码  
        String encoding = System.getProperty("file.encoding");
        try {
        	//String utfStr =URLDecoder.decode(requestParams, "UTF-8");
        	String utfStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
			filename = new String(utfStr.getBytes(), encoding);
			path = Paths.get(BasePath.getPath(), "web/", filename);
			name = path.getFileName().toString();
			
			sourcePath = path.toString();
			sourcePath = sourcePath.replace('\\', '/');
			
			if(sourcePath.indexOf("/") != -1)
			{
				descPath = sourcePath.substring(0, sourcePath.lastIndexOf("/"));   
			}
			else
			{
				descPath = sourcePath;
			}
			
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}

        //解压部分函数
        try   
        {  
        	//存在同命名的文件夹删除该文件夹
    		String fileName = name.substring(0, name.lastIndexOf("."));
    		String filePath = descPath + "/" + fileName;
    		File f = new File(filePath);  
    		if(f.exists())
    			delFolder(filePath);
    		
        	boolean bRet = unZip(sourcePath, descPath);  
        	if(bRet)
        	{
        		name = name.substring(0, name.lastIndexOf("."));
        		descPath = descPath + "/" + name;
        		System.out.println("Decompression file success: " + descPath);
        	}
        	else
        	{
        		System.out.println("Decompression file file: " + sourcePath);
        		return "fail to decompression file";
        	}
        }  
        catch (Exception e)  
        {  
            e.printStackTrace();  
            return "fail to decompression file";
        }  
        
		return descPath;		
	}

	private String handleCompressionFile(String requestParams) {

		String filename = null;	
		Path path = null;
		String sourcePath = null;
		String descFileName = null;
		
		//获取系统编码  
		String encoding = System.getProperty("file.encoding");
        try {
        	//String utfStr =URLDecoder.decode(requestParams, "UTF-8");
        	String utfStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
			filename = new String(utfStr.getBytes(), encoding);
			path = Paths.get(BasePath.getPath(), "web/", filename);
			
			sourcePath = path.toString();
			sourcePath = sourcePath.replace('\\', '/');
			
			if(sourcePath.indexOf("/") != -1)
			{
				descFileName = sourcePath.substring(0, sourcePath.lastIndexOf("/"))+ ".zip";   
			}
			else
			{
				descFileName = sourcePath + ".zip";
			}
			 
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}

        //解压部分函数
        long startTime=System.currentTimeMillis();  
        try   
        {  
        	zip(sourcePath, descFileName);  
            System.out.println("Compression file success: " + descFileName);
        }  
        catch (Exception e)  
        {  
            e.printStackTrace(); 
            return "fail to Compression file";
        }  
        long endTime=System.currentTimeMillis();  

        System.out.println("Time-consuming: " + (endTime-startTime)+" ms");
        
		return descFileName;
			
	}
	
	 

	/*// //////////////////////////解压缩////////////////////////////////////////*/

	/**
	* 调用org.apache.tools.zip实现解压缩，支持目录嵌套和中文名
	* 也可以使用java.util.zip不过如果是中文的话，解压缩的时候文件名字会是乱码。原因是解压缩软件的编码格式跟java.util.zip.ZipInputStream的编码字符集(固定是UTF-8)不同
	*
	* @param zipFileName
	*            要解压缩的文件
	* @param outputDirectory
	*            要解压到的目录
	* @throws Exception
	*/
	public static boolean unZip(String zipFileName, String outputDirectory) {
		
	  boolean flag = false;

	  try {
		  
	   String encoding = System.getProperty("file.encoding");

	   org.apache.tools.zip.ZipFile zipFile = new org.apache.tools.zip.ZipFile(
	     zipFileName, "GBK");
	   
	   java.util.Enumeration e = zipFile.getEntries();
	   org.apache.tools.zip.ZipEntry zipEntry = null;
	   createDirectory(outputDirectory, "");
	   while (e.hasMoreElements()) {
	    zipEntry = (org.apache.tools.zip.ZipEntry) e.nextElement();
	
	    if (zipEntry.isDirectory()) {
	     String name = zipEntry.getName();
	     name = name.substring(0, name.length() - 1);
	     File f = new File(outputDirectory + File.separator + name);
	     f.mkdir();
	     System.out.println("mkdir:" + outputDirectory
	       + File.separator + name);
	    } else {
	     String fileName = zipEntry.getName();
	     fileName = fileName.replace('\\', '/');

	     if (fileName.indexOf("/") != -1) {
	      createDirectory(outputDirectory, fileName.substring(0,
	        fileName.lastIndexOf("/")));
	      fileName = fileName.substring(
	        fileName.lastIndexOf("/") + 1, fileName
	          .length());
	     }
	
	     File f = new File(outputDirectory + File.separator
	       + zipEntry.getName());
	     
	     f.createNewFile();
	     
	     InputStream in = zipFile.getInputStream(zipEntry);
	     FileOutputStream out = new FileOutputStream(f);
	
	     byte[] by = new byte[1024];
	     int c;
	     while ((c = in.read(by)) != -1) {
	      out.write(by, 0, c);
	     }
	     out.close();
	     in.close();
	     
	    }
	    flag = true;
	   }
	   zipFile.close();
	  } catch (Exception ex) {
	   ex.printStackTrace();
	  }
	  
	  	return flag;
	}

	/**
	* 创建目录
	* 
	* @param directory
	*            父目录
	* @param subDirectory
	*            子目录
	*/
	private static void createDirectory(String directory, String subDirectory) {
	  String dir[];
	  File fl = new File(directory);
	  try {
	   if (subDirectory == "" && fl.exists() != true)
	    fl.mkdir();
	   else if (subDirectory != "") {
	    dir = subDirectory.replace('\\', '/').split("/");
	    for (int i = 0; i < dir.length; i++) {
	     File subFile = new File(directory + File.separator + dir[i]);
	     if (subFile.exists() == false)
	      subFile.mkdir();
	     directory += File.separator + dir[i];
	    }
	   }
	  } catch (Exception ex) {
	   System.out.println(ex.getMessage());
	  }
	}

 	/*// ////////////////////////////压缩////////////////////////////////////////*/
	
	// 压缩
	/*  String baseDirName = "C:\\";
	  String[] fileNames = { "中文1.doc", "中文2.doc" };
	  String zipFileName = "c:\\中文.zip";
	  // 压缩多个指定的文件 到ZIP
	   zip(baseDirName, fileNames,zipFileName,"GBK");

	  //压缩一个文件夹 到ZIP
	  String sourcePath = "c:\\test\\";
	  String zipFilePath = "c:\\中文2.zip";
	  zip(sourcePath, zipFilePath);
	*/

	  
	private static List listFile(String path) {
		  File file = new File(path);
		  String[] array = null;
		  String sTemp = "";

		  if (!file.isDirectory()) {
		   return null;
		  }
		  array = file.list();
		  if (array.length > 0) {
		   for (int i = 0; i < array.length; i++) {
		    sTemp = path + array[i];
		    file = new File(sTemp);
		    if (file.isDirectory()) {
		     listFile(sTemp + "/");
		    } else
		     list.add(sTemp);
		   }
		  } else {
		   return null;
		  }

		  return list;
		 }
	
	public static void zip(String needtozipfilepath, String zipfilepath){
		  try {
		   byte[] b = new byte[512];

		   File needtozipfile = new File(needtozipfilepath);

		   if (!needtozipfile.exists()) {
		    System.err.println("指定的要压缩的文件或目录不存在.");
		    return;
		   }

		   String zipFile = zipfilepath;
		   File targetFile = new File(zipFile.substring(0, zipFile.indexOf("\\") + 1));

		   if (!targetFile.exists()) {
		    System.out.println("指定的目标文件或目录不存在.");
		    return;
		   }

		   String filepath = needtozipfilepath;
		   List fileList = listFile(filepath);
		   FileOutputStream fileOutputStream = new FileOutputStream(zipFile);
		   CheckedOutputStream cs = new CheckedOutputStream(fileOutputStream,new CRC32());
		   ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(cs));

		   for (int i = 0; i < fileList.size(); i++) {
		    InputStream in = new FileInputStream((String) fileList.get(i));
		    String fileName = ((String) fileList.get(i)).replace(File.separatorChar, '/');
		    fileName = fileName.substring(fileName.indexOf("/") + 1);
		    ZipEntry e = new ZipEntry(fileName);
		    out.putNextEntry(e);
		    int len = 0;
		    while ((len = in.read(b)) != -1) {
		     out.write(b, 0, len);
		    }
		    out.closeEntry();
		   }
		   out.close();
		  } catch (Exception e) {
		   e.printStackTrace();
		  }
	}

	
	// ///////////////////////////////////////
	 /**
	  * 压缩文件 或者 文件夹
	  * 
	  * @param baseDirName
	  *            压缩的根目录
	  * @param fileName
	  *            根目录下待压缩的文件或文件夹名
	  * @param targetFileName
	  *            目标ZIP 文件 星号 "*" 表示压缩根目录下的全部文件
	  * 
	  */
	 public static boolean zip(String baseDirName, String[] fileNames, String targetFileName, String encoding) {
		 
	  boolean flag = false;
	  try {
	   // 判断 "压缩的根目录"是否存在! 是否是一个文件夹!
	   File baseDir = new File(baseDirName);
	   if (!baseDir.exists() || (!baseDir.isDirectory())) {
	    System.err.println("压缩失败! 根目录不存在: " + baseDirName);
	    return false;
	   }

	   // 得到这个 "压缩的根目录" 的绝对路径
	   String baseDirPath = baseDir.getAbsolutePath();

	   // 由这个 "目标 ZIP 文件" 文件名得到一个 压缩对象 ZipOutputStream
	   File targetFile = new File(targetFileName);
	   ZipOutputStream out = new ZipOutputStream(new FileOutputStream(
	     targetFile));
	   // 中文有乱码，引进下面的改造类
	   // CnZipOutputStream out = new CnZipOutputStream(new
	   // FileOutputStream(targetFile),encoding);

	   // 设置压缩编码Apache Ant有个包专门处理ZIP文件，可以指定文件名的编码方式。由此可以解决问题。例如：用
	   // org.apache.tools.zip.ZipOutputStream代替java.util.zip.ZipOutputStream。ZipOutputStream
	   // out = .....; out.setEncoding("GBK");
	   // out.setEncoding("GBK");//设置为GBK后在windows下就不会乱码了，如果要放到Linux或者Unix下就不要设置了
	   out.setEncoding(encoding);

	   // "*" 表示压缩包括根目录 baseDirName 在内的全部文件 到 targetFileName文件下
	   if (fileNames.equals("*")) {
	    dirToZip(baseDirPath, baseDir, out);
	   } else {
	    File[] files = new File[fileNames.length];
	    for (int i = 0; i < files.length; i++) {
	     // 根据 parent 抽象路径名和 child 路径名字符串创建一个新 File 实例。
	     files[i] = new File(baseDir, fileNames[i]);
	    }
	    if (files[0].isFile()) {
	     // 调用本类的一个静态方法 压缩一个文件
	     // CompressUtil.fileToZip(baseDirPath, file, out);
	     filesToZip(baseDirPath, files, out);
	    }

	   }
	   out.close();
	   // System.out.println("压缩成功! 目标文件名为: " + targetFileName);
	   flag = true;
	  } catch (FileNotFoundException e) {
	   e.printStackTrace();
	  } catch (IOException e) {
	   e.printStackTrace();
	  }
	  return flag;
	 }

	 /**
	  * 将文件压缩到Zip 输出流
	  * 
	  * @param baseDirPath
	  *            根目录路径
	  * @param file
	  *            要压缩的文件
	  * @param out
	  *            输出流
	  * @throws IOException
	  */
	 private static void fileToZip(String baseDirPath, File file, ZipOutputStream out) throws IOException {
	  //
	  FileInputStream in = null;
	  org.apache.tools.zip.ZipEntry entry = null;
	  // 创建复制缓冲区 1024*4 = 4K
	  byte[] buffer = new byte[1024 * 4];
	  int bytes_read = 0;
	  if (file.isFile()) {
	   in = new FileInputStream(file);
	   // 根据 parent 路径名字符串和 child 路径名字符串创建一个新 File 实例
	   String zipFileName = getEntryName(baseDirPath, file);
	   entry = new org.apache.tools.zip.ZipEntry(zipFileName);
	   // "压缩文件" 对象加入 "要压缩的文件" 对象
	   out.putNextEntry(entry);
	   // 现在是把 "要压缩的文件" 对象中的内容写入到 "压缩文件" 对象
	   while ((bytes_read = in.read(buffer)) != -1) {
	    out.write(buffer, 0, bytes_read);
	   }
	   out.closeEntry();
	   in.close();
	   // System.out.println("添加文件" + file.getAbsolutePath()+ "被添加到 ZIP
	   // 文件中!");
	  }
	 }

	 /**
	  * 多个文件目录压缩到Zip 输出流
	  * 
	  * @param baseDirPath
	  * @param files
	  * @param out
	  * @throws IOException
	  */
	 private static void filesToZip(String baseDirPath, File[] files, ZipOutputStream out) throws IOException {
	  // 遍历所有的文件 一个一个地压缩
	  for (int i = 0; i < files.length; i++) {
	   File file = files[i];
	   if (file.isFile()) {
	    // 调用本类的一个静态方法 压缩一个文件
	    fileToZip(baseDirPath, file, out);
	   } else {
	    /*
	     * 这是一个文件夹 所以要再次得到它下面的所有的文件 这里是自己调用自己..............递归..........
	     */
	    dirToZip(baseDirPath, file, out);
	   }
	  }
	 }

	 /**
	  * 将文件目录压缩到Zip 输出流
	  * 
	  * @param baseDirPath
	  * @param dir
	  * @param out
	  * @throws IOException
	  */
	 private static void dirToZip(String baseDirPath, File dir, ZipOutputStream out) throws IOException {
	  // 得到一个文件列表 (本目录下的所有文件对象集合)
	  File[] files = dir.listFiles();
	  // 要是这个文件集合数组的长度为 0 , 也就证明了这是一个空的文件夹,虽然没有再循环遍历它的必要,但是也要把这个空文件夹也压缩到目标文件中去
	  if (files.length == 0) {
	   // 根据 parent 路径名字符串和 child 路径名字符串创建一个新 File 实例
	   String zipFileName = getEntryName(baseDirPath, dir);
	   org.apache.tools.zip.ZipEntry entry = new org.apache.tools.zip.ZipEntry(
	     zipFileName);
	   out.putNextEntry(entry);
	   out.closeEntry();
	  } else {
	   // 遍历所有的文件 一个一个地压缩
	   for (int i = 0; i < files.length; i++) {
	    File file = files[i];
	    if (file.isFile()) {
	     // 调用本类的一个静态方法 压缩一个文件
	     fileToZip(baseDirPath, file, out);
	    } else {
	     /*
	      * 这是一个文件夹 所以要再次得到它下面的所有的文件
	      * 这里是自己调用自己..............递归..........
	      */
	     dirToZip(baseDirPath, file, out);
	    }
	   }
	  }
	 }

	 /**
	  * 获取 待压缩文件在 ZIP 文件中的 entry的名字，即相对于根目录的相对路径名
	  * 
	  * @param baseDirPath
	  *            根目录
	  * @param file
	  * @return
	  */
	 private static String getEntryName(String baseDirPath, File file) {
	  /**
	   * 改变 baseDirPath 的形式 把 "C:/temp" 变成 "C:/temp/"
	   */
	  if (!baseDirPath.endsWith(File.separator)) {
	   baseDirPath += File.separator;
	  }
	  String filePath = file.getAbsolutePath();
	  /**
	   * 测试此抽象路径名表示的文件是否是一个目录。 要是这个文件对象是一个目录 则也要变成 后面带 "/" 这个文件对象类似于
	   * "C:/temp/1.jpg" 要是这个文件是一个文件夹 则也要变成 后面带 "/"
	   * 因为你要是不这样做,它也会被压缩到目标文件中 但是却不能正解显示 也就是说操作系统不能正确识别它的文件类型(是文件还是文件夹)
	   */
	  if (file.isDirectory()) {
	   filePath += "/";
	  }
	  int index = filePath.indexOf(baseDirPath);
	  return filePath.substring(index + baseDirPath.length());
	 }

	 //删除文件夹
	 //param folderPath 文件夹完整绝对路径
	 private static boolean delFolder(String folderPath) {
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
}
