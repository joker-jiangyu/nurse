package nurse.utility;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.DomDriver;
import nurse.PublicVar;
import nurse.entity.conf.DataHandlerConfig;
import nurse.entity.conf.HandlerConfig;
import nurse.entity.conf.MainConfig;
import nurse.entity.trasfer.HttpDataExchange;
import org.apache.log4j.Logger;

import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;

public class HandlerConfigHelper {

    private static HandlerConfig config = null;
    private static Logger log = Logger.getLogger(HandlerConfigHelper.class);

    public static void loadConfigs() {
        // File f = new File(BasePath.combine(BasePath.getPath(),"mainconfig.xml"));

        XStream xs = new XStream(new DomDriver());
        config = new HandlerConfig();

        try {
            Object obj = null;
            while (obj == null){
                try{
                    // new InputStreamReader(is,"UTF-8"));
                    InputStream f = PublicVar.class.getClass().getResourceAsStream("/handlerconfig.xml");
                    URL url = BasePath.class.getProtectionDomain().getCodeSource().getLocation();
                    String filePath = URLDecoder.decode(url.getPath(), "utf-8");// 转化为utf-8编码
                    if (filePath.endsWith(".jar")) {// 可执行jar包运行的结果里包含".jar"
                        // 截取路径中的jar包名
                        filePath = filePath.substring(0, filePath.lastIndexOf("/") + 1);
                        f = new FileInputStream(filePath + "/handlerconfig.xml");
                    }
                    obj = xs.fromXML(f);
                }catch (Exception e){
                    System.out.println("XStream.fromXML Error! Object:"+obj);
                    Thread.sleep(500);
                }
            }

            config = (HandlerConfig) obj;

        } catch (Exception ex) {
            log.error(ex);
        }
    }

    public static ArrayList<DataHandlerConfig> getDataHandlerConfig() {
        if (config == null) {
            loadConfigs();
        }

        return config.dataHandlers;
    }
}
