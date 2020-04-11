package nurse;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.Enumeration;
import java.util.Timer;
import java.util.TimerTask;

import nurse.logic.providers.ConfigureMoldProvider;
import org.apache.log4j.Logger;

import nurse.job.JobManager;
import nurse.logic.providers.ConfigCache;
import nurse.logic.providers.EquipmentProvider;
import nurse.logic.providers.SdogProvider;
import nurse.utility.BasePath;
import nurse.utility.MainConfigHelper;
import nurse.webServer.WebServer;

public class NurseApp {

	private static Logger log = Logger.getLogger(NurseApp.class);
	//private static JobManager jobManager = new JobManager();
	public static WebServer webServer = null;
	
	public static void main( String[] args ) throws IOException
	{
		try{
			//还原设备配置数据
			restoreEquipmentData();
			//sdog 喂狗
			startSdogServer();

			//根据MainConfig配置生成首页路径
			ConfigureMoldProvider.getInstance().LoadConfigureMoldHome();
			//MockData();
			ConfigCache.getInstance().Load();
			JobManager.getInstance().start();
			startWebServer();
		}catch(Exception ex)
		{
			log.error(ex);
			System.exit( -1 );
		}
	}
	
	public static void startWebServer()
	{
		String listenpot = MainConfigHelper.getConfig().listenPort;
		int port = Integer.parseInt(listenpot);

		String webdir = BasePath.getWebDirByEnv("web");
		File wwwroot = new File(webdir).getAbsoluteFile();
		
		try
		{
			//support ipv4
			java.lang.System.setProperty("java.net.preferIPv6Addresses", "false");
			java.lang.System.setProperty("java.net.preferIPv4Stack", "true");
			
			
			webServer = new WebServer( port, wwwroot, getLocalIP() );
			PublicVar.WebRoot = wwwroot;
			
			log.info("\r\nnurse version: " + NurseApp.class.getPackage().getImplementationVersion() + "\r\nweb server listen on:\r\nport:" + port + 
					" dir:" + wwwroot.getPath() + " ip:" + getLocalIP());
			
			try { System.in.read(); } catch( Throwable t ) {};
		}
		catch( IOException ioe )
		{
			log.error( "Couldn't start server:\n" + ioe );
			System.exit( -1 );
		}
	}

	private static InetAddress getLocalAddress(){
        try {
            Enumeration<NetworkInterface> b = NetworkInterface.getNetworkInterfaces();
            while( b.hasMoreElements()){
                for ( InterfaceAddress f : b.nextElement().getInterfaceAddresses())
                    if ( f.getAddress().isSiteLocalAddress())
                        return f.getAddress();
            }
        } catch (SocketException e) {
            e.printStackTrace();
        }
        return null;
    }
	
	private static String getLocalIP() throws SocketException {
		
		InetAddress IP = null;
		InetAddress hostIP = getLocalAddress();
		try {
			String listenIp = MainConfigHelper.getConfig().listenIp;
			if(!listenIp.isEmpty())
				IP=InetAddress.getByName(listenIp);
			else if (hostIP != null ){
				IP = hostIP;
			}
			else {
				IP = InetAddress.getLocalHost();
			}
		} catch (UnknownHostException e) {
			log.warn("can not get local ip, use localhost");
			return null;
		}
		
		//return "127.0.0.1";
		return IP.getHostAddress();		
	}
	
	private static void restoreEquipmentData(){
		Timer timer = new Timer();
	    timer.schedule(new TimerTask() {
	      public void run() {
	    	 EquipmentProvider.getInstance().RestoreEquipmentData();
	      }
	    },1000*60);
	}
	
	private static void startSdogServer(){
		SdogProvider instance = SdogProvider.getInstance();
		instance.start();
	}

//	private static void MockData()
//	{
//		StreamProcessor.getInstance().Mock();		
//	}
}
