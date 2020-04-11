package nurse.logic.providers;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;

import nurse.common.DataColumnCollection;
import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.BasePath;
import nurse.utility.DatabaseHelper;

/**
 * 配置管理器 点击配置生效后，保存配置XML文件
 * @author Eddy
 *
 */
public class ConfManagerProvider {
	
	private static ConfManagerProvider instance = new ConfManagerProvider();
	private static Logger log = Logger.getLogger(ConfManagerProvider.class);
	
	private static final String path = BasePath.getWebDirByEnv("web/TableCfg.xml");
	private static HashSet<String> tableSet = new HashSet<String>();
	private static HashSet<String> soSet = new HashSet<String>();
	private static HashSet<String> configSet = new HashSet<String>();
	private static HashSet<WebMap> webSet = new HashSet<WebMap>();
	
	private static String os = null;//保存当前系统类型
	
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
	
	public ConfManagerProvider() {
	}
	
	public static ConfManagerProvider getInstance(){
		return instance;
	}
	
	public void InitCongigManager(){
		loadTableConfig();
		loadSoConfig();
		
		createConfigFiles();
	}
	
	/**
	 * 加载并缓存表配置
	 */
	@SuppressWarnings("unchecked")
	private void loadTableConfig(){
		try {
			SAXReader saxReader = new SAXReader();   
	    	Document xmlDoc = saxReader.read(new File(path));
	    	
	    	Element table = (Element)xmlDoc.selectSingleNode("/Main/Table/ItemTable");
	    	String tables = table.attributeValue("Tables");
	    	String[] split1 = tables.split(",");
	    	for(String t : split1){
	    		tableSet.add(t);
	    	}
	    	
	    	Element root = (Element) xmlDoc.getRootElement();
	    	List<Element> needTable = root.selectNodes("/Main/NeedUpdateTable/*");
	    	for(Element ele : needTable){
	    		String mainTables = ele.attributeValue("MainTable");
	    		String[] split2 = mainTables.split(",");
		    	for(String t : split2){
		    		tableSet.add(t);
		    	}
		    	
	    		String otherTables = ele.attributeValue("OtherTables");
	    		String[] split3 = otherTables.split(",");
		    	for(String t : split3){
		    		tableSet.add(t);
		    	}
	    	}
	    	
	    	List<Element> tableColumn = root.selectNodes("/Main/TableColumnMap/*");
	    	for(Element ele : tableColumn){
	    		String relTables = ele.attributeValue("RelTable");
	    		String[] split4 = relTables.split(",");
		    	for(String t : split4){
		    		tableSet.add(t);
		    	}
	    	}
	    	
	    	List<Element> configFile = root.selectNodes("/Main/ConfigFiles/*");
	    	for(Element ele : configFile){
	    		String item = ele.attributeValue("Item");
	    		configSet.add(item);
	    	}
	    	
	    	webSet = new HashSet<WebMap>();
	    	List<Element> webFile = root.selectNodes("/Main/WebFiles/*");
	    	for(Element ele : webFile){
	    		WebMap wm = new WebMap();
	    		wm.Root = ele.attributeValue("Root");
	    		wm.File = ele.attributeValue("File");
	    		wm.Backup = ele.attributeValue("Backup");
	    		webSet.add(wm);
	    	}
		} catch (Exception e) {
			log.error("loadTableConfig Exception:",e);
		}
	}

