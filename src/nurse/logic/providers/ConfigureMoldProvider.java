package nurse.logic.providers;


import java.io.File;
import java.io.BufferedWriter;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.OutputStreamWriter;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

import java.sql.CallableStatement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import nurse.common.DataRowCollection;
import nurse.logic.handlers.LanguageDataHandler;
import nurse.utility.*;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.ConfigureMold;
import org.json.JSONArray;
import org.json.JSONObject;


public class ConfigureMoldProvider {

	private static Logger log = Logger.getLogger(ConfigureMoldProvider.class);
	private static ConfigureMoldProvider instance = new ConfigureMoldProvider();
	private static String configurePath = BasePath.getWebPath()+"upload/configure";
	private static HashMap<Integer,String> deviceList = new HashMap<Integer,String>();

	public static ConfigureMoldProvider getInstance(){
		return instance;
	}

	/** ????MainConfig???????????·?? */
	public void LoadConfigureMoldHome(){
		String loginHome = MainConfigHelper.getConfig().loginHome;
		String loginPage = MainConfigHelper.getConfig().loginPage;

		if(loginHome == null || loginHome.trim().equals("")){
			if(loginPage.equalsIgnoreCase("2d") || loginPage.equalsIgnoreCase("3d")){
				//微模块
				//?????????ConfigUrl?#/mdcalarm????????
				updateFirstConfigureMold("mdc","#/mdcalarm",null);
			}else{
				if(loginPage.equalsIgnoreCase("room")){
					//小机房
					//?????????ConfigUrl?null??????????????ConfigUrl?#/adevice/1004/adiagram????EquipmentId?IO??ID
					updateFirstConfigureMold("room",null,"#/adevice/1004/adiagram");
				}else if(loginPage.equalsIgnoreCase("iview")){
					//iView
					//?????????ConfigUrl?null??????????????ConfigUrl?#/adevice/8890/adiagram????EquipmentId?null
					updateFirstConfigureMold("iview",null,"#/adevice/8890/adiagram");
				}
			}
		}else{
			String ver = "room";
			if(loginPage.equalsIgnoreCase("2d") || loginPage.equalsIgnoreCase("3d"))
				ver = "mdc";
			else if(loginPage.equalsIgnoreCase("iview"))
				ver = "iview";

			if(loginHome.indexOf("adevice") != -1 || loginHome.indexOf("device") != -1 || loginHome.indexOf("structure") != -1){
				updateFirstConfigureMold(ver,null,loginHome);
			}else{
				updateFirstConfigureMold(ver,loginHome,null);
			}
		}
	}

