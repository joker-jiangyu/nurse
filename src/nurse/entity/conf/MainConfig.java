package nurse.entity.conf;

import java.util.ArrayList;

import nurse.entity.trasfer.HttpDataExchange;

public class MainConfig {

	public ArrayList<HttpDataExchange> httpDataExchanges = null;
	//public ArrayList<DataHandlerConfig> dataHandlers = null;
	public ArrayList<FeatureConfig> features = null;
	
	public String ipAddress = null;
	public String versions = "";
	public String mySql = "";
	public String listenPort = "";
	public String listenIp = "";
	public String realDataFromDB = "";
	public String loginPage = "";
	public String loginHome = "";
	public String emailNick = "";
	public String emailSubject = "";
	public String emailJetLag = "-8";
	public String showBaseType = "true";
	public String userTitle = "";
	public String userLogo = "";
	public String cacheDays = "";
	public String language = "";
	public String systemStyle = "";
	public String udpMonitorIp = "127.0.0.1";
	public String QRCodeTitle = "";
	public String QRCodeImage = "";
	public String loginUserName = "";
	public String loginPassword = "";
	public String logoutTime="";

	
	public MainConfig() {
		httpDataExchanges = new ArrayList<HttpDataExchange>();
		//dataHandlers = new ArrayList<DataHandlerConfig>();
		features = new ArrayList<FeatureConfig>();
	}

}
