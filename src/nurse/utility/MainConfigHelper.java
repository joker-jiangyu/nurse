package nurse.utility;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.DomDriver;

import nurse.PublicVar;
import nurse.entity.conf.DataHandlerConfig;
import nurse.entity.conf.FeatureConfig;
import nurse.entity.conf.MainConfig;
import nurse.entity.trasfer.HttpDataExchange;

public class MainConfigHelper {

	private static MainConfig config = null;
	private static HashMap<String, HttpDataExchange> httpDataExchanges = null;
	private static Logger log = Logger.getLogger(MainConfigHelper.class);

	public static String editLabelContent(String label, String content) {
		//System.out.println("Label:"+label+", Content:"+content);
		Document doc = getDocument();
		Element rootElement = doc.getRootElement();
		Element labelElement = rootElement.element(label);
		//System.out.print("Old:"+labelElement.getText());
		labelElement.setText(content);
		//System.out.println(", New:"+labelElement.getText());
		if (reWriter(doc)) {
			return "OK";
		} else {
			return "Error";
		}

	}

	public static boolean reWriter(Document doc) {
		String configPath = getConfigPath();
		try {
			OutputFormat format = new OutputFormat();
			format.setEncoding("UTF-8");
			format.setExpandEmptyElements(true);
			XMLWriter writer = new XMLWriter(new FileWriter(configPath), format);
			writer.write(doc);
			writer.close();
			return true;
		} catch (Exception e) {
			log.error(e);
		}
		return false;
	}

	public static String getLabelContent(String label) {
		Document doc = getDocument();
		return doc.getRootElement().elementText(label);
	}

	public static Document getDocument() {
		SAXReader saxReader = new SAXReader();
		try {
			Document doc = saxReader.read(getConfigPath());
			return doc;
		} catch (Exception e) {
			log.error(e);
		}
		return null;
	}

	private static String getConfigPath() {
		URL url = BasePath.class.getProtectionDomain().getCodeSource().getLocation();
		try {
			String filePath = URLDecoder.decode(url.getPath(), "utf-8");
			String resultPath = filePath.substring(0, filePath.lastIndexOf("/") + 1) + "/mainconfig.xml";
			resultPath = resultPath.replace("//","/");
			return resultPath;
		} catch (Exception e) {
			log.error(e);
		}
		return null;
	}

	public static HttpDataExchange getReponse(HttpDataExchange hde) {
		if (httpDataExchanges == null) {
			loadConfigs();
		}

		String key = hde.requestCommand + hde.requestParams;

		return httpDataExchanges.getOrDefault(key, null);
	}

	public static MainConfig getConfig() {
		if (config == null) {
			loadConfigs();
		}
		return config;
	}

	public static void saveConfigs() {
		File f = new File(PublicVar.class.getClass().getResource("/mainconfig.xml").getPath());
		try {
			URL url = BasePath.class.getProtectionDomain().getCodeSource().getLocation();
			String filePath = URLDecoder.decode(url.getPath(), "utf-8");// 转化为utf-8编码
			if (filePath.endsWith(".jar")) {// 可执行jar包运行的结果里包含".jar"
				// 截取路径中的jar包名
				filePath = filePath.substring(0, filePath.lastIndexOf("/") + 1);
				f = new File(filePath + "/mainconfig.xml");
			}
		} catch (Exception e) {
			log.error(e);
		}

		XStream xs = new XStream();

		try {

			OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(f.getAbsolutePath()), "UTF-8");

			xs.toXML(config, writer);

		} catch (Exception e1) {
			e1.printStackTrace();
		}
	}

	public static void loadConfigs() {
		// File f = new File(BasePath.combine(BasePath.getPath(),"mainconfig.xml"));

		XStream xs = new XStream(new DomDriver());
		config = new MainConfig();

		httpDataExchanges = new HashMap<String, HttpDataExchange>();

		try {
			Object obj = null;
			while (obj == null){
				try{
					// new InputStreamReader(is,"UTF-8"));
					InputStream f = PublicVar.class.getClass().getResourceAsStream("/mainconfig.xml");
					URL url = BasePath.class.getProtectionDomain().getCodeSource().getLocation();
					String filePath = URLDecoder.decode(url.getPath(), "utf-8");// 转化为utf-8编码
					if (filePath.endsWith(".jar")) {// 可执行jar包运行的结果里包含".jar"
						// 截取路径中的jar包名
						filePath = filePath.substring(0, filePath.lastIndexOf("/") + 1);
						f = new FileInputStream(filePath + "/mainconfig.xml");
					}
					obj = xs.fromXML(f);
				}catch (Exception e){
					System.out.println("XStream.fromXML Error! Object:"+obj);
					Thread.sleep(500);
				}
			}

			config = (MainConfig) obj;
			if (config.httpDataExchanges != null) {
				for (HttpDataExchange he : config.httpDataExchanges) {
					httpDataExchanges.put(he.requestCommand.concat(he.requestParams), he);
				}
			}

		} catch (Exception ex) {
			log.error(ex);
		}
	}

	/*public static ArrayList<DataHandlerConfig> getDataHandlerConfig() {
		if (config == null) {
			loadConfigs();
		}

		return config.dataHandlers;
	}*/

	public static ArrayList<FeatureConfig> getFeatureConfig() {
		if (config == null) {
			loadConfigs();
		}

		return config.features;
	}

}
