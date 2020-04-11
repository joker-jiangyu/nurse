package nurse.logic.handlers;

import nurse.entity.persist.Chinamobile;
import nurse.entity.persist.ChinamobileDevice;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.OtherModuleProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;
import nurse.utility.LicenseHelper;
import org.json.JSONObject;

import java.util.ArrayList;

public class OtherModuleDataHandler extends DataHandlerBase {
    private static final String printConfig = "printConfig";
    private static final String modifyConfig = "modifyConfig";
    private static final String detectionConfig = "detectionConfig";
    private static final String restartConfig = "restartConfig";
    private static final String uploadConfig = "uploadConfig";
    private static final String switchCheck = "switchCheck";
    private static final String getLogContent = "getLogContent";
    private static final String addLogContent = "addLogContent";
    private static final String returnCmdContent = "returnCmdContent";

    private static final String loadOtherModuleConfig = "loadOtherModuleConfig";
    private static final String modifyOtherModuleConfig = "modifyOtherModuleConfig";
    private static final String getChinaunicomFSUID = "getChinaunicomFSUID";


    public void Execute(HttpDataExchange req, HttpDataExchange rep) {
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.printConfig)){
            rep.responseResult = HandlePrintConfig(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.modifyConfig)){
            rep.responseResult = HandleModifyConfig(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.detectionConfig)){
            rep.responseResult = HandleDetectionConfig(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.restartConfig)){
            rep.responseResult = HandleRestartConfig(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.uploadConfig)){
            rep.responseResult = HandleUploadConfig(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.switchCheck)){
            rep.responseResult = HandleSwitchCheck(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.getLogContent)){
            rep.responseResult = HandleGetLogContent(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.addLogContent)){
            rep.responseResult = HandleAddLogContent(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.returnCmdContent)){
            rep.responseResult = HandleReturnCmdContent(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.loadOtherModuleConfig)){
            rep.responseResult = HandleLoadOtherModuleConfig(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.modifyOtherModuleConfig)){
            rep.responseResult = HandleModifyOtherModuleConfig(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(OtherModuleDataHandler.getChinaunicomFSUID)){
            rep.responseResult = HandleGetChinaunicomFSUID(req.requestParams);
        }
    }

    private String HandlePrintConfig(String requestParams){
        // requestParams => bInterface_chinamobile(bInterface_chinaunicom/nurse/fsu/dog/snmp)
        return OtherModuleProvider.getInstance().printModuleConfig(requestParams);
    }

    private String HandleModifyConfig(String requestParams) {
        // requestParams => type|ip1-port1;ip2-port2;|fsuPort|id1-type1;id2-type2;
        String[] split = Base64Helper.decode(requestParams).split("\\|");

        return OtherModuleProvider.getInstance().ModifyModuleConfig(split[0],split);
    }

    private String HandleDetectionConfig(String requestParams) {
        // requestParams => bInterface(nurse/fsu/dog/snmp)
        return OtherModuleProvider.getInstance().detectionConfig(requestParams);
    }

    private String HandleRestartConfig(String requestParams) {
        // requestParams => bInterface_chinamobile(bInterface_chinaunicom)
        return OtherModuleProvider.getInstance().restartConfig(requestParams);
    }

    private String HandleUploadConfig(String requestParams) {
        // requestParams => bInterface(nurse/fsu/dog/snmp)|path
        String[] split = Base64Helper.decode(requestParams).split("\\|");
        return OtherModuleProvider.getInstance().uploadModuleConfigFile(split[0],split[1]);
    }


    private String HandleSwitchCheck(String requestParams){
        // requestParams => true(false)|bInterface(nurse/fsu/dog/snmp)
        String[] split = requestParams.split("\\|");
        if(split[0].equals("true")) OtherModuleProvider.getInstance().startLogThread(split[1]);
        else OtherModuleProvider.getInstance().closeLogThread();
        return split[0];
    }

    private String HandleGetLogContent(String requestParams){
        return OtherModuleProvider.getInstance().getLogContent();
    }

    private String HandleAddLogContent(String requestParams){
        OtherModuleProvider.getInstance().addLogContent();
        return "OK";
    }

    private String HandleReturnCmdContent(String requestParams){
        // requestParams => Cmd
        String[] split = Base64Helper.decode(requestParams).split("\\|");
        return OtherModuleProvider.getInstance().ReturnCmdContent(split[0],split[1]);
    }

    private String HandleLoadOtherModuleConfig(String requestParams){
        // requestParams => Chinamobile(Chinaunicom/Snmp)
        String type = Base64Helper.decode(requestParams);
        if(type.equals("Chinamobile"))
            return OtherModuleProvider.getInstance().loadChinamobileConfig();
        else if(type.equals("Chinaunicom"))
            return OtherModuleProvider.getInstance().loadChinaunicomConfig();
        else
            return OtherModuleProvider.getInstance().loadSnmpConfig();
    }

    private String HandleModifyOtherModuleConfig(String requestParams){
        String[] split = Base64Helper.decode(requestParams).split("\\|");
        String type = split[0];
        JSONObject jsonObject = new JSONObject(split[1]);
        if(type.equals("Chinamobile"))//中国移动
            return OtherModuleProvider.getInstance().modifyChinamobileConfig(jsonObject);
        else if(type.equals("Chinaunicom"))//中国联通
            return OtherModuleProvider.getInstance().modifyChinaunicomConfig(jsonObject);
        else
            return OtherModuleProvider.getInstance().modifySnmpConfig(jsonObject);
    }

    private String HandleGetChinaunicomFSUID(String requestParams){
        String mdc = LicenseHelper.getMac();
        if(mdc.indexOf("-") > -1)
            mdc = mdc.replaceAll("-","");
        if(mdc.indexOf(":") > -1)
            mdc = mdc.replaceAll(":","");
        if(mdc.indexOf(" ") > -1)
            mdc = mdc.replaceAll(" ","");
        return mdc;
    }
}
