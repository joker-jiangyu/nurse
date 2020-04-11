package nurse.logic.providers;

import nurse.common.DataTable;
import nurse.entity.persist.*;
import nurse.entity.trasfer.ModuleDevice;
import nurse.utility.BasePath;
import nurse.utility.DatabaseHelper;
import nurse.utility.LicenseHelper;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;


import java.io.*;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class OtherModuleProvider{
    private static OtherModuleProvider instance = new OtherModuleProvider();
    private static Logger log = Logger.getLogger(OtherModuleProvider.class);
    private static ArrayList<OtherModule> otherModules = null;

    private static String os = null;//保存当前系统类型
    static{
        Properties prop = System.getProperties();
        os = prop.getProperty("os.name");
    }

    public OtherModuleProvider() {
    }

    public static OtherModuleProvider getInstance(){
        return instance;
    }

    private void loadOtherModules(){
        DatabaseHelper dbHelper = null;

        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "SELECT * FROM TBL_ModuleConfig;";

            DataTable dt = dbHelper.executeToTable(sql);
            ArrayList<ModuleConfig> mcs = ModuleConfig.fromDataTable(dt);

            sql = "SELECT * FROM TBL_OtherModule;";
            dt = dbHelper.executeToTable(sql);
            otherModules = OtherModule.fromDataTable(dt, mcs);
        } catch (Exception e) {
            log.error("fail to read all OtherModule", e);
        } finally {
            if(dbHelper != null) dbHelper.close();
        }
    }

    public String printModuleConfig(String type){
        loadOtherModules();

        OtherModule otherModule = OtherModule.getObjectByName(otherModules, type);
        if(otherModule == null) return "[{\"content\":\"Not Type\"}]";

        if(type.equals("bInterface_chinamobile")){
            //中国移动
            ArrayList<String> cmb_init = new ArrayList<>();
            cmb_init.add("-----------------  cmb_init_list.ini -----------------------");
            cmb_init.addAll(readFile(getFileUrlByName(otherModule.Configs,"cmb_init_list.ini"),"GBK"));

            return createStringByList(cmb_init,null,"");
        }else if(type.equals("bInterface_chinaunicom")){
            //中国联通
            ArrayList<String> cub_init = new ArrayList<>();
            cub_init.add("-----------------  cub_init_list.ini -----------------------");
            cub_init.addAll(readFile(getFileUrlByName(otherModule.Configs,"cub_init_list.ini"),"GBK"));

            return createStringByList(cub_init,null,"");
        }else if(type.equals("snmp")){
            ArrayList<String> inits = new ArrayList<>();
            inits.add("-----------------  snmpd.cfg -----------------------");
            inits.addAll(readFile(getFileUrlByName(otherModule.Configs,"snmpd.cfg"),"UTF-8"));
            inits.add("-----------------  deviceList.ini -----------------------");
            inits.addAll(readFile(getFileUrlByName(otherModule.Configs,"deviceList.ini"),"UTF-8"));
            return createStringByList(inits,null,"");
        }
        return "[{\"content\":\"\"}]";
    }

    public String ModifyModuleConfig(String type,String[] split){
        log.info("ModifyModuleConfig Type:"+type+", Split Size:"+split.length);
        for(int i = 0;i < split.length;i ++){
            log.info("Split["+i+"]:"+split[i]);
        }

        loadOtherModules();

        OtherModule otherModule = OtherModule.getObjectByName(otherModules, type);
        if(otherModule == null) return "Not Type";

        if(type.equals("snmp")){
            LinkedHashMap<String,String> ipMap = splitMapByChar(split[1].split("\\;"),"\\-");
            ArrayList<ModuleDevice> deviceList = null;
            if(split.length >= 3)
                deviceList = ModuleDevice.splitSnmpDevice(split[2].split("\\;"), "\\-");

            return snmpFactory(otherModule,ipMap,deviceList);
        }else if(type.equals("bInterface_chinamobile")){
            //中国移动
            String[] ips = split[1].split("\\-");
            String ip = ips[0];
            String prot = ips[1];
            String fsuPort = split[2];
            ArrayList<ModuleDevice> deviceList = ModuleDevice.splitBDevice(split[3].split("\\;"), "\\-");
            return bFactory("cmb_init_list.ini",otherModule,ip,prot,fsuPort,deviceList);
        }else if(type.equals("bInterface_chinaunicom")){
            //中国联通
            String[] ips = split[1].split("\\-");
            String ip = ips[0];
            String prot = ips[1];
            String suPort = split[2];
            ArrayList<ModuleDevice> deviceList = ModuleDevice.splitBDevice(split[3].split("\\;"), "\\-");
            return bFactory("cub_init_list.ini",otherModule,ip,prot,suPort,deviceList);
        }
        return "OK";
    }

    private LinkedHashMap<String,String> splitMapByChar(String[] strs,String ch){
        LinkedHashMap<String,String> map = new LinkedHashMap<String,String>();
        for(String str : strs){
            String[] split = str.split(ch);
            //log.info("Split Key:"+split[0]+", Value:"+split[1]);
            map.put(split[0],split[1]);
        }
        return map;
    }


    private String snmpFactory(OtherModule otherModule,LinkedHashMap<String,String> ipMap,ArrayList<ModuleDevice> deviceList){
        log.info("snmpFactory ipMap Size:"+ipMap.size()+", deviceList Size:"+deviceList.size());
        //snmp|192.168.100.100-162;192.168.100.101-162;|956911405-1004;171336263-1006;171346050-1006;171310988-1101;
        String modulePath = BasePath.getWebPath()+"data/module/";
        //log.info("Module Path:"+modulePath);
        //测试目录 Debug
        /*String uploadPath = BasePath.getWebPath()+"upload/";
        File dir = new File(uploadPath);
        if (!dir.exists()  && !dir.isDirectory()) dir.mkdirs();// 创建多级目录*/

        //读取文件
        ArrayList<String> readSnmpd = readFile(modulePath+"snmpd.cfg","UTF-8");
        ArrayList<String> readDevice = readFile(modulePath+"deviceList.ini","UTF-8");

        //编辑内容
        ArrayList<String> newReadSnmpd = generateSnmpdContent(readSnmpd,ipMap);

        ArrayList<String> newReadDevice = null;
        if(deviceList != null)
            newReadDevice = generateDeviceContent(readDevice,deviceList);

        //成功文件，并写入
        boolean b1 = writeFile(getFileUrlByName(otherModule.Configs,"snmpd.cfg"),newReadSnmpd,"UTF-8");
        if(!b1) return "snmpd.cfg Not Exist";

        if(newReadDevice != null){
            boolean b2 = writeFile(getFileUrlByName(otherModule.Configs,"deviceList.ini"),newReadDevice,"UTF-8");
            if(!b2) return "deviceList.ini Not Exist";
        }

        //Debug
        /*boolean b1 = writeFile(uploadPath+"snmpd.cfg",newReadSnmpd);
        if(!b1) return "Path Not Exist";
        boolean b2 = writeFile(uploadPath+"deviceList.ini",newReadDevice);
        if(!b2) return "Path Not Exist";*/

        return "OK";
    }

    private String bFactory(String iniFile,OtherModule otherModule,String ip,String port,String fsPort,ArrayList<ModuleDevice> deviceList){
        String modulePath = BasePath.getWebPath()+"data/module/";
        //log.info("Module Path:"+modulePath);
        //测试目录 Debug
        /*String uploadPath = BasePath.getWebPath()+"upload/";
        File dir = new File(uploadPath);
        if (!dir.exists()  && !dir.isDirectory()) dir.mkdirs();// 创建多级目录*/

        //读取文件
        ArrayList<String> readCmb = readFile(modulePath+iniFile,"GBK");

        //编辑内容
        ArrayList<String> newReadCmb = null;
        if(otherModule.Name.equals("bInterface_chinamobile"))
            newReadCmb = generateBMobileContent(readCmb,ip,port,fsPort,deviceList);
        else
            newReadCmb = generateBUnicomContent(readCmb,ip,port,deviceList);

        //成功文件，并写入
        boolean b = writeFile(getFileUrlByName(otherModule.Configs,iniFile),newReadCmb,"GBK");
        if(!b) return "File Not Exist";

        //Debug
        /*boolean b = writeFile(uploadPath+iniFile,newReadCmb);
        if(!b) return "Path Not Exist";*/

        return "OK";
    }

    private String getFileUrlByName(ArrayList<ModuleConfig> configs,String name){
        for (ModuleConfig mc : configs){
            if(mc.FileType.equals(name))
                return mc.ConfigFile;
        }
        return name;
    }

    /** 读取文件 */
    public ArrayList<String> readFile(String file,String encode){
        InputStreamReader reader = null;
        BufferedReader bufferedReader = null;
        ArrayList<String> list = new ArrayList<String>();
        try{
            //reader = new FileReader(file);
            File f = new File(file);
            if(!f.exists()){
                list.add("File Not Exist!");
                return list;
            }

            reader = new InputStreamReader(new FileInputStream(f),encode);
            bufferedReader = new BufferedReader(reader);
            String line = null;
            while((line = bufferedReader.readLine()) != null){
                //log.info(line);
                list.add(line);
            }
        }catch(Exception e){
            log.error("Read File Exception:",e);
        }
        finally{
            try{
                if(bufferedReader != null) bufferedReader.close();
                if(reader != null) reader.close();
            }catch(Exception e){
                log.error("Read File Exception:",e);
            }
        }
        return list;
    }
    /** 写入文件 */
    public boolean writeFile(String file,ArrayList<String> list,String encode){
        BufferedWriter bw = null;
        OutputStreamWriter write = null;
        try{
            //log.info("Config File:"+file+", Encode:"+encode);
            File f = new File(file);
            if(!f.exists()) f.createNewFile();

            write = new OutputStreamWriter(
                    new FileOutputStream(f), encode);
            bw = new BufferedWriter(write);

            for(String arr : list){
                bw.write(arr+"\t\n");
            }
        }catch(Exception e){
            log.error("Write File Exception:",e);
            return false;
        }
        finally{
            try{
                if(bw != null) bw.close();
                if(write != null) write.close();
            }catch(Exception e){
                log.error("Write File Exception:",e);
                return false;
            }
        }
        return true;
    }

    private ArrayList<String> generateSnmpdContent(ArrayList<String> oldContent,LinkedHashMap<String,String> ipMap){
        String key1 = "{1}";
        String[] val1 = new String[]{"rocommunity public {key}",
                                    "rwcommunity private {key}",
                                    "trap2sink {key} public {value}"};
        String key2 = "{2}";
        String[] val2 = new String[]{"trapsess -v 3 -l authPriv -a  MD5 -A authpass -X privpass -u admin -e 0x0102030405 {key}:{value}"};

        ArrayList<String> newContent = new ArrayList<String>();
        for (String line : oldContent){
            if(line.equals(key1)){
                for (String key : ipMap.keySet()){
                    String value = ipMap.get(key);
                    newContent.addAll(assignmentKeyAndValue(val1,key,value));
                }
            }else if(line.equals(key2)){
                for (String key : ipMap.keySet()){
                    String value = ipMap.get(key);
                    newContent.addAll(assignmentKeyAndValue(val2,key,value));
                }
            }else
                newContent.add(line);
        }
        return  newContent;
    }

    private ArrayList<String> generateDeviceContent(ArrayList<String> oldContent,ArrayList<ModuleDevice> deviceList){
        String key1 = "{1}";
        String val1 = "DeviceNum={num}";
        String key2 = "{2}";
        String[] val2 = new String[]{"[Device{index}]","//{name}","Id={id}","Type={type}"};
        ArrayList<String> newContent = new ArrayList<String>();
        for (String line : oldContent){
            if(line.equals(key1)){
                String value = val1.replace("{num}",String.valueOf(deviceList.size()));
                newContent.add(value);
            }else if(line.equals(key2)){
                int index = 1;
                for (ModuleDevice md : deviceList){
                    //log.info("List id:"+md.id+", name:"+md.name+", type:"+md.type);
                    newContent.add(val2[0].replace("[Device%s]",String.valueOf(index)));
                    newContent.add(val2[1].replace("{name}",md.name));
                    newContent.add(val2[2].replace("{id}",md.id));
                    newContent.add(val2[3].replace("{type}",md.type));
                    //newContent.addAll(assignmentKeyAndValue(val2,key,value));
                    index ++;
                }
            }else
                newContent.add(line);
        }
        return newContent;
    }

    private ArrayList<String> generateBMobileContent(ArrayList<String> oldContent,String ip,String port,String fPort,ArrayList<ModuleDevice> deviceList){
        String ipKey    =    "{ip}";
        String portKey  =    "{port}";
        String fsuIdKey =    "{fsuId}";
        String fsuPort  =    "{fsuPort}";
        String numKey   =    "{num}";
        String devKey   =    "{device}";
        String[] devVal = new String[]{"[DEVICE{index}]","DeviceId={code}","DeviceName={name}","EquipId={id}"};

        String RoomId = "RoomId=";
        String RoomName = "RoomName=";
        String SiteID = "SiteID=";
        String SiteName = "SiteName=";
        ArrayList<String> newContent = new ArrayList<String>();
        for (String line : oldContent){
            if(line.indexOf(RoomId) != -1)
                RoomId = line;
            if(line.indexOf(RoomName) != -1)
                RoomName = line;
            if(line.indexOf(SiteID) != -1)
                SiteID = line;
            if(line.indexOf(SiteName) != -1)
                SiteName = line;

            if(line.indexOf(ipKey) != -1)
                newContent.add(line.replace(ipKey,ip));
            else if(line.indexOf(portKey) != -1)
                newContent.add(line.replace(portKey,port));
            else if(line.indexOf(fsuIdKey) != -1){
                SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmm");
                String dateNowStr = sdf.format(new Date());
                newContent.add(line.replace(fsuIdKey,dateNowStr));
            }else if(line.indexOf(fsuPort) != -1)
                newContent.add(line.replace(fsuPort,fPort));
            else if(line.indexOf(numKey) != -1)
                newContent.add(line.replace(numKey,String.valueOf(deviceList.size())));
            else if(line.indexOf(devKey) != -1){
                try{
                    int index = 1;
                    for (ModuleDevice md : deviceList){
                        newContent.add(devVal[0].replace("{index}",String.valueOf(index)));
                        newContent.add(devVal[1].replace("{code}",md.code));
                        newContent.add(devVal[2].replace("{name}",md.name));
                        newContent.add(devVal[3].replace("{id}",md.id));
                        newContent.add(RoomId);
                        newContent.add(RoomName);
                        newContent.add(SiteID);
                        newContent.add(SiteName);
                        index ++;
                    }
                }catch (Exception e){}
            }else
                newContent.add(line);

        }
        return newContent;
    }

    private ArrayList<String> generateBUnicomContent(ArrayList<String> oldContent,String ip,String port,ArrayList<ModuleDevice> deviceList){
        String ipKey    =    "{ip}";
        String portKey  =    "{port}";
        String macKey   =    "{mac}";
        String numKey   =    "{num}";
        String devKey   =    "{device}";
        String[] devVal = new String[]{"[DEVICE{index}]","DeviceId={code}","DeviceRId={code}","DeviceName={name}","SiteWebEquipId={id}"};

        ArrayList<String> newContent = new ArrayList<String>();
        for (String line : oldContent){
            if(line.indexOf(ipKey) != -1)
                newContent.add(line.replace(ipKey,ip));
            else if(line.indexOf(portKey) != -1)
                newContent.add(line.replace(portKey,port));
            else if(line.indexOf(macKey) != -1){
                String mac = LicenseHelper.getMac();
                mac = mac.replaceAll("\\-","");
                mac = mac.replaceAll("\\:","");
                newContent.add(line.replace(macKey,mac));
            }else if(line.indexOf(numKey) != -1)
                newContent.add(line.replace(numKey,String.valueOf(deviceList.size())));
            else if(line.indexOf(devKey) != -1){
                try{
                    int index = 1;
                    for (ModuleDevice md : deviceList){
                        newContent.add(devVal[0].replace("{index}",String.valueOf(index)));
                        newContent.add(devVal[1].replace("{code}",md.code));
                        newContent.add(devVal[2].replace("{code}",md.code));
                        newContent.add(devVal[3].replace("{name}",md.name));
                        newContent.add(devVal[4].replace("{id}",md.id));
                        index ++;
                    }
                }catch (Exception e){}
            }else
                newContent.add(line);

        }
        return newContent;
    }

    private ArrayList<String> assignmentKeyAndValue(String[] form,String key,String value){
        ArrayList<String> list = new ArrayList<String>();
        for (String str : form){
            String s = str.replace("{key}",key);
            s = s.replace("{value}",value);
            list.add(s);
        }
        return list;
    }

    public String detectionConfig(String type){
        loadOtherModules();

        OtherModule otherModule = OtherModule.getObjectByName(otherModules, type);
        if(otherModule == null) return "Not Type";

        for (ModuleConfig mc : otherModule.Configs){
            File file = new File(mc.ConfigFile);
            if(mc.ConfigFile.lastIndexOf("/") < (mc.ConfigFile.length() - 1)){
                if(!file.exists()) return "Missing File:"+mc.ConfigFile;
            }else{
                if(!file.isDirectory()) return "Missing Folder:"+mc.ConfigFile;
            }
        }

        return "OK";
    }

    public String restartConfig(String type){
        try{
            if(type.equals("bInterface_chinamobile")){
                //中国移动 | killall -9 cmbdb | /home/app/samp/cmbdb &
                String[] cmd_end = new String[]{"/bin/sh", "-c", "killall -9 cmbdb"};
                SystemSettingProvider.getInstance().updateSystemSetting(cmd_end);
                log.info("End Process Cmd:"+cmd_end[2]);
                Thread.sleep(1000);
                String[] cmd_start = new String[]{"/bin/sh", "-c", "/home/app/samp/cmbdb &"};
                SystemSettingProvider.getInstance().updateSystemSetting(cmd_start);
                Thread.sleep(2000);
                log.info("Start Process Cmd:"+cmd_start[2]);

                //映射超链接
                String[] cmd_cmbspace = new String[]{"/bin/sh", "-c", "/bin/ln -s /home/app/samp/data/log/cmbspace/ /"};
                SystemSettingProvider.getInstance().updateSystemSetting(cmd_cmbspace);
                Thread.sleep(300);
                String[] cmd_config = new String[]{"/bin/sh", "-c", "/bin/ln -s /home/app/samp/data/log/cmbspace/Config/ /"};
                SystemSettingProvider.getInstance().updateSystemSetting(cmd_config);
            }else{
                //中国联通 | killall -9 cubdb | /home/app/samp/cubdb &
                String[] cmd_end = new String[]{"/bin/sh", "-c", "killall -9 cubdb"};
                SystemSettingProvider.getInstance().updateSystemSetting(cmd_end);
                log.info("End Process Cmd:"+cmd_end[2]);
                Thread.sleep(1000);
                String[] cmd_start = new String[]{"/bin/sh", "-c", "/home/app/samp/cubdb &"};
                SystemSettingProvider.getInstance().updateSystemSetting(cmd_start);
                Thread.sleep(2000);
                log.info("Start Process Cmd:"+cmd_start[2]);
            }
            return "OK";
        }catch (Exception e){
            return "Error";
        }
    }

    public String uploadModuleConfigFile(String type,String path){
        loadOtherModules();

        OtherModule otherModule = OtherModule.getObjectByName(otherModules, type);
        if(otherModule == null) return "Not Type";

        //根据 otherModule.Configs 删除原文件
        removeFile(otherModule.Configs);

        //将 path 目录的所有文件复制到 otherModule.UploadPath 目录
        copyDirectory(path,otherModule.UploadPath);

        return "OK";
    }

    /** 删除配置的所有原文件 */
    private void removeFile(ArrayList<ModuleConfig> Configs){
        if(!os.equals("Linux") && !os.equals("linux"))  return;
        try{
            for (ModuleConfig mc : Configs){
                if(mc.ConfigFile == null || mc.ConfigFile.equals("")) continue;
                mc.ConfigFile = mc.ConfigFile.replaceAll("\\\\","/");

                String[] cmd_date = null;
                if(mc.ConfigFile.lastIndexOf("/") == (mc.ConfigFile.length() - 1)){
                    //删除文件夹
                    cmd_date = new String[]{"/bin/sh", "-c", String.format("./bin/rm -rf %s*",mc.ConfigFile)};
                }else{
                    //删除文件
                    cmd_date = new String[]{"/bin/sh", "-c", String.format("./bin/rm -rf %s",mc.ConfigFile)};
                }
                SystemSettingProvider.getInstance().updateSystemSetting(cmd_date);
                //log.info("Command:"+cmd_date[2]);
            }
        }catch (Exception ex){
            log.error("removeFile Exception:",ex);
        }
    }

    /** 将 sourcePath 目录下的文件复制到 targetPath 目录 */
    private void copyDirectory(String sourcePath,String targetPath){
        if(!os.equals("Linux") && !os.equals("linux"))  return;
        try{
            File dir = new File(targetPath);
            //如果文件夹不存在则创建
            if (!dir.exists()  && !dir.isDirectory()){
                dir.mkdirs();// 创建多级目录
            }

            sourcePath = sourcePath.replaceAll("\\\\","/");
            if(sourcePath.lastIndexOf("/") == (sourcePath.length() - 1))
                sourcePath += sourcePath+"*";
            else
                sourcePath += sourcePath+"/*";

            targetPath = targetPath.replaceAll("\\\\","/");
            if(targetPath.lastIndexOf("/") != (targetPath.length() - 1))
                targetPath += targetPath+"/";

            String[] cmd_date = new String[]{"/bin/sh", "-c", String.format("./bin/cp %s %s",sourcePath,targetPath)};
            SystemSettingProvider.getInstance().updateSystemSetting(cmd_date);
            //log.info("Command:"+cmd_date[2]);

        }catch (Exception ex){
            log.error("copyDirectory Exception:",ex);
        }
    }

    private Thread rthread = null;
    public void startLogThread(String type){
        loadOtherModules();

        OtherModule otherModule = OtherModule.getObjectByName(otherModules, type);
        if(otherModule == null) return;

        //log.info("Name:"+otherModule.Name+", LogFile:"+otherModule.LogFile+", LogCmd:"+otherModule.LogCmd);
        if(otherModule.LogFile == null || otherModule.LogFile.equals("")) return;

        LogReader.exit = true;
        if(rthread == null){
            File logFile = new File(otherModule.LogFile);//"E:/code/nurse/nurse.log"
            if(!logFile.exists()) return;
            rthread = new Thread(new LogReader(logFile,otherModule.Encode));
            rthread.start();
            //log.info("Start!");
        }
    }

    public void closeLogThread(){
        try {
            LogReader.exit = false;
            if(rthread != null){
                rthread.interrupt();
                rthread = null;
                //log.info("Stop!");
            }
        }catch (Exception e){}
    }

    public String getLogContent (){
        if(LogReader.logContent.size() == 0) return "";

        //System.out.println("Print Size:"+LogReader.logContent.size());

        String res = createStringByList(LogReader.logContent,null,"");//String.format("[%s]",result);
        LogReader.logContent = new ArrayList<String>();
        return res;
    }

    public void addLogContent(){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        //设置为东八区
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
        Date date = new Date();
        String dateStr = sdf.format(date);

        log.info("时间:"+dateStr+" 内容:一二三四");
        log.info("时间:"+dateStr+" 内容:五六其他");
        log.info("时间:"+date+" 内容:九十勾圈");
    }

    public String ReturnCmdContent(String cmd,String type){
        loadOtherModules();

        OtherModule otherModule = OtherModule.getObjectByName(otherModules, type);
        if(otherModule == null) return "[{\"content\":\"Not Type\"}]";

        String[] cmd_date = new String[]{"/bin/sh", "-c", cmd};
        //log.info("Cmd:"+cmd_date[2]);
        ArrayList<String> dataList = SystemSettingProvider.getInstance().getSystemDataList(cmd_date);

        //log.info("Print Size:"+dataList.size());

        String regEx = "[\\u0004]";
        return createStringByList(dataList,regEx,"");
    }

    private String createStringByList(List<String> list,String regEx,String replacement){
        String result = "";
        for(String str : list){
            String res = str;

            if(regEx != null && !regEx.equals("")){
                Matcher m = Pattern.compile(regEx).matcher(str);
                if(m.find()) res = str.replaceAll(regEx,replacement);
            }

            //去除 \t 和 前后空格
            res = res.trim();
            res = res.replaceAll("\t","");
            res = res.replaceAll("\"","\'");

            if(result.length() > 0) result += ",";
            result += String.format("{\"content\":\"%s\"}",res);
        }

        if(result.equals(""))
            return "[{\"content\":\"Not Data!\"}]";
        else
            return String.format("[%s]",result);
    }

    /* ---------------------- 移动B接口 Start ------------------------ */
    public String loadChinamobileConfig(){
        loadOtherModules();
        OtherModule otherModule = OtherModule.getObjectByName(otherModules, "bInterface_chinamobile");
        if(otherModule == null) return "{\"Error\":\"Not OtherModule!\"}";

        /*"F:\\桌面分区\\开发\\64.B接口配置\\cmb_init_list.ini"*/
        String path = getFileUrlByName(otherModule.Configs,"cmb_init_list.ini");
        ArrayList<String> reads = readFile(path,"GBK");

        JSONArray arr = new JSONArray();
        Chinamobile cmb = new Chinamobile();
        ChinamobileDevice cmbDevice = null;

        String status = "FSUINFO";
        int index = 1;
        for(String line : reads){
            if(line == null || line.equals("")) continue;
            if(line.equals("File Not Exist!")) return "{\"Error\":\"File Not Exist!\"}";

            if(line.trim().contains("[FSUINFO]")) status = "FSUINFO";
            if(line.trim().contains("[DEVICE_NUM]")) status = "DEVICE_NUM";
            if(line.trim().contains(String.format("[DEVICE%d]",index))){
                if(cmbDevice != null){
                    JSONObject dev = new JSONObject(cmbDevice);
                    arr.put(dev);
                }

                status = "DEVICE";
                cmbDevice = new ChinamobileDevice();
                index ++;
            }


            String[] map = getParamKeyAndValue(line);
            //FSU的信息
            if(status.equals("FSUINFO"))
                setObjectParam(cmb,map);

            //设备列表的信息
            if(status.equals("DEVICE")){
                setObjectParam(cmbDevice,map);

                if(index == 2){
                    if(line.trim().contains("RoomId") || line.trim().contains("RoomName")
                    || line.trim().contains("SiteID") || line.trim().contains("SiteName"))
                        setObjectParam(cmb,map);
                }
            }
            //System.out.println(line);
        }
        if(cmbDevice != null){
            JSONObject dev = new JSONObject(cmbDevice);
            arr.put(dev);
        }

        JSONObject obj = new JSONObject(cmb);
        obj.put("Devices",arr);
        //System.out.println(obj.toString());/*-------------------------------------------------------*/
        return obj.toString();
    }

    public String modifyChinamobileConfig(JSONObject jsonObject){
        loadOtherModules();
        OtherModule otherModule = OtherModule.getObjectByName(otherModules, "bInterface_chinamobile");
        if(otherModule == null) return "Not OtherModule";

        ArrayList<String> newReadCmb = new ArrayList<String>();

        newReadCmb.addAll(Chinamobile.toStringList(jsonObject));
        newReadCmb.addAll(ChinamobileDevice.toStringList(jsonObject));

        /*"F:\\桌面分区\\开发\\64.B接口配置\\cmb_init_list.ini"*/
        boolean b = writeFile(getFileUrlByName(otherModule.Configs,"cmb_init_list.ini"),newReadCmb,"GBK");
        if(!b) return "File Not Exist";

        return "OK";
    }
    /* ---------------------- 移动B接口 End ------------------------ */

    /* ---------------------- 联通B接口 Start ------------------------ */
    public String loadChinaunicomConfig(){
        loadOtherModules();
        OtherModule otherModule = OtherModule.getObjectByName(otherModules, "bInterface_chinaunicom");
        if(otherModule == null) return "{\"Error\":\"Not OtherModule!\"}";

        /*"F:\\桌面分区\\开发\\64.B接口配置\\[联通]cub_init_list.ini"*/
        ArrayList<String> reads = readFile(getFileUrlByName(otherModule.Configs,"cub_init_list.ini"),"GBK");

        JSONArray arr = new JSONArray();
        Chinaunicom cub = new Chinaunicom();
        ChinaunicomDevice cubDevice = null;

        String status = "FSUINFO";
        int index = 1;
        for(String line : reads){
            if(line == null || line.equals("")) continue;
            if(line.equals("File Not Exist!")) return "{\"Error\":\"File Not Exist!\"}";

            if(line.trim().contains("[FSUINFO]")) status = "FSUINFO";
            if(line.trim().contains("[DEVICE_NUM]")) status = "DEVICE_NUM";
            if(line.trim().contains(String.format("[DEVICE%d]",index))){
                if(cubDevice != null){
                    JSONObject dev = new JSONObject(cubDevice);
                    arr.put(dev);
                }

                status = "DEVICE";
                cubDevice = new ChinaunicomDevice();
                index ++;
            }


            String[] map = getParamKeyAndValue(line);
            //FSU的信息
            if(status.equals("FSUINFO"))
                setObjectParam(cub,map);

            //设备列表的信息
            if(status.equals("DEVICE")){
                setObjectParam(cubDevice,map);

                if(index == 2){
                    if(line.trim().contains("RoomId") || line.trim().contains("RoomName")
                            || line.trim().contains("SiteID") || line.trim().contains("SiteName"))
                        setObjectParam(cub,map);
                }
            }
        }
        if(cubDevice != null){
            JSONObject dev = new JSONObject(cubDevice);
            arr.put(dev);
        }

        JSONObject obj = new JSONObject(cub);
        obj.put("Devices",arr);
        //System.out.println(obj.toString());/*-------------------------------------------------------*/
        return obj.toString();
    }

    public String modifyChinaunicomConfig(JSONObject jsonObject){
        loadOtherModules();
        OtherModule otherModule = OtherModule.getObjectByName(otherModules, "bInterface_chinaunicom");
        if(otherModule == null) return "Not OtherModule";

        ArrayList<String> newReadCmb = new ArrayList<String>();

        newReadCmb.addAll(Chinaunicom.toStringList(jsonObject));
        newReadCmb.addAll(ChinaunicomDevice.toStringList(jsonObject));

        /*"F:\\桌面分区\\开发\\64.B接口配置\\cub_init_list.ini"*/
        boolean b = writeFile(getFileUrlByName(otherModule.Configs,"cub_init_list.ini"),newReadCmb,"GBK");
        if(!b) return "File Not Exist";

        return "OK";
    }
    /* ---------------------- 联通B接口 End ------------------------ */

    /* ---------------------- SNMP Start ------------------------ */
    public String loadSnmpConfig(){
        loadOtherModules();
        OtherModule otherModule = OtherModule.getObjectByName(otherModules, "snmp");
        if(otherModule == null) return "{\"Error\":\"Not OtherModule!\"}";

        ArrayList<String> reads = readFile(getFileUrlByName(otherModule.Configs,"snmpd.cfg"),"UTF-8");


        JSONArray arr = new JSONArray();
        Snmpmodule snmp = new Snmpmodule();
        SnmpIp snmpIp = null;

        for(String line : reads){
            if(line.contains("sysLocation"))
                snmp.sysLocation = getParamValueByKey(line,"sysLocation");
            if(line.contains("sysContact"))
                snmp.sysContact = getParamValueByKey(line,"sysContact");
            if(line.contains("sysName"))
                snmp.sysName = getParamValueByKey(line,"sysName");
            if(line.contains("sysDescr"))
                snmp.sysDescr = getParamValueByKey(line,"sysDescr");
            if(line.contains("sysObjectID"))
                snmp.sysObjectID = getParamValueByKey(line,"sysObjectID");

            if(line.contains("trap2sink")){
                snmpIp = new SnmpIp();
                String str = getParamValueByKey(line,"trap2sink");
                int index = str.indexOf("public");
                snmpIp.IP = str.substring(0,index).trim();
                snmpIp.Port = getParamValueByKey(line,"public");

                JSONObject dev = new JSONObject(snmpIp);
                arr.put(dev);
            }
        }

        JSONObject obj = new JSONObject(snmp);
        obj.put("IPS",arr);

        //System.out.println(obj.toString());// -----------------------------------------------
        return obj.toString();
    }

    private String getParamValueByKey(String line,String key){
        try{
            if(line == null || line.equals("")) return line;

            int length = key.length();
            int index = line.indexOf(key);
            return line.substring(index + length + 1).trim();
        }catch (Exception ex){
            return line;
        }
    }

    public String modifySnmpConfig(JSONObject jsonObject){
        loadOtherModules();
        OtherModule otherModule = OtherModule.getObjectByName(otherModules, "snmp");
        if(otherModule == null) return "Not OtherModule";

        ArrayList<String> newReadCmb = new ArrayList<String>();

        newReadCmb.addAll(Snmpmodule.toStringList(jsonObject));
        newReadCmb.addAll(SnmpIp.toTrap2sink(jsonObject));
        newReadCmb.add("");
        newReadCmb.add("view all included .1");
        newReadCmb.add("access readgroup \"\" any noauth exact all all none");
        newReadCmb.add("createUser  admin MD5 \"authpass\" DES \"privpass\"");
        newReadCmb.add("group readgroup usm  admin");
        newReadCmb.addAll(SnmpIp.toTrapsess(jsonObject));

        boolean b = writeFile(getFileUrlByName(otherModule.Configs,"snmpd.cfg"),newReadCmb,"UTF-8");
        if(!b) return "File Not Exist";

        return "OK";
    }
    /* ---------------------- SNMP End ------------------------ */


    //获取关键字=号前后值 return HashMap<String,String>;
    private String[] getParamKeyAndValue(String line){
        try{
            if(line == null || line.equals("")) return null;
            String[] map = new String[2];

            int index = line.indexOf("=");
            if(index > 0){
                map[0] = line.substring(0,index).trim();
                map[1] = line.substring(index+1).trim();
                return map;
            }
            return null;
        }catch (Exception ex){
            log.error("getParamKeyAndValue Exception:",ex);
            return null;
        }
    }
    //给对象赋值
    private void setObjectParam(Object obj,String[] map){
        try{
            if (map == null || map.length < 2 || map[1].equals("")) return;

            Field[] fields = obj.getClass().getDeclaredFields();
            for (Field field : fields){
                if (field.getName().equals(map[0])){
                    Method method = obj.getClass().getMethod("set"+map[0], String.class);
                    method.invoke(obj,map[1]);
                }
            }
        }catch (Exception ex){
            log.error("setObjectParam Exception:",ex);
        }
    }
}
class LogReader implements Runnable {
    private File logFile = null;
    private long lastTimeFileSize = 0; // 上次文件大小
    private String encode = "gbk";
    public static volatile boolean exit = true;
    public static ArrayList<String> logContent = new ArrayList<String>();
    private static Logger log = Logger.getLogger(OtherModuleProvider.class);



    public LogReader(File logFile,String encode) {
        this.logFile = logFile;
        this.encode = encode;
        lastTimeFileSize = logFile.length();
    }

    /**
     * 实时输出日志信息
     */
    public void run() {
        while (exit) {
            try {
                RandomAccessFile randomFile = new RandomAccessFile(logFile, "r");
                randomFile.seek(lastTimeFileSize);
                String tmp = null;
                while ((tmp = randomFile.readLine()) != null) {
                    logContent.add(new String(tmp.getBytes("ISO-8859-1"),this.encode));//utf-8
                    //System.out.println("Reader:"+tmp);
                }
                lastTimeFileSize = randomFile.length();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                log.error("run() ", e);
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {}
        }
    }
}
