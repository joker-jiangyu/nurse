package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.utility.BasePath;
import nurse.utility.MainConfigHelper;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.HashMap;

public class LanguageDataHandler extends DataHandlerBase {
    private static Logger log = Logger.getLogger(LanguageDataHandler.class);

    private static final String GETLOGINLANGUAGEJSON = "GetLoginLanguageJson";
    private static final String GETLANGUAGE = "GetLanguage";
    private static final String SETLANGUAGE = "SetLanguage";

    private static String Lanaguage = null;
    public static String getLanaguage(){
        if(Lanaguage == null) {
            Lanaguage = MainConfigHelper.getConfig().language;
            return Lanaguage;
        }else
            return Lanaguage;
    }
    private static HashMap<String,HashMap<String,String>> LanaguageJsonMap = new HashMap<String,HashMap<String,String>>();

    /**
     * 使用需要LanaguageJsonMap做缓存
     * @param key
     * @return
     */
    public static String getLanaguageJsonValue(String key){
        if(LanaguageJsonMap.size() == 0) return "";

        String[] split = key.split("\\.");
        if(LanaguageJsonMap.containsKey(split[0])){
            HashMap<String, String> map = LanaguageJsonMap.get(split[0]);
            if(map.containsKey(split[1])){
                return LanaguageJsonMap.get(split[0]).get(split[1]);
            }
        }
        log.error("LanaguageJsonMap Key Not Data");
        return "";
    }

