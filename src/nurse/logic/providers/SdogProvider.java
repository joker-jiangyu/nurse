package nurse.logic.providers;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.net.DatagramPacket;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.log4j.Logger;

import nurse.webServer.UDPServer;

public class SdogProvider extends Thread{
	private static SdogProvider instance = new SdogProvider();
	private static Logger log = Logger.getLogger(SdogProvider.class);
	
	public static SdogProvider getInstance(){
		return instance;
	}
	
	public UDPServer server;
	private Lock lock = new ReentrantLock(); 
	
	public void init(int listenPort,int destPort){
    	try {
			server = new UDPServer();
			server.open(listenPort);
			server.destPort = destPort;
		} 
		catch (Exception e) 
		{
			log.error("Sdog Init : "+e);
		}
	}
	
	public void send(String data, int port)	{
		try	{
			if(port > 0){
				server.destPort = port;
			}
			if(server != null){
				server.send(data);
			}
		} 
		catch (Exception e)	{
			log.error("Sdog Send : "+e);
		}
	}
	
	public void run(){
		try {
			Thread.sleep(10000);
			if(server == null){
	    		init(10320,10120);
	    	}
			register();//注册
			while(true){
				processRecv();
			}
		} catch (Exception e) {
			log.error("Sdog Error : "+e);
		}
	}
	
	/** 初始化 */
	private void register(){
		try {
			//pgname=nurse`pid=443454`type=register`maxdeadtime=600
			RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
	        String name = runtime.getName();
	        int index = name.indexOf("@");
	        int pid = -1;
	        if (index != -1)
	            pid = Integer.parseInt(name.substring(0, index));
			if(pid != -1){
				String send = String.format("pgname=nurse`pid=%s`type=register`maxdeadtime=600", pid);
				send(send, 10120);
			}	
			log.info("Register Nurse PID:"+pid);
			lock.lock();
		} catch (Exception e) {
			log.error("register Exception ",e);
		}finally{  
            lock.unlock();  
        } 
	}
	
	/** 接收处理 */
	private void processRecv(){
		DatagramPacket recvPacket = null;
		try {
			Thread.sleep(10000);
			
			/*
				pgname=nurse`pid=443454`type=heartbeat
				pgname=nurse`pid=443454`type=unregister
			 */
			recvPacket = server.receive();
			if(recvPacket == null) return;
			
			String recvStr = new String(recvPacket.getData() , 0 , recvPacket.getLength());
			if(recvStr.length() <= 0) return;
			
			RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
	        String name = runtime.getName();
	        int index = name.indexOf("@");
	        int pid = -1;
	        if (index != -1)
	            pid = Integer.parseInt(name.substring(0, index));

	        String send = null;
			if(recvStr.equalsIgnoreCase("ok"))
				send = String.format("pgname=nurse`pid=%s`type=heartbeat", pid);
			else
				send = String.format("pgname=nurse`pid=%s`type=unregister", pid);
			send(send, 10120);
			
			lock.lock();
		} catch (Exception e) {
			log.error("processRecv Exception ",e);
		} finally{  
            lock.unlock();  
        } 
	}
	
	//注销看门狗
	public void unregister(){
		try {
			RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
	        String name = runtime.getName();
	        int index = name.indexOf("@");
	        int pid = -1;
	        if (index != -1)
	            pid = Integer.parseInt(name.substring(0, index));
			if(pid != -1){
				String send = String.format("pgname=nurse`pid=%s`type=unregister", pid);
				send(send, 10120);
			}	
			log.info("Unregister Nurse PID:"+pid);
			lock.lock();
		} catch (Exception e) {
			log.error("unregister Exception ",e);
		}finally{  
            lock.unlock();  
        }
	}
}
