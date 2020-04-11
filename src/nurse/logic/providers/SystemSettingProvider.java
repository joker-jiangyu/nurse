package nurse.logic.providers;

import java.io.*;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.JSONArray;

import nurse.utility.JsonHelper;



public class SystemSettingProvider {

	private static Logger log = Logger.getLogger(SystemSettingProvider.class);
	private static SystemSettingProvider ssp = new SystemSettingProvider();
	private static String saveHeartType = "Logout";
	public static Date saveHeartDate = null;
	private static Thread heartThread = null;
	
	private static String os = null;//保存当前系统类型
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}
	
	public static SystemSettingProvider getInstance(){
		return ssp;
	}
	/**
	 * 根据linux命令修改系统数据
	 * @param cmd_date
	 * @return OK：修改成功  ON：修改失败
	 */
	public String updateSystemSetting(String[] cmd_date){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}
		try { 
			Process pro = Runtime.getRuntime().exec(cmd_date); 
			pro.waitFor();
			System.out.println("Command:"+cmd_date[2]);
			
			BufferedReader read = new BufferedReader(new InputStreamReader(pro.getInputStream()));  
			String result = null;
			while((result = read.readLine())!=null){
				System.out.println("updata system info:"+result);
			}
			
			read.close();
			return "OK";
		} catch (Exception e) {  
			log.error("Unable to modify system info", e);	
			return "NO";
		} 
	}
	/**
	 * 根据linux命令获得系统数据
	 * @param cmd_date
	 * @return result
	 */
	public String getSystemData(String[] cmd_date){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}
		String result = null;
		BufferedReader read = null;
		Process pro = null;
		try { 
			pro = Runtime.getRuntime().exec(cmd_date);
			System.out.println("Command:"+cmd_date[2]);
			
			read = new BufferedReader(new InputStreamReader(pro.getInputStream()));  
			while((result = read.readLine())!=null){
				System.out.println("line:"+result);
				return result;
			}
			
		} catch (Exception e) {  
			log.error("command error:", e);
		} finally{
			try {
				if(pro != null) pro.waitFor();
				if(read != null) read.close();
			} catch (Exception e) {
				log.error("command error:", e);	
			}
		}
		return "";
	}
	
	public ArrayList<String> getSystemDataList(String[] cmd_date){
		//log.info("OsName:"+os);
		if(!os.equals("Linux") && !os.equals("linux")){
			return new ArrayList<String>();
		}
		ArrayList<String> list = new ArrayList<String>();
		String result = null;
		BufferedReader read = null;
		Process pro = null;
		try { 
			pro = Runtime.getRuntime().exec(cmd_date);
			System.out.println("Command:"+cmd_date[2]);
			read = new BufferedReader(new InputStreamReader(pro.getInputStream()));  
			while((result = read.readLine())!=null){
				//log.info("get systeam data:"+result);
				System.out.println("Line:"+result);
				list.add(result);
			}
			
		} catch (Exception e) {  
			log.error("command error:", e);
		} finally{
			try {
				if(pro != null) pro.waitFor();
				if(read != null) read.close();
			} catch (Exception e) {
				log.error("command error:", e);	
			}
		}
		return list;
	}
	
	/**
	 * 修改/home/utils/ipaddr文件
	 * @param ip,netmask,defaultGw
	 */
	public void updateIpaddr(String ip,String netmask,String defaultGw){
		FileWriter  writer = null;
		try {
			File file = new File("/home/utils/ipaddr");
			if(!file.exists()) file.createNewFile();
			
			writer = new FileWriter (file);
		    writer.write("#!/bin/sh\n");
		    writer.flush();//需要及时清掉流的缓冲区，万一文件过大就有可能无法写入了
		    writer.write(String.format("/sbin/ifconfig eth0 %s\n", ip));
		    writer.flush();//需要及时清掉流的缓冲区，万一文件过大就有可能无法写入了
		    writer.write(String.format("/sbin/ifconfig eth0 netmask %s\n",netmask));
		    writer.flush();//需要及时清掉流的缓冲区，万一文件过大就有可能无法写入了
		    writer.write(String.format("/sbin/route add default gw %s\n\n",defaultGw));
		    writer.flush();//需要及时清掉流的缓冲区，万一文件过大就有可能无法写入了
		} catch (Exception e) {
			log.error("fail to write to file:", e);
		}finally {
			try {
				if(writer != null) writer.close();
			} catch (IOException e) {
				log.error("fail to write to file:", e);
			}
		}
	}
	

    public boolean ping(String ipAddress, int pingTimes, int timeOut) {
        BufferedReader in = null;
        String pingCommand = null;
        Runtime r = Runtime.getRuntime();
        String osName = System.getProperty("os.name");
        if(osName.contains("Windows")){
            //将要执行的ping命令,此命令是windows格式的命令
            pingCommand = "ping " + ipAddress + " -n " + pingTimes    + " -w " + timeOut;
        }else{
            //将要执行的ping命令,此命令是Linux格式的命令
            //-c:次数,-w:超时时间(单位/ms)  ping -c 10 -w 0.5 192.168.120.206
            pingCommand = "ping " + " -c " + "4" + " -w " + "2 " + ipAddress;
        }
        try {
            //执行命令并获取输出
            Process p = r.exec(pingCommand);
            if (p == null) {
                return false;
            }
            in = new BufferedReader(new InputStreamReader(p.getInputStream()));
            int connectedCount = 0;
            String line = null;
            while ((line = in.readLine()) != null) {
                connectedCount += getCheckResult(line,osName);
            }
            return connectedCount >= 2 ? true : false;
        } catch (Exception ex) {
            return false;
        } finally {
            try {
                in.close();
            } catch (IOException e) {}
        }
    }
    
    private static int getCheckResult(String line,String osName) {
        if(osName.contains("Windows")){
            if(line.contains("TTL=")){
                return 1;
            }
        }else{
            if(line.contains("ttl=")){
                return 1;
            }
        }
        return 0;
    }
    
    
    public String shutdown(){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}
		
    	try {
    		//关数据库
        	String cmd1 = "/home/app/mysql/bin/mysqladmin shutdown";
    		String[] cmd_date1 = new String[]{"/bin/sh", "-c", cmd1};
    		updateSystemSetting(cmd_date1);

    		//关机
        	String cmd2 = "ps -ef | grep nurse.jar | xargs kill -9";
    		String[] cmd_date2 = new String[]{"/bin/sh", "-c", cmd2};
    		updateSystemSetting(cmd_date2);
    		return "OK";
		} catch (Exception e) {
			return "ERROR";
		}
    }
    
    public String reboot(){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}

    	try {
    		//清理多余文件
			String[] cmd_date2 = new String[]{"/bin/sh", "-c", "/home/utils/udisk_clear.sh"};
			updateSystemSetting(cmd_date2);

			//关数据库
			String[] cmd_date1 = new String[]{"/bin/sh", "-c", "/home/app/mysql/bin/mysqladmin shutdown"};
			updateSystemSetting(cmd_date1);

    		String[] cmd_date = new String[]{"/bin/sh", "-c", "/sbin/reboot"};
    		return updateSystemSetting(cmd_date);
		} catch (Exception e) {
			return "ERROR";
		}
    }
    
    
    public String getWinLinuxIpAddress(){
		ArrayList<String> hostAddress = new ArrayList<String>();
    	if(!os.equals("Linux") && !os.equals("linux")){
    		hostAddress = getLocalIpAddress();
		}else{
			String[] cmd_date = new String[]{"/bin/sh", "-c",
			"/sbin/ifconfig eth0 | grep 'inet addr' | awk '{ print $2}' | awk -F: '{print $2}'"};
			String ip = SystemSettingProvider.getInstance().getSystemData(cmd_date);//IP
			hostAddress.add(ip);
		}
    	StringBuffer sb = new StringBuffer("[");
    	int i = 0;
    	for(String ip : hostAddress){
    		if(i == 0)
    			sb.append(String.format("{\"IP\":\"%s\"}", ip));
    		else
    			sb.append(String.format(",{\"IP\":\"%s\"}", ip));
    		i ++;
    	}
    	sb.append("]");
    	return sb.toString();
    }
    
    private ArrayList<String> getLocalIpAddress() {  
    	ArrayList<String> hostAddress = new ArrayList<String>();
    	try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {
                 NetworkInterface intf = en.nextElement();
                for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();)
                  {
                    InetAddress inetAddress = enumIpAddr.nextElement();
                    if (!inetAddress.isLoopbackAddress() && (inetAddress instanceof Inet4Address))
                    {
                    	hostAddress.add(inetAddress.getHostAddress().toString());
                    }
                }
            }
            return hostAddress;
        }
        catch (Exception ex){
            ex.printStackTrace();
        }
        return new ArrayList<String>();
    }

    public String reset(){
		System.out.println("ReSet");
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}
		//echo "ftproot:hello123" | chpasswd 给ftproot用户添加密码

		try {
			String[] cmd_date1 = new String[]{"/bin/sh", "-c", "cat /home/app/web/web/data/etc/passwd.ini > /etc/passwd"};
			updateSystemSetting(cmd_date1);
            String[] cmd_date2 = new String[]{"/bin/sh", "-c", "cat /home/app/web/web/data/etc/shadow.ini > /etc/shadow"};
            updateSystemSetting(cmd_date2);
            String[] cmd_date3 = new String[]{"/bin/sh", "-c", "ln -s /bin/busybox /bin/chpasswd"};
            updateSystemSetting(cmd_date3);
			String[] cmd_date4 = new String[]{"/bin/sh", "-c", "echo 'ftproot:hello123' | chpasswd"};
			return updateSystemSetting(cmd_date4);
		} catch (Exception e) {
			return "ERROR";
		}
	}

	public String restartIViewBrowser(String ip){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "NotLinuxSystem";
		}

		writerBrowser(ip);
		try {
			startBrowser();
			return "OK";
		} catch (Exception e) {
			return "ERROR";
		}
	}

	/**
	 * 重启iView内置浏览器
	 */
	public void startBrowser(){
		String[] cmd = new String[]{"/bin/sh", "-c", "sudo -u linaro /home/linaro/start_browser.sh "};
		updateSystemSetting(cmd);
		log.info("CMD:"+cmd[2]);
	}


	/** 重写文件 */
	public boolean writerBrowser(String ip){
		FileWriter  writer = null;
		try {
			File file = new File("/home/linaro/start_browser.sh");
			if(!file.exists()) file.createNewFile();

			writer = new FileWriter (file);
			writer.write("#!/bin/sh\n");
			writer.flush();
			//writer.write(String.format("DISPLAY=:0.0 chromium %s  --start-maximized --kiosk\n",ip));
			//--start-maximized:默认最大化  --disable-pinch:禁止拉伸  --overscroll-history-navigation=0:禁止左右返回上一级
			writer.write("DISPLAY=:0.0 chromium 127.0.0.1/login.html  --start-maximized --disable-pinch --kiosk --overscroll-history-navigation=0\n");
			writer.flush();
			return true;
		} catch (Exception e) {
			log.error("fail to write to file:", e);
			return false;
		}finally {
			try {
				if(writer != null) writer.close();
			} catch (IOException e) {
				log.error("fail to write to file:", e);
				return false;
			}
		}
	}

	/**
	 * 访问系统名称为Linux并且访问IP是本机IP时，注册心跳；5分钟未收到心跳调用重启浏览器命令
	 * @param systemName 系统名称：Windows/Linux
	 * @param heartType 心跳类型：Register/Heartbeat/Logout
	 * @param inetIp 访问IP
	 * @return 反馈心跳包：Register-Succeed/Register-Failure
	 */
	public String browserHeartbeat(String systemName,String heartType,String inetIp){
		//log.info("Heartbeat SystemName:"+systemName+", HeartType:"+heartType+", IP:"+inetIp);
		if(systemName != null || heartType != null){
			if(systemName.equals("UNIX")){
				if(heartType.equals("Register") || heartType.equals("Heartbeat")){
					if(!saveHeartType.equals(heartType))
						saveHeartType = heartType;

					saveHeartDate = new Date();

					if(heartThread == null)
						openHeartThread();
				}else{
					saveHeartDate = null;
					closeHeartThread();
				}
			}
		}
		return "IllegalSystem";
	}

	/** 启动监控线程 */
	private void openHeartThread(){
		HeartThread.getInstance().exit = false;
		heartThread = new Thread(HeartThread.getInstance());
		heartThread.start();
		log.info("Open HeartThread!");
	}

	/** 关闭监控线程 */
	private void closeHeartThread(){
		HeartThread.getInstance().exit = true;
		log.info("Close HeartThread!");
	}
}

class HeartThread implements Runnable{
	private Logger log = Logger.getLogger(HeartThread.class);
	public volatile boolean exit = true;

	private static HeartThread instance = new HeartThread();
	public static HeartThread getInstance() {
		return instance;
	}

	@Override
	public void run() {
		while(!exit){
			try {
				if(SystemSettingProvider.getInstance().saveHeartDate != null){
					Date currentDate = new Date();//当前时间
					Date historyDate = SystemSettingProvider.getInstance().saveHeartDate;//心跳的时间

					long time = currentDate.getTime() - historyDate.getTime();
					//log.info("Date Current:"+currentDate+", History:"+historyDate);
					//log.info("Date Differ:"+time);

					if(time > (60*10*1000)){//十分钟
						SystemSettingProvider.getInstance().startBrowser();
                        SystemSettingProvider.getInstance().saveHeartDate = currentDate;
					}
				}

				Thread.sleep(30000);
			}catch (Exception e){
				log.error("HeartThread Run Exception:",e);
			}
		}
	}
}