    public void Execute(HttpDataExchange req, HttpDataExchange rep) {
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(LanguageDataHandler.GETLOGINLANGUAGEJSON)) {
            rep.responseResult = HandGetLoginLanguageJson();
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(LanguageDataHandler.GETLANGUAGE)) {
            rep.responseResult = HandGetLanguage();
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(LanguageDataHandler.SETLANGUAGE)) {
            rep.responseResult = HandSetLanguage(req.requestParams);
        }
    }

    public String HandGetLoginLanguageJson(){
        initLanaguageJsonMap();//缓存HashMap集合

        String language = "";
        if(this.Lanaguage == null) {
            language = MainConfigHelper.getConfig().language;
            this.Lanaguage = language;
        }

        String file = "";
        if(this.Lanaguage.equals("Chinese"))
            file = BasePath.getWebPath()+"/data/language/ch.json";
        else
            file = BasePath.getWebPath()+"/data/language/en.json";

        return getLoginJson(readJsonData(file));
    }

    public String HandGetLanguage(){
        if(this.Lanaguage == null) {
            this.Lanaguage = MainConfigHelper.getConfig().language;
            return this.Lanaguage;
        }else
            return this.Lanaguage;
    }

    public String HandSetLanguage(String requestParams){
        // requestParams => Chinese/English
        //修改配置文件
        String res = MainConfigHelper.editLabelContent("language", requestParams);
        if(res.equals("OK")){
            //重新加载配置
            MainConfigHelper.loadConfigs();
            this.Lanaguage = requestParams;
        }
        //获取最新的JSON内容
        String file = "";
        if(this.Lanaguage.equals("Chinese"))file = BasePath.getWebPath()+"/data/language/ch.json";
        else
            file = BasePath.getWebPath()+"/data/language/en.json";

        return getLoginJson(readJsonData(file));
    }

    /** 根据文件目录获取文件内容 */
    public static String readJsonData(String pactFile) {
        try {
            // 读取文件数据
            //System.out.println("读取文件数据util");

            StringBuffer strbuffer = new StringBuffer();
            File myFile = new File(pactFile);//"D:"+File.separatorChar+"DStores.json"
            if (!myFile.exists()) {
                log.info("Can't Find " + pactFile);
            }
            try {
                FileInputStream fis = new FileInputStream(pactFile);
                InputStreamReader inputStreamReader = new InputStreamReader(fis, "UTF-8");
                BufferedReader in  = new BufferedReader(inputStreamReader);

                String str;
                while ((str = in.readLine()) != null) {
                    strbuffer.append(str);  //new String(str,"UTF-8")
                }
                in.close();
            } catch (Exception e) {
                log.error("Exception :",e);
            }
            //System.out.println("读取文件结束util");
            return strbuffer.toString();
        }catch (Exception ex){
            log.error("Exception :",ex);
        }
        return "";
    }

    /** 根据Json文件内容只获取登录页面的Json内容 */
    private static String getLoginJson(String json){
        JSONObject obj = new JSONObject(json);

        String lan = obj.getString("Language");
        String logs = obj.getJSONObject("Login").toString();
        String info = String.format("{\"Language\":\"%s\",\"Login\":%s}",lan,logs);

        return info;
    }

    /** 根据路径获取值，如：Login.UserName = 请输入用户名 */
    public static String getLanguageValue(String url){
        String file = "";
        if(Lanaguage == null) Lanaguage = MainConfigHelper.getConfig().language;
        if(Lanaguage.equals("Chinese"))
            file = BasePath.getWebPath()+"/data/language/ch.json";
        else
            file = BasePath.getWebPath()+"/data/language/en.json";

        JSONObject jsonObject = new JSONObject(readJsonData(file));

        String[] split = url.split("\\.");
        String result = null;
        for (String key : split){
            if(!jsonObject.has(key)) return "";//不存在Key

            Object obj = jsonObject.get(key);
            if (obj instanceof JSONObject) {//JsonObject
                jsonObject = jsonObject.getJSONObject(key);
            }
            if(obj instanceof String){//String
                result = jsonObject.getString(key);
            }
        }
        if(result == null) result = jsonObject.toString();

        return result;
    }

    /**
     * 登录就缓存一次关键的配置
     */
    private void initLanaguageJsonMap(){
        LanaguageJsonMap = new HashMap<String,HashMap<String,String>>();
        String[] urls = new String[]{
                "AlarmRecord.EAlarm","AlarmRecord.IAlarm","AlarmRecord.GAlarm","AlarmRecord.PAlarm",
                "AlarmRecord.TriggerVal",
                "OperationRecord.EventConfirm","OperationRecord.Login","OperationRecord.LoginOut",
                "OperationRecord.SendControl","OperationRecord.ConfigChange","OperationRecord.Shutdown",
                "OperationRecord.Restart","OperationRecord.LoginError",
                "AssetOperation.Automatic","AssetOperation.Manual","AssetOperation.AssetDemolition",
                "AssetOperation.AddRack","AssetOperation.ModifyRack","AssetOperation.DeleteRack",
                "AssetOperation.AssetPutaway","AssetOperation.ModifyAsset","AssetOperation.DeleteAsset",
                "AssetOperation.EndAlarm",
                "EquipmentTemplate.SignalName","EquipmentTemplate.SignalMeanings0","EquipmentTemplate.SignalMeanings1",
                "EquipmentTemplate.EventName","EquipmentTemplate.EventMeanings",
                "DeviceOperation.Add","DeviceOperation.ManuallyAdd","DeviceOperation.Modify","DeviceOperation.EquipmentName",
                "DeviceOperation.EquipmentModel","DeviceOperation.EquipmentVersion","DeviceOperation.ImagesPath",
                "DeviceOperation.EquipmentSN","DeviceOperation.InstallTime","DeviceOperation.UsedDate","DeviceOperation.WarrantyPeriod",
                "DeviceOperation.MaintenanceTime","DeviceOperation.ConfigSetting","DeviceOperation.PatchName",
                "DeviceOperation.PatchVersion","DeviceOperation.DigitalSignature","DeviceOperation.Location",
                "DeviceOperation.Comment"
        };

        for (String url : urls){
            String[] keys = url.split("\\.");
            HashMap<String,String> map = new HashMap<String,String>();
            if(LanaguageJsonMap.containsKey(keys[0])){
                map = LanaguageJsonMap.get(keys[0]);
                map.put(keys[1],getLanguageValue(url));
            }else {
                map.put(keys[1],getLanguageValue(url));
                LanaguageJsonMap.put(keys[0], map);
            }
        }
    }
}