	/**
	 * 加载并缓存SO库配置
	 */
	private void loadSoConfig(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT DllPath FROM TSL_Sampler;";
			DataTable dt = dbHelper.executeToTable(sql);
			for(int i = 0;i < dt.getRowCount();i++){
				DataRow dr = dt.getRows().get(i);
				String soName = dr.getValueAsString("DllPath");
				if(soName.indexOf(".") > -1)
					soName = soName.substring(0,soName.indexOf("."));
				soSet.add(soName);
			}
		} catch (Exception e) {
			log.error("loadSoConfig Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/**
	 * 生成配置文件
	 */
	private void createConfigFiles(){
		if(!os.equals("Linux") && !os.equals("linux")) return;
		
		String creaFile = BasePath.getWebDirByEnv("web/upload/");
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT StationId,StationName FROM TBL_Station;";
			DataTable dt = dbHelper.executeToTable(sql);
			if(dt.getRowCount() > 0){
				String stationId = dt.getRows().get(0).getValueAsString("StationId");
				//String stationName = dt.getRows().get(0).getValueAsString("StationName");
				
				File dir = new File(String.format("%s/%s_XXX/XmlCfg/",creaFile,stationId));
	        	//如果文件夹不存在则创建     
	        	if (!dir.exists()  && !dir.isDirectory()){        
	        		dir.mkdirs();// 创建多级目录 
	        	}
	        	File dir2 = new File(String.format("%s/%s_XXX/SO/",creaFile,stationId));
	        	//如果文件夹不存在则创建     
	        	if (!dir2.exists()  && !dir2.isDirectory()){        
	        		dir2.mkdirs();// 创建多级目录 
	        	}
	        	File dir3 = new File(String.format("%s/%s_XXX/JsonCfg/",creaFile,stationId));
	        	//如果文件夹不存在则创建     
	        	if (!dir3.exists()  && !dir3.isDirectory()){        
	        		dir3.mkdirs();// 创建多级目录 
	        	}
	        	File dir4 = new File(String.format("%s/%s_XXX/",creaFile,stationId));
	        	//如果文件夹不存在则创建     
	        	if (!dir4.exists()  && !dir4.isDirectory()){        
	        		dir4.mkdirs();// 创建多级目录 
	        	}
	        	File dir5 = new File(String.format("%s/%s_XXX/Config/",creaFile,stationId));
	        	//如果文件夹不存在则创建     
	        	if (!dir5.exists()  && !dir5.isDirectory()){        
	        		dir5.mkdirs();// 创建多级目录 
	        	}
	        	
	        	
	        	//循环配置缓存
	        	loopWriteConfig(dir);
	        	//复制SO文件
	        	createSoFiles(dir2);
	        	//复制Json文件
	        	createJsonFiles(dir3);
	        	//复制Web文件
	        	createWebFiles(dir4);
	        	//复制MainConfig.xml
	        	createConfigFiles(dir5);
				log.info("Backup Config Succeed!File:"+String.format("%s/%s_XXX/",creaFile,stationId));
			}
		} catch (Exception e) {
			log.error("createConfigFiles Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/**
	 * 循环写入配置文件
	 * @param dir 写入文件目录
	 */
	private void loopWriteConfig(File dir){
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "";
			for(String table : tableSet){
				//判断表是否存在
				sql = String.format("SELECT table_name FROM information_schema.TABLES WHERE table_name = '%s';", table);
				dt = dbHelper.executeToTable(sql);
				if(dt.getRowCount() > 0){
					sql = String.format("SELECT * FROM %s;", table);

					dt = dbHelper.executeToTable(sql);
					//写入配置文件
					writeConfig(table,dt,dir);
				}
			}
		} catch (Exception e) {
			log.error("loopWriteConfig Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/**
	 * 写入配置文件
	 * @param dt 表数据
	 * @param dir 写入文件目录
	 */
	private void writeConfig(String table,DataTable dt,File dir){
		
		try {
			// 第一步：创建DOM树
			Document document = DocumentHelper.createDocument();
			// 第二步：完善树结构
			     // 创建节点
			Element root = document.addElement(table);
			for(int i = 0;i < dt.getRowCount();i++){
				Element tbls = root.addElement("Table");
				DataColumnCollection columns = dt.getColumns();
				DataRowCollection dr = dt.getRows();
				for(int j = 0; j < columns.size();j++){
				    // 设置节点的属性、内容
					tbls.addAttribute(columns.get(j).getColumnName(), resultValue(dr.get(i).getValueAsString(j)));
				}
			}
			//设置输出格式 
			OutputFormat format = OutputFormat.createPrettyPrint();
			// 第三步：将树结构导入book.xml文件中
			format.setEncoding("utf-8");        
			//将写好的文档document输出到指定XML文件中并关闭XMLWriter对象
			XMLWriter xml = new XMLWriter(new FileOutputStream(dir.getPath()+"/"+table+".xml"),format);
			     //有时候我们的内容text中会有诸如/、>之类的，我们要告诉XML,不要转义这些字符
			xml.setEscapeText(false);
			xml.write(document);
			xml.close();
		} catch (Exception e) {
			log.error("writeConfig Table:"+table+", Exception:",e);
		}
	}
	
	/**
	 * 返回合法数据
	 */
	private String resultValue(String value){
		if(value == null) return "null";
		if(value.equals("true")) return "1";
		if(value.equals("false")) return "0";
		return value;
	}
	
	/**
	 * 复制So文件
	 */
	private void createSoFiles(File dir){
		if(!os.equals("Linux") && !os.equals("linux")) return;
		String[] cmd_date = null;
		for(String os : soSet){
			cmd_date = new String[]{"/bin/sh", "-c",
					"/bin/cp /home/app/samp/SO/"+os+".* "+dir.getPath()+"/"};
			SystemSettingProvider.getInstance().getSystemData(cmd_date);
		}
	} 
	
	/**
	 * 复制Json文件
	 */
	private void createJsonFiles(File dir){
		if(!os.equals("Linux") && !os.equals("linux")) return;
		
		String[] cmd_date = new String[]{"/bin/sh", "-c",
				"/bin/cp /home/app/web/diagrams/instances/* "+dir.getPath()+"/"};
		SystemSettingProvider.getInstance().getSystemData(cmd_date);
	}
	
	/**
	 * 复制Web文件
	 */
	private void createWebFiles(File dir){
		if(!os.equals("Linux") && !os.equals("linux")) return;
		
		for(WebMap wm : webSet){
			File f = new File(dir.getPath()+"/"+wm.Backup.replace("\\\\", "/"));
			if (!f.exists() && !f.isDirectory()){        
				f.mkdirs();// 创建多级目录 
	    	}
			
			String[] cmd_date = new String[]{"/bin/sh", "-c",
					"/bin/cp "+wm.Root+wm.File+" "+f.getPath()+"/"};
			SystemSettingProvider.getInstance().getSystemData(cmd_date);
		}
	}
	
	/**
	 * 复制配置文件
	 */
	private void createConfigFiles(File dir){
		if(!os.equals("Linux") && !os.equals("linux")) return;
		
		for(String item : configSet){
			String[] cmd_date = new String[]{"/bin/sh", "-c",
					"/bin/cp "+item+" "+dir.getPath()+"/"};
			SystemSettingProvider.getInstance().getSystemData(cmd_date);
		}
	}
}
class WebMap{
	String Root;
	String File;
	String Backup;
}