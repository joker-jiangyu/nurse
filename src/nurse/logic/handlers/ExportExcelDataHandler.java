package nurse.logic.handlers;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import nurse.logic.providers.OtherModuleProvider;
import nurse.utility.Base64Helper;
import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import nurse.NurseApp;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.utility.BasePath;

public class ExportExcelDataHandler extends DataHandlerBase {
	private static Logger log = Logger.getLogger(ExportExcelDataHandler.class);
	
	public static final String GetActiveAlarms = "getActiveAlarms";
	public static final String GetHisAlarms = "getHisAlarms";
	public static final String GetHisDatas = "getHisDatas";
	public static final String GetExcel = "getExcel";
	public static final String GetText = "getText";
	public static final String GetXml = "getXml";
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ExportExcelDataHandler.GetExcel)){
			rep.responseResult = HandleGetExcel(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ExportExcelDataHandler.GetActiveAlarms)){
			rep.responseResult = HandleGetActiveAlarms(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ExportExcelDataHandler.GetHisAlarms))
		{
			rep.responseResult = HandleGetHisAlarms(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ExportExcelDataHandler.GetHisDatas))
		{
			rep.responseResult = HandleGetHisDatas(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ExportExcelDataHandler.GetText))
		{
			rep.responseResult = HandleGetText(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ExportExcelDataHandler.GetXml))
		{
			rep.responseResult = HandleGetXml(req.requestParams);
		}
	}

	private String HandleGetExcel(String requestParams) {
		if (requestParams == null || requestParams.length() == 0) return "NA";
		
		int rownum=0;
		int cellnum = 0;
		
		// 创建Excel文档
        HSSFWorkbook hwb = new HSSFWorkbook();
        // sheet 对应一个工作页
        HSSFSheet sheet = hwb.createSheet("page1");        
        
		String[] tokens = requestParams.split("\n");
		for(String rs : tokens){
			HSSFRow row = sheet.createRow(rownum++); // 下标为0的行开始
			String[] fields = rs.split(",");
			cellnum = 0;
			for(String fd : fields){
				HSSFCell cell = row.createCell(cellnum++);	
				cell.setCellValue(fd);
			}
		}
		
		saveExcelFile("data.xls",hwb);
        
		return "OK";
	}
	
	public void saveExcelFile(String fileName, HSSFWorkbook hwb) {		
		String filePath = BasePath.getWebDirByEnv("web/upload/" + fileName);
		//String filePath = BasePath.getDirByEnv("diagrams/"  + fileName );
		File f = new File(filePath);
		
		//如果文件夹不存在则创建
		if (!f.exists() && !f.isDirectory()){        
    		f.mkdirs();// 创建多级目录 
    	}
		
		if (f.exists()) f.delete();
			
		try { 
			// 创建文件输出流，准备输出电子表格
			OutputStream out = new FileOutputStream(filePath);
	        hwb.write(out);
	        out.close();
	        
	    } catch (IOException e) {  
	        e.printStackTrace();  
	    }
	}

	private String HandleGetHisDatas(String requestParams) {
		// TODO Auto-generated method stub
		return null;
	}

	private String HandleGetHisAlarms(String requestParams) {
		// TODO Auto-generated method stub
		return null;
	}

	private String HandleGetActiveAlarms(String requestParams) {
		// TODO Auto-generated method stub
		return null;
	}

	private String HandleGetText(String requestParams){
		if (requestParams == null || requestParams.length() == 0) return "NA";
		String[] tokens = requestParams.split("\n");
		String filePath = BasePath.getWebDirByEnv("web/upload/data.log");
		System.out.println("FilePath:"+filePath+", tokens Size:"+tokens.length);
		writeLineFile(filePath, tokens);
		return "OK";
	}

	private void writeLineFile(String filePath, String[] content){
		File f = new File(filePath);

		//如果文件夹不存在则创建
		if (!f.exists() && !f.isDirectory()){
			f.mkdirs();// 创建多级目录
		}

		if (f.exists()) f.delete();
		try {

			FileOutputStream out = new FileOutputStream(filePath);
			OutputStreamWriter outWriter = new OutputStreamWriter(out, "UTF-8");
			BufferedWriter bufWrite = new BufferedWriter(outWriter);
			for (int i = 0; i < content.length; i++) {
				bufWrite.write(content[i].trim() + "\r\n");
			}
			bufWrite.close();
			outWriter.close();
			out.close();
		} catch (Exception e) {
			log.error("读取" + filePath + "出错！",e);
		}
	}

	private String HandleGetXml(String requestParams){
		//requestParams => Url(cmbspace/Config/devices_*.xml)|encode
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		String url = split[0];
		if(url.equals("")) return "Error";
		String encode = split.length > 1 ? split[1] : "UTF-8";

		url = getFileName(url);
		if(url == null) return "Error";
		File file = new File(url);
		String fileName = file.getName();

		ArrayList<String> lines = OtherModuleProvider.getInstance().readFile(url, encode);
		String filePath = BasePath.getWebDirByEnv("web/upload/"+fileName);
		writeLineFile(filePath, lines);
		return fileName;
	}

	private String getFileName(String url){
		String result = "";
		try{
			//String url = "F:\\桌面分区\\开发\\64.B接口配置\\devices_[0-9]*.xml";
			if(url.indexOf("\\") != -1)
				url = url.replaceAll("\\\\","/");
			int index = url.lastIndexOf("/");

			if(index == -1) return url;

			//拆分文件夹和文件名称
			String directory = url.substring(0,index);
			String fileName = url.substring(index+1);
			//System.out.println("Dir:"+directory+" File:"+fileName);

			File file = new File(directory);

			File[] files = file.listFiles();
			if(files == null) return null;

			for (File f : files){
				if (f.isFile()){
					Pattern p = Pattern.compile(fileName);
					Matcher m = p.matcher(f.getName());
					boolean b = m.find();
					//System.out.println("FileName:"+fileName+" ,GetName:"+f.getName()+" ,Find:"+m.find());
					if(b) result = directory +"/"+ f.getName();
				}
			}
		}catch (Exception ex){
			log.error("getFileName Exception:",ex);
		}
		return result;
	}

	private void writeLineFile(String filePath, ArrayList<String> contents){
		File f = new File(filePath);

		//如果文件夹不存在则创建
		if (!f.exists() && !f.isDirectory()){
			f.mkdirs();// 创建多级目录
		}

		if (f.exists()) f.delete();
		try {

			FileOutputStream out = new FileOutputStream(filePath);
			OutputStreamWriter outWriter = new OutputStreamWriter(out, "UTF-8");
			BufferedWriter bufWrite = new BufferedWriter(outWriter);
			for (String line : contents) {
				bufWrite.write(line.trim() + "\r\n");
			}
			bufWrite.close();
			outWriter.close();
			out.close();
		} catch (Exception e) {
			log.error("读取" + filePath + "出错！",e);
		}
	}
}