	private void updateFirstConfigureMold(String type,String parentConfigUrl,String subsetConfigUrl){
		DatabaseHelper dbHelper = null;
		try{
			dbHelper = new DatabaseHelper();
			String part1 = (parentConfigUrl == null)?"NULL":String.format("'%s'",parentConfigUrl);
			String part2 = (subsetConfigUrl == null)?"NULL":String.format("'%s'",subsetConfigUrl);
			String sql = String.format("CALL PRO_UpdateConfigureMoldHome('%s',%s,%s);",type,part1,part2);
			dbHelper.executeNoQuery(sql);
			System.out.println("SQL:"+sql);
		}catch (Exception e){
			log.error("UpdateFirstConfigureMold Exception()", e);
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
	}


	public ArrayList<ConfigureMold> GetAllConfigureMold() {
		DatabaseHelper dbHelper = null;
		ArrayList<ConfigureMold> list = new ArrayList<ConfigureMold>();
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = "SELECT A.*,C.EquipmentBaseType FROM TBL_ConfigureMold A \n" +
					"LEFT JOIN TBL_Equipment B ON A.EquipmentId = B.EquipmentId \n" +
					"LEFT JOIN TBL_EquipmentTemplate C ON B.EquipmentTemplateId = C.EquipmentTemplateId\n" +
					"WHERE A.ParentId IS NOT NULL;";
            DataTable dt = dbHelper.executeToTable(sql);	
            ArrayList<ConfigureMold> parts = ConfigureMold.fromDataTable(dt);
            
            sql = "SELECT * FROM TBL_ConfigureMold WHERE (ParentId IS NULL OR ParentId = '') ORDER BY DisplayIndex;";
            dt = dbHelper.executeToTable(sql);	
            list = ConfigureMold.fromParentDataTable(dt, parts);
		} catch (Exception e) {
			log.error("GetAllAlarmLinkage Exception()", e);
			return list;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return list;
	}
	
	public ArrayList<ConfigureMold> GetShowConfigureMold(){
		DatabaseHelper dbHelper = null;
		ArrayList<ConfigureMold> list = new ArrayList<ConfigureMold>();
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = "SELECT * FROM TBL_ConfigureMold WHERE ParentId IS NOT NULL AND Visible = 1;";
            DataTable dt = dbHelper.executeToTable(sql);	
            ArrayList<ConfigureMold> parts = ConfigureMold.fromDataTable(dt);
            
            sql = "SELECT * FROM TBL_ConfigureMold WHERE (ParentId IS NULL OR ParentId = '') AND Visible = 1 GROUP BY DisplayIndex;";
            dt = dbHelper.executeToTable(sql);	
            list = ConfigureMold.fromParentDataTable(dt, parts);
		} catch (Exception e) {
			log.error("GetAllAlarmLinkage Exception()", e);
			return list;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return list;
	}

	public boolean UpdateConfigureMold(ConfigureMold cm){
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("UPDATE TBL_ConfigureMold SET ConfigName = '%s',FontChart = '%s',ConfigUrl = '%s',EquipmentId = %s,DisplayIndex = %s,"
            		+ "DisplayType = %s,ParentId = %s,Visible = %s,Description = '%s' WHERE ConfigId = %s;",
            		cm.configName,cm.fontChart,cm.configUrl,cm.equipmentId.equals("")?"NULL":cm.equipmentId,
            			cm.displayIndex,cm.displayType?1:0,cm.parentId.equals("")?"NULL":cm.parentId,
            			cm.visible?1:0,cm.description == null ? "" : cm.description,cm.configId);

            dbHelper.executeNoQuery(sql);

            //修改配置文件
			modifyDefaultConfigureMold(cm.parentId,cm.configId,cm.configUrl);
		} catch (Exception e) {
			log.error("UpdateConfigureMold Exception()", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return true;
	}

	public boolean DeleteConfigureMold(String configId) {
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_ConfigureMold WHERE ConfigId = %s;",configId);
            dbHelper.executeNoQuery(sql);
            
            sql = String.format("DELETE FROM TBL_ConfigureMold WHERE ParentId = %s;",configId);
            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("DeleteConfigureMold Exception()", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return true;
	}

	public boolean InsertConfigureMold(int parentId) {
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("CALL PRO_InsertConfigureMold(%s);",parentId);
            dbHelper.executeNoQuery(sql);
            
		} catch (Exception e) {
			log.error("DeleteConfigureMold Exception()", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return true;
	}

	public boolean SortConfigureMold(String direction, int configId) {
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = "UPDATE TBL_ConfigureMold SET DisplayIndex = %s WHERE ConfigId = %s;";
            CallableStatement stat = dbHelper.prepareProcedure("PRO_SortConfigureMold", "?");
        	stat.setInt(1, configId);
            DataTable dt = dbHelper.executeQuery(stat);
            
            ArrayList<ConfigureMold> cms = ConfigureMold.fromDataTable(dt);
            for(int i = 0; i < cms.size();i ++){
            	if(cms.get(i).configId == configId){
            		int index1 = -1,index2 = -1;
            		int configId1 = -1,configId2 = -1;
            		if(direction.equals("up")){
            			if(cms.get(i).displayIndex <= 1) break;
            			index1 = cms.get(i).displayIndex - 1;
            			configId1 = cms.get(i).configId;
            			
            			index2 = cms.get(i-1).displayIndex + 1;
            			configId2 = cms.get(i-1).configId;
            		}else{
            			if(cms.get(i).displayIndex >= cms.size()) break;
            			index1 = cms.get(i).displayIndex + 1;
            			configId1 = cms.get(i).configId;
            			
            			index2 = cms.get(i+1).displayIndex - 1;
            			configId2 = cms.get(i+1).configId;
            		}
        			dbHelper.executeNoQuery(String.format(sql, index1,configId1));
        			dbHelper.executeNoQuery(String.format(sql, index2,configId2));
            	}
            }
            
		} catch (Exception e) {
			log.error("DeleteConfigureMold Exception()", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return true;
	}

	public boolean VisibleConfigureMold(int configId, int visible) {
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("UPDATE TBL_ConfigureMold SET Visible = %s WHERE ConfigId = %s;",
            		visible,configId);

            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("DeleteConfigureMold Exception()", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return true;
	}
	
	public boolean initConfigureMold(int equipmentId,String equipmentName,int equimentTemplateId){
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("CALL PRO_InitConfigureMold(%s,'%s',%s);",equipmentId,equipmentName,equimentTemplateId);
            dbHelper.executeNoQuery(sql);
            
		} catch (Exception e) {
			log.error("InitConfigureMold Exception()", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return true;
	}
	
	public boolean DeleteConfigureMoldByEquipmentId(int equipmentId) {
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            //String sql = String.format("DELETE FROM TBL_ConfigureMold WHERE EquipmentId = %s;",equipmentId);
			String sql = String.format("CALL PRO_DelConfigureMold(%s);",equipmentId);

            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("DeleteConfigureMoldByEquipmentId Exception()", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return true;
	}
	
	
	public ArrayList<ConfigureMold> GetPartEquipments(String parentId){
		DatabaseHelper dbHelper = null;
		ArrayList<ConfigureMold> list = new ArrayList<ConfigureMold>();
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuffer sb = new StringBuffer();
            sb.append("SELECT A.EquipmentName,A.EquipmentId,B.Visible FROM TBL_Equipment A ");
            sb.append("LEFT JOIN TBL_ConfigureMold B ON A.EquipmentId = B.EquipmentId ");
            if(!parentId.equals("undefined") && !parentId.equals(""))
            	sb.append(String.format("WHERE ParentId = %s;", parentId));
            
            DataTable dt = dbHelper.executeToTable(sb.toString());	
            list = ConfigureMold.fromPartDataTable(dt);
		} catch (Exception e) {
			log.error("GetPartEquipments Exception()", e);
			return list;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return list;
	}

	/** 修改默认的首页链接 */
	private void modifyDefaultConfigureMold(String parentId,int configId,String configUrl){
		//获取首页链接对象的父节点与子节点
		HashMap<String, ConfigureMold> moldMaps = getFirstConfigureMold();
		ConfigureMold parent = moldMaps.get("Parent");
		ConfigureMold child = moldMaps.get("Child");

		if(parentId == null || parentId.equals("")){//没有父节点编号
			if(configId == parent.configId && child == null) {//首页为父节点的链接
				MainConfigHelper.editLabelContent("loginHome", configUrl);
				System.out.println("1 ConfigId:"+configId+", ParentId:"+parentId+", ConfigUrl:"+configUrl+", loginHome => "+configUrl);//-------------------
			}
		}else{
			if(configId == child.configId){//首页为子节点的链接
				MainConfigHelper.editLabelContent("loginHome", configUrl);
				System.out.println("2 ConfigId:"+configId+", ParentId:"+parentId+", ConfigUrl:"+configUrl+", loginHome => "+configUrl);//-------------------
			}
		}
		MainConfigHelper.loadConfigs();
	}

	//return <"Parent",ConfigId> & <"Child",ConfigId>
	private HashMap<String,ConfigureMold> getFirstConfigureMold(){
		DatabaseHelper dbHelper = null;
		HashMap<String,ConfigureMold> map = new HashMap<String,ConfigureMold>();
		try{
			dbHelper = new DatabaseHelper();
			String sql = "SELECT ConfigId,ConfigUrl FROM TBL_ConfigureMold WHERE ParentId IS NULL ORDER BY DisplayIndex,ConfigId LIMIT 1;";
			DataTable dt = dbHelper.executeToTable(sql);
			if(dt.getRows().size() > 0){
				String configId = dt.getRows().get(0).getValueAsString("ConfigId");
				String configUrl = dt.getRows().get(0).getValueAsString("ConfigUrl");
				ConfigureMold mold = new ConfigureMold();
				mold.configId = Integer.parseInt(configId);
				mold.configUrl = configUrl;
				map.put("Parent",mold);

				sql = String.format("SELECT ConfigId,ConfigUrl FROM TBL_ConfigureMold WHERE ParentId = %s AND Visible = 1 ORDER BY DisplayIndex LIMIT 1;",configId);
				dt = dbHelper.executeToTable(sql);
				if(dt.getRows().size() > 0){
					configId = dt.getRows().get(0).getValueAsString("ConfigId");
					configUrl = dt.getRows().get(0).getValueAsString("ConfigUrl");

					if(configId != null){
						mold = new ConfigureMold();
						mold.configId = Integer.parseInt(configId);
						mold.configUrl = configUrl;
						map.put("Child",mold);
					}
				}
			}
		}catch (Exception ex){
			log.error("getFirstConfigureMold Exception:",ex);
		}finally {
			if(dbHelper != null)dbHelper.close();
		}
		return map;
	}

	//region 导出组态包
	/**
	 * 导出所有设备的组态包
	 * @return configure.zip
	 */
	public String exportAllConfiguration(){
        //获取设备组态集合
        ArrayList<ConfigureMold> valids = getAllValidConfiguration();

        return packExport(valids);
	}
    /**
     * 导出当前编号的组态包
     * @param configId
     * @return configure.zip
     */
	public String exportCurrentConfiguration(String configId){
        //获取设备组态集合
        ArrayList<ConfigureMold> valids = getCurrentValidConfiguration(configId);

        return packExport(valids);
    }
    //封装导出
    private String packExport(ArrayList<ConfigureMold> valids){
        try {
            //初始化deviceList设备编号与设备名称集合
            getDeviceList();

            valids = parseConfigurations(valids);
            if(valids.size() == 0) return "NoValidData";
            //upload目录创建所需的目录，存在则删除再创建
            mkdirDirectory(valids);
            //复制非组态.html文件
            copyHtmlInstance(valids);
            //获取json对象
            HashMap<String,JSONObject> map = getAllDiagramInstance(valids);
            //分析json对象内容，并创建新的json文件
            HashMap<String, HashMap<Integer, String>> otherDevice = parseJsonConfigure(map);
            //创建config.cfg配置文件
            mkdirConfigFile(valids,otherDevice);
            //复制JSON文件
            copyJsonInstance(valids);
            //打包
            //ZipUtils.toZip(configurePath,configurePath+".zip");
			ZipUtils.toZip4j(configurePath+".zip",configurePath);
            System.out.println("结束！");

            return "configure.zip";
        }catch (Exception ex){
            log.error("ExportAllConfiguration Exception:",ex);
            return "Error";
        }
    }

	//获取所有有效的组态
	private ArrayList<ConfigureMold> getAllValidConfiguration(){
		DatabaseHelper dbHelper = null;
		ArrayList<ConfigureMold> list = new ArrayList<ConfigureMold>();
		try
		{
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("SELECT * FROM TBL_ConfigureMold ");
			sb.append("WHERE Visible = 1 AND ParentId IS NOT NULL AND ConfigUrl IS NOT NULL;");

			DataTable dt = dbHelper.executeToTable(sb.toString());
			list = ConfigureMold.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetAllValidConfiguration Exception()", e);
			return list;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return list;
	}
	//根据组态编号组态
    private ArrayList<ConfigureMold> getCurrentValidConfiguration(String configId){
        DatabaseHelper dbHelper = null;
        ArrayList<ConfigureMold> list = new ArrayList<ConfigureMold>();
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuffer sb = new StringBuffer();
            sb.append(String.format("SELECT * FROM TBL_ConfigureMold WHERE ConfigId = %s;",configId));

            DataTable dt = dbHelper.executeToTable(sb.toString());
            list = ConfigureMold.fromDataTable(dt);
        } catch (Exception e) {
            log.error("GetAllValidConfiguration Exception()", e);
            return list;
        } finally {
            if(dbHelper != null) dbHelper.close();
        }
        return list;
    }
	//解析将ConfigUrl中的数值赋值到Description
	private ArrayList<ConfigureMold> parseConfigurations(ArrayList<ConfigureMold> list){
		ArrayList<ConfigureMold> results = new ArrayList<ConfigureMold>();
		for (ConfigureMold cfg : list){
			String regEx="[^0-9]";
			Pattern p = Pattern.compile(regEx);
			Matcher m = p.matcher(cfg.configUrl);
			cfg.description = m.replaceAll("").trim();
			//表格组态
			if(cfg.configUrl.indexOf(".table") > -1)
				cfg.description = String.format("%s.table",cfg.description);

			if(cfg.description.length() == 0) continue;

			/*
			boolean is1 = getDiagramInstance(cfg.description);
			boolean is2 = getDiagramInstance(cfg.equipmentId);
			System.out.println("ConfigName:"+cfg.configName+",ConfigUrl:"+cfg.configUrl+
					",EquipmentId:"+cfg.equipmentId+",Description:"+cfg.description+
					","+cfg.description+".json is:"+is1+","+cfg.equipmentId+".json is:"+is2);
			*/

			results.add(cfg);
		}
		return results;
	}

	//创建config.cfg配置文件
    private void mkdirConfigFile(ArrayList<ConfigureMold> list,HashMap<String,HashMap<Integer, String>> configOtherDevice){
	    try {
            String cfgFile = configurePath+"/config.json";
            File file = new File(cfgFile);
            //删除已存在的配置文件
            if(file.exists()) file.delete();
            //编辑配置内容
            String content = editConfigContent(list,configOtherDevice);
            //密码
            //content = Base64Helper.encode(content);
            //写入配置内容
            file.createNewFile();
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file), "UTF-8"));
            writer.write(content);
            writer.close();
            System.out.println("配置文件写入成功！");
        }catch (Exception e){
	        log.error("mkdirConfigFile Exception:",e);
        }
    }
    //return [{"ParentId":"","DeviceId":"","BaseTypeId":"","Url":"","DeviceName":""},...]
    private String editConfigContent(ArrayList<ConfigureMold> list,HashMap<String,HashMap<Integer, String>> configOtherDevice){
        try {
            JSONArray arr = new JSONArray();

            for(ConfigureMold cfg : list){
                JSONObject obj = new JSONObject();
                try {
                    obj.put("DeviceId",cfg.equipmentId);
                    obj.put("DeviceName",getDeviceNameById(Integer.parseInt(cfg.equipmentId)));
                }catch (Exception ex){
                    obj.put("DeviceId",cfg.description);//设备编号为null时，赋值为基类编号
                    obj.put("DeviceName",cfg.configName);//设备编号为null时，赋值为组态名称
                }
                obj.put("ParentId",cfg.parentId);
                obj.put("Url",cfg.configUrl);
                obj.put("BaseTypeId",cfg.description);

                JSONArray otherArr = new JSONArray();
                if(configOtherDevice.containsKey(cfg.equipmentId)){
                    HashMap<Integer, String> otherDevice = configOtherDevice.get(cfg.equipmentId);
                    for(Integer id : otherDevice.keySet()){
                        String name = otherDevice.get(id);
                        JSONObject other = new JSONObject();
                        other.put("DeviceId",id);
                        other.put("DeviceName",name);
                        otherArr.put(other);
                    }
                }
                obj.put("OtherDevice",otherArr);

                arr.put(obj);
            }

            return arr.toString();
        }catch (Exception e){
            log.error("editConfigContent Exception:",e);
            return "";
        }
    }

    //复制非组态文件
    private void copyHtmlInstance(ArrayList<ConfigureMold> list){
        try {
            for (ConfigureMold cfg : list){
				String fileName = "";
				if(isHtmlInstance(cfg.equipmentId))
					fileName = cfg.equipmentId;
				else if(isHtmlInstance(cfg.description))
					fileName = cfg.description;

                if(fileName.length() > 0){
                    String srcPath = BasePath.getWebPath()+"partials/templates";
                    ArrayList<String> names = new ArrayList<String>();
                    names.add(fileName+".html");
                    String aimPath = configurePath+"/"+fileName.replaceAll(".table","");
                    copyFiles(srcPath,names,aimPath);
                }
            }
        }catch (Exception e){
            log.error("copyHtmlInstance Exception:",e);
        }
    }
    //判断FileName.html是否存在partials/templates目录
    private boolean isHtmlInstance(String fileName){
        String filePath = BasePath.getWebPath()+"partials/templates/"+fileName+".html";
        File f = new File(filePath);
        return f.exists();
    }

	//创建文件夹
	private void mkdirDirectory(ArrayList<ConfigureMold> list){
		try{
			//web/upload/configure
			String dirPath = configurePath;//BasePath.getWebPath()+"upload/configure";
			File dir = new File(dirPath);
			if(dir.exists())
				ZipUtils.delFolder(dirPath);//删除原文件夹
			dir.mkdirs();
			//remove configure.zip
			dirPath = configurePath+".zip";
			dir = new File(dirPath);
			if(dir.exists()) dir.delete();
			//web/upload/configure/[DeviceId]...
			for (ConfigureMold cfg : list){
				dirPath = "";
				if(cfg.equipmentId == null || cfg.equipmentId.length() < 3)
					dirPath = String.format("%supload/configure/%s",BasePath.getWebPath(),cfg.description);
				else
					dirPath = String.format("%supload/configure/%s",BasePath.getWebPath(),cfg.equipmentId);
				if(dirPath.equals("")) continue;
				dir = new File(dirPath);
				dir.mkdirs();

				//web/upload/configure/[DeviceId]/images
                dirPath = String.format("%s/images",dirPath);
                dir = new File(dirPath);
                dir.mkdirs();
			}
		}catch (Exception e){
			log.error("mkdirDirectory Exception:",e);
		}
	}
	//遍历所有组态实例
	private HashMap<String,JSONObject> getAllDiagramInstance(ArrayList<ConfigureMold> list){
        HashMap<String,JSONObject> map = new HashMap<String,JSONObject>();
		try {
			for (ConfigureMold cfg : list){
				String fileName = "";
                if(isExistsInstance(cfg.equipmentId))
                    fileName = cfg.equipmentId;
                else if(isExistsInstance(cfg.description))
					fileName = cfg.description;

				
				if(!fileName.equals("")){
					String ins = DiagramProvider.getInstance().getDiagramInstance(fileName);
					ins = Base64Helper.decode(ins.substring(0,ins.indexOf(":")));
					JSONObject obj = new JSONObject(ins);
					//获取json对象
					map.put(fileName,obj);
					//解析使用到的图片
					JSONArray parts = obj.getJSONArray("parts");
					for(int i = 0;i < parts.length(); i++){
					    JSONObject p = parts.getJSONObject(i);
					    String options = p.getString("options");
					    if(options.indexOf("upload/") > -1){
                            //获取图片集合，与复制图片
                            ArrayList<String> images = getImageName(options);
                            String srcPath = BasePath.getWebPath()+"upload";
                            String aimPath = configurePath+"/"+fileName.replaceAll(".table","")+"/images";
                            copyFiles(srcPath,images,aimPath);
                        }
                    }
				}
			}
		}catch (Exception e){
			log.error("getAllDiagramInstance Exception:",e);
		}
		return map;
	}
	//判断FileName.json是否存在instance目录
	private boolean isExistsInstance(String fileName){
		String filePath = BasePath.getDirByEnv("diagrams/instances/" + fileName + ".json");
		File f = new File(filePath);
		return f.exists();
	}
	//获取字符串中的图片名称集合
    private ArrayList<String> getImageName(String options){
        ArrayList<String> images = new ArrayList<String>();
	    try {
            while (true){
                //开始符号
                int start = options.indexOf("upload/");
                //没有upload关键字跳出循环
                if(start == -1 || (start + 7) >= options.length()) break;
                options = options.substring(start+7);
                //结束符号
                int end = options.indexOf("|");
                if(end == -1){
                    //截取upload/到最后的内容
                    images.add(options);
                }else{
                    //截取upload/到|的内容
                    String fileName = options.substring(0,end);
                    images.add(fileName);
                }
            }
        }catch (Exception e){
	        log.error("getImageName Exception:",e);
        }
	    return images;
    }
    //将srcPath目录的lists文件名的文件复制到aimPath目录
    public void copyFiles(String srcPath,ArrayList<String> lists,String aimPath){
        DataInputStream dis = null;
        DataOutputStream dos = null;
        try{

            File dirFile = new File(srcPath);
            if(!dirFile.exists()){
                log.error(srcPath+" Not Exists!");
                return;
            }
            for (File f : dirFile.listFiles()){
                if(matching(f.getName(),lists)){
                    File oldFile = new File(srcPath+"/"+f.getName()); //需要复制的文件
                    File newFile = new File(aimPath+"/"+f.getName());//复制后的文件

                    //创建流对象
                    dis = new DataInputStream(new FileInputStream(oldFile));
                    dos = new DataOutputStream(new FileOutputStream(newFile));

                    int temp;
                    //读写数据
                    while((temp=dis.read())!=-1){//读数据
                        dos.write(temp);//把读到的数据写入到Temp文件中
                    }
                }
            }
            System.out.println("将文件从"+srcPath+"复制到"+aimPath+"完成！");
        }catch ( Exception ex){
            log.error("copyFiles Exception 1:",ex);
        }finally {
            try {
                if(dis != null) dis.close();
                if(dos != null) dos.close();
            }catch (Exception ex){
                log.error("copyFiles Exception 2:",ex);
            }
        }
    }
	//将srcPath目录的所有文件复制到aimPath目录
	private void copyFiles(String srcPath,String aimPath){
		DataInputStream dis = null;
		DataOutputStream dos = null;
		try{

			File dirFile = new File(srcPath);
			for (File f : dirFile.listFiles()){
				File oldFile = new File(srcPath+"/"+f.getName()); //需要复制的文件
				File newFile = new File(aimPath+"/"+f.getName());//复制后的文件

				//创建流对象
				dis = new DataInputStream(new FileInputStream(oldFile));
				dos = new DataOutputStream(new FileOutputStream(newFile));

				int temp;
				//读写数据
				while((temp=dis.read())!=-1){//读数据
					dos.write(temp);//把读到的数据写入到Temp文件中
				}
			}
			System.out.println("将文件从"+srcPath+"复制到"+aimPath+"完成！");
		}catch ( Exception ex){
			log.error("copyFiles Exception 1:",ex);
		}finally {
			try {
				if(dis != null) dis.close();
				if(dos != null) dos.close();
			}catch (Exception ex){
				log.error("copyFiles Exception 2:",ex);
			}
		}
	}
	//复制文件，srcFile源文件名，aimFile新文件名
	private void copyFile(String srcFile,String aimFile){
		DataInputStream dis = null;
		DataOutputStream dos = null;
		try{
			File oldFile = new File(srcFile); //需要复制的文件
			if(!oldFile.exists()) {
				log.error("File:"+srcFile+", Not Exists!");
				return;
			}
			File newFile = new File(aimFile);//复制后的文件

			//创建流对象
			dis = new DataInputStream(new FileInputStream(oldFile));
			dos = new DataOutputStream(new FileOutputStream(newFile));

			int temp;
			//读写数据
			while((temp=dis.read())!=-1){//读数据
				dos.write(temp);//把读到的数据写入到Temp文件中
			}
			System.out.println("将文件从"+srcFile+"复制到"+aimFile+"完成！");
		}catch ( Exception ex){
			log.error("copyFile Exception 1:",ex);
		}finally {
			try {
				if(dis != null) dis.close();
				if(dos != null) dos.close();
			}catch (Exception ex){
				log.error("copyFile Exception 2:",ex);
			}
		}
	}

    //匹配集合中是否存在key
    private boolean matching(String key,ArrayList<String> list){
	    for (String name : list){
	        if(key.equals(name))
	            return true;
        }
	    return false;
    }

    //解析JSON文件并返回关联的其他设备集合
    private HashMap<String,HashMap<Integer, String>> parseJsonConfigure(HashMap<String,JSONObject> map){
        HashMap<String,HashMap<Integer, String>> configOtherDevice = new HashMap<String,HashMap<Integer, String>>();
        try {
            for (String key : map.keySet()){
                JSONObject obj = map.get(key);

                HashMap<Integer, String> otherDevice = getOtherDevice(key, obj);
                configOtherDevice.put(key,otherDevice);
            }
        }catch (Exception e){
            log.error("parseMkdirConfigure Exception:",e);
        }
        return configOtherDevice;
    }
    //获取JSON中除了curId的其他设备编号与设备名称集合
    private HashMap<Integer,String> getOtherDevice(String curId,JSONObject obj){
        HashMap<Integer,String> map = new HashMap<Integer,String>();
	    try {
            ArrayList<Integer> list = new ArrayList<Integer>();
            JSONArray parts = obj.getJSONArray("parts");
            for(int i = 0;i < parts.length();i++){
                JSONObject o = parts.getJSONObject(i);
                String type = o.getString("type");
                if(type.equals("devicestatuspart")){
                    list = getFieldDeviceId(type, o.getString("binding"));
                }else{
                    if(!o.isNull("binding")) {
                        ArrayList<Integer> binding = getFieldDeviceId("", o.getString("binding"));
                        if(binding != null && binding.size() > 0) list.addAll(binding);
                    }
                    if(!o.isNull("options")) {
                        ArrayList<Integer> options = getFieldDeviceId("", o.getString("options"));
                        if(options != null && options.size() > 0) list.addAll(options);
                    }
                }
            }
            for (Integer id : list){
                if(Integer.parseInt(curId) != id)
                    map.put(id,getDeviceNameById(id));
            }
        }catch (Exception e){
	        log.error("getOtherDevice Exception:",e);
        }
	    return map;
    }
    //字段中获取设备编号集合
    private ArrayList<Integer> getFieldDeviceId(String type,String field){
        ArrayList<Integer> list = new ArrayList<Integer>();
        //设备状态组态，设备编号存储在binding中|分割
        if(type.equals("devicestatuspart")){
            String[] split = field.split("\\|");
            for (String id : split){
                if (id.length() > 0)
                    list.add(Integer.parseInt(id));
            }
        }
        //其他组态，存储关键字为DI:或者DeviceId:
        String startChart = "";
        int length = 0;
        if(field.indexOf("DI") > -1) {
            startChart = "DI:";
            length = 3;
        }
        if(field.indexOf("DeviceId") > -1) {
            startChart = "DeviceId:";
            length = 9;
        }
        if(startChart.length() == 0) return list;

        while (true){
            //开始符号
            int start = field.indexOf(startChart);
            if(start == -1 || (start + length) >= field.length()) break;
            field = field.substring(start+length);
            //结束符号
            int end = field.indexOf("|");
            if(end == -1){
                try {
                    list.add(Integer.parseInt(field));
                }catch (Exception e){
                    continue;
                }
            }else{
                try {
                    String id = field.substring(0,end);
                    list.add(Integer.parseInt(id));
                }catch (Exception e){
                    continue;
                }
            }
        }
        return list;
    }

    //复制json文件
    private void copyJsonInstance(ArrayList<ConfigureMold> list){
        try {
            for (ConfigureMold cfg : list){
            	String jsonName = "";
            	if(isExistsInstance(cfg.equipmentId))
					jsonName = cfg.equipmentId;
				else if(isExistsInstance(cfg.description))
					jsonName = cfg.description;

                if(jsonName.length() > 0){
                    String srcPath = BasePath.getDirByEnv("diagrams/instances");
                    ArrayList<String> names = new ArrayList<String>();
                    names.add(jsonName+".json");
                    String aimPath = configurePath+"/"+jsonName.replaceAll(".table","");
                    copyFiles(srcPath,names,aimPath);
                }
            }
        }catch (Exception e){
            log.error("copyJsonInstance Exception:",e);
        }
    }

    //获取数据库的设备编号与设备名称集合
    private void getDeviceList(){
        DatabaseHelper dbHelper = null;
        deviceList = new HashMap<Integer, String>();
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "SELECT * FROM TBL_Equipment;";

            DataTable dt = dbHelper.executeToTable(sql);
            DataRowCollection drs = dt.getRows();
            int rowCount = dt.getRowCount();

            for(int i=0;i<rowCount;i++){
                int equipmentId = (int) drs.get(i).getValue("EquipmentId");
                String equipmentName = (String) drs.get(i).getValue("EquipmentName");
                deviceList.put(equipmentId,equipmentName);
            }
        } catch (Exception e) {
            log.error("getDeviceList Exception()", e);
        } finally {
            if(dbHelper != null) dbHelper.close();
        }
    }
    private String getDeviceNameById(int id){
	    try {
            return deviceList.get(id);
        }catch (Exception e){
	        return null;
        }
    }
    //endregion

	//region 导入组态包
	//获取JSON文件返回JSON对象
	public JSONArray getConfigurationJson(){
		try {
			String path = BasePath.getWebPath()+"/upload/configure/config.json";
			String jsonStr = LanguageDataHandler.readJsonData(path);

			JSONArray arr = new JSONArray(jsonStr);
			return arr;
		}catch (Exception e){
			log.error("getConfigurationJson Exception:",e);
			return null;
		}
	}

	/**
	 * 解析字符串为JSON对象
	 * @param decode
	 * @return [{
	 *     OldDeviceId:"",
	 *     OldBaseTypeId:"",
	 *     NewDeviceId:"",
	 *     NewDeviceName:"",
	 *     NewParentId:"",
	 *     NewBaseTypeId:"",
	 *     NewUrl:"",
	 *     OtherDevice:[{
	 *         OldDeviceId:"",
	 *         NewDeviceId:""
	 *     }]
	 * }]
	 */
	public JSONArray parseImportConfiguration(String decode){
		//OldDeviceId|OldBaseTypeId#NewDeviceId|NewDeviceName|NewParentId|NewBaseTypeId|NewUrl|OldOtherDeviceId1>NewOtherDeviceId1.OldOtherDeviceId2>NewOtherDeviceId2&
		JSONArray configures = new JSONArray();
		try {
			/** 测试 ************************************************************/
			System.out.println("加密参数："+decode);
			/**************************************************************/
			String[] cfgsArr = decode.split("\\&");
			for (String cfg : cfgsArr){
				if(cfg.length() == 0) continue;
				String[] cfgArr = cfg.split("\\#");
				String[] oldDev = Base64Helper.decode(cfgArr[0]).split("\\|");
				String[] newDev = Base64Helper.decode(cfgArr[1]).split("\\|");
				/** 测试 ************************************************************/
				System.out.println("解密参数："+Base64Helper.decode(cfgArr[0])+"#"+Base64Helper.decode(cfgArr[1]));
				/**************************************************************/

				JSONObject configure = new JSONObject();
				configure.put("OldDeviceId",oldDev[0]);
				configure.put("OldBaseTypeId",oldDev[1]);
				configure.put("NewDeviceId",newDev[0]);
				configure.put("NewDeviceName",newDev[1]);
				configure.put("NewParentId",newDev[2]);
				configure.put("NewBaseTypeId",newDev[3]);
				configure.put("NewUrl",newDev[4]);

				if(newDev.length > 5 && !newDev[5].equals("")){
					String[] others = newDev[5].split("\\.");
					JSONArray otherArr = new JSONArray();
					for (String o : others){
						if(o.length() == 0) continue;
						JSONObject otherObj = new JSONObject();
						String[] d = o.split("\\>");
						if(d.length > 0){
							otherObj.put("OldDeviceId",d[0]);
							if(d.length > 1)
								otherObj.put("NewDeviceId",d[1]);
							else
								otherObj.put("NewDeviceId","");
							otherArr.put(otherObj);
						}
					}
					configure.put("OtherDevice",otherArr);
				}
				configures.put(configure);
			}
			/** 测试 ************************************************************/
			System.out.println("参数的JSON："+configures.toString());
			/**************************************************************/
		}catch (Exception e){
			log.error("parseImportConfiguration Exception:",e);
		}
		return configures;
	}

	//上传所有组态包
	public String importAllConfiguration(JSONArray newArr){
		try {
			for(int i = 0; i < newArr.length(); i++){
				JSONObject cfg = newArr.getJSONObject(i);
				String drigDeviceId = cfg.getString("OldDeviceId");
				String dowDeviceId = cfg.getString("NewDeviceId");
				//1、复制文件，如：图片
				String srcImgPath = configurePath+"/"+drigDeviceId+"/images";
				String aimImgPath = BasePath.getWebPath()+"upload";
				copyFiles(srcImgPath,aimImgPath);
				//2、修改.html文件名称为设备名称
				//2.1、再复制.html文件
				String srcHtmlFile = configurePath+"/"+drigDeviceId+"/"+drigDeviceId+".html";
				String aimHtmlFile = BasePath.getWebPath()+"partials/templates/"+dowDeviceId+".html";
				copyFile(srcHtmlFile,aimHtmlFile);
				//3、修改.json文件内容中的编号
				//3.1、再复制.json文件
				String srcJsonFile = configurePath+"/"+drigDeviceId+"/"+drigDeviceId+".json";
				String aimJsonFile = BasePath.getDirByEnv("diagrams/instances/" + dowDeviceId + ".json");
				parseCopyJsonFile(srcJsonFile,aimJsonFile,cfg);
			}
			return "OK";
		}catch (Exception e){
			log.error("importAllConfiguration Exception:",e);
			return "Error";
		}
	}
	//解析并复制文件，src源文件，aim新文件，cfg配置
	private void parseCopyJsonFile(String srcFile,String aimFile,JSONObject cfg){
		try {
			//1、读取并解码srcFile文件
			String ins = getFile(srcFile);
			if(ins == null) return;
			ins = Base64Helper.decode(ins.substring(0,ins.indexOf(":")));
			JSONObject srcObj = new JSONObject(ins);
			System.out.println("读取JSON:"+srcObj.toString());
			//2.1、内容中的deviceId=>[NewDeviceId]、parentId=>[NewParentId]、deviceBaseTypeId=>[NewBaseTypeId]
			String deviceId = cfg.getString("NewDeviceId");
			String parentId = cfg.getString("NewParentId");
			String baseTypeId = cfg.getString("NewBaseTypeId");
			//2.2、内容中的parts.binding或者parts.options中的[OtherDevice[n].OldDeviceId]=>[OtherDevice[n].NewDeviceId]
			HashMap<String,String> replaces = getConfigureReplace(cfg);
			String aimObj = createNowConfigure(srcObj,deviceId,parentId,baseTypeId,replaces);
			System.out.println("新的JSON:"+aimObj);
			//3、存储为aimFile文件
			aimObj = Base64Helper.encode(aimObj);
			DiagramProvider.getInstance().saveInstanceFile(deviceId+ ".json",aimObj);
			System.out.println("写入成功！");
		}catch (Exception ex){
			log.error("parseCopyJsonFile Exception:",ex);
		}
	}
	//获取文件内容
	public String getFile(String file){
		File f = new File(file);

		if (!f.exists()){
			log.error("File:"+file+", Not Exists!");
			return null;
		}
		String fileContent = "";

		try {
			FileInputStream fis = new FileInputStream(f);
			InputStreamReader isr = new InputStreamReader(fis, "UTF-8");
			BufferedReader br = new BufferedReader(isr);

			String line = null;
			while ((line = br.readLine()) != null) {
				fileContent += line;
				fileContent += "\r\n";
			}

			br.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return fileContent;
	}
	//获取组态的替换字符集合 Key值被Value替换
	private HashMap<String,String> getConfigureReplace(JSONObject cfg){
		HashMap<String,String> replace = new HashMap<String,String>();
		try {
			//当前设备
			replace.put(cfg.getString("OldDeviceId"),cfg.getString("NewDeviceId"));
			//其他设备
			if(!cfg.isNull("OtherDevice")){
				JSONArray other = cfg.getJSONArray("OtherDevice");
				for(int i = 0;i < other.length(); i++){
					JSONObject obj = other.getJSONObject(i);
					replace.put(obj.getString("OldDeviceId"),obj.getString("NewDeviceId"));
				}
			}
		}catch (Exception e){
			log.error("getConfigureReplace Exception:",e);
		}
		return replace;
	}
	//生成新的组态json内容
	private String createNowConfigure(JSONObject srcObj,String deviceId,String parentId,String baseTypeId,HashMap<String,String> replace){
		String result = "";
		try {
			srcObj.put("deviceId",deviceId);
			srcObj.put("parentId",parentId);
			srcObj.put("deviceBaseTypeId",baseTypeId);
			if(!srcObj.isNull("parts")){
				JSONArray parts = srcObj.getJSONArray("parts");
				for(int i = 0; i < parts.length();i++){
					JSONObject part = parts.getJSONObject(i);
					if(!part.isNull("options")){
						part.put("options",replaceMap(part.getString("options"),replace));
					}
					if(!part.isNull("binding")){
						part.put("binding",replaceMap(part.getString("binding"),replace));
					}
				}
				srcObj.put("parts",parts);
			}

			result = srcObj.toString();
		}catch (Exception e){
			log.error("createNowConfigure Exception:",e);
		}
		return result;
	}
	//替换line中出现的map.key字符为map.value
	private String replaceMap(String line,HashMap<String,String> map){
		try {
			if(map != null){
				for (String key : map.keySet()){
					String value = map.get(key);
					line = line.replaceAll(String.format("DI:%s",key),String.format("DI:%s",value));
					line = line.replaceAll(String.format("DeviceId:%s",key),String.format("DeviceId:%s",value));
				}
			}
		}catch (Exception e){
			log.error("replaceMap Exception:",e);
		}
		return line;
	}
	//endregion

	/*public static void main(String[] args) {
		//ConfigureMoldProvider.getInstance().exportAllConfiguration();
		//ZipUtils.toZip4j(configurePath+".zip",configurePath);
		ZipUtils.unZip4j(configurePath+".zip",configurePath);
	}*/
}
