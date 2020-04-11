package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.SystemStyleProvider;
import nurse.utility.MainConfigHelper;

public class SystemStyleDataHandler extends DataHandlerBase {

    private static final String SETSYSTEMSTYLE = "SetSystemStyle";
    private static final String GETSYSTEMSTYLE = "GetSystemStyle";


    public void Execute(HttpDataExchange req, HttpDataExchange rep) {
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemStyleDataHandler.SETSYSTEMSTYLE)) {
            rep.responseResult = HandSetSystemStyle(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(SystemStyleDataHandler.GETSYSTEMSTYLE)) {
            rep.responseResult = HandGetSystemStyle(req.requestParams);
        }
    }


    private String HandSetSystemStyle(String requestParams){
        //requestParams => Blue/White
        //修改\web\img登录页面的背景图文件名称
        SystemStyleProvider.getInstance().updateLoginFile(MainConfigHelper.getConfig().systemStyle,requestParams);
        //修改配置文件
        String res = MainConfigHelper.editLabelContent("systemStyle", requestParams);
        if(res.equals("OK")){
            //重新加载配置
            MainConfigHelper.loadConfigs();
            return requestParams;
        }
        return MainConfigHelper.getConfig().systemStyle;
    }

    private String HandGetSystemStyle(String requestParams){
        return MainConfigHelper.getConfig().systemStyle;
    }
}
