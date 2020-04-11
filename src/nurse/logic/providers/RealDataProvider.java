package nurse.logic.providers;
import java.lang.Thread;
import java.net.DatagramPacket;
import java.text.SimpleDateFormat;
import java.util.*;
import nurse.webServer.*;
import nurse.entity.persist.*;
import java.util.Date;

public class RealDataProvider extends Thread
{
	public UDPServer server;
	private Map<Integer,Map<Integer,RealData>> map; 
	private Map<Integer,Date> subMap;
	private static Object lock=new Object(); 
	private static Object lock2=new Object();
	Date dtOld = new Date();

	public void init(int listenPort,int destPort){
    	try {
    		synchronized(lock){
    			if(server == null || server.destAddr == null || server.server == null){
					server = new UDPServer();
					server.open(listenPort);
					server.destPort = destPort;
					System.out.println("open listen port"+listenPort + ";dest port" + destPort+";ip:"+server.destAddr);
    			}
				if(map == null){
				map = new HashMap<Integer,Map<Integer,RealData>>();
				}
				if(subMap == null){
					subMap = new HashMap<Integer,Date>();
				}
    		}
		} 
		catch (Exception e) 
		{
			e.printStackTrace(); 
		}
	}
	
	public void send(String data, int port)	{
		try	{
				if(server == null){
		    		init(5999,5888);
		    	}
				if(port > 0){
					server.destPort = port;
				}
				
				if(server != null){
					server.send(data);
				}
		} 
		catch (Exception e)	{
			e.printStackTrace(); 
		}
	}
	
	public void processRecv(){
		try {

			if(server == null){
	    		init(5999,5888);
	    	}
    		String recvStrAll="";
			DatagramPacket recvPacket = null;
			if(server == null)
			{
				Thread.sleep(100);
				return;
			}
			recvPacket = server.receive();
			if(recvPacket == null)
			{
				Thread.sleep(100);
				return;
			}
			String recvStr = new String(recvPacket.getData() , 0 , recvPacket.getLength());

			recvStrAll = recvStr;
			
			if(recvStrAll.length() <= 0)
			{
				Thread.sleep(100);
				return;
			}
			
			/*SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss.SSS");
			System.out.println("recv length:" + recvStr.length()+" date:"+sdf.format(new Date()));
			System.out.println("recv:" + recvStr);*/
			
			//Map<Integer,RealData> mapRealData = null;
			String[] str = recvStrAll.split("\\;");
			//int equipId = 0;
			synchronized(lock){
				for (int i = 0 ; i < str.length ; i++ )	{
					RealData data = new RealData();
					data.String2Data(str[i]);
					
					if(data.EquipId > 0){
						//更新数据到ActiveSignalCache中
						data.updateActiveSignalCache();
					}else{
						continue;
					}
					
					if(i%10 == 0){
						Thread.sleep(1);
					}
				}
			}
			Thread.sleep(1);
		} 
		catch (Exception e){
			e.printStackTrace(); 
		}
    	finally{   
        } 
	}
    public void run(){
    	if(server == null){
    		init(5999,5888);
    	}
		while(true)	{
			try {
				Thread.sleep(10);
			    processRecv();
			} catch (InterruptedException e) {
			}
		}
    }
  
    public void subscribeByDevice(int equipId){
		Boolean isFirst = false;
    	if(subMap.containsKey(equipId))
    	{
    		dtOld = subMap.get(equipId);
    	}
    	else
    	{
    		isFirst = true;
    	}
    		
    	Date dtNow = new Date();
    	long intervalMill = Math.abs(dtNow.getTime() - dtOld.getTime());
    		
    	if(intervalMill > 60 * 1000 || isFirst || equipId==8888)
		{
    		send(String.valueOf(equipId)+",-1;",0);
			dtOld = dtNow;
	    	subMap.put(equipId, dtNow);
		}
    }
    
    public List<RealData> GetData(int equipId) {
    	List<RealData> list = null;
    	
    	try{
			//System.out.println("Total Data Size:"+map.size());
    		if(map == null)
    		{
    			init(5999,5888);
    		}
    		synchronized(lock2){
    			Boolean isFirst = false;
	    		if(subMap != null && subMap.containsKey(equipId))
	    		{
	    			dtOld = subMap.get(equipId);
	    		}
	    		else
	    		{
	    			isFirst = true;
	    		}
    		Date dtNow = new Date();
    		long intervalMill = Math.abs(dtNow.getTime() - dtOld.getTime());
	    		if(intervalMill > 60 * 1000 || isFirst || equipId==8888)
    		{
    		send(String.valueOf(equipId)+",-1;",0);
    			dtOld = dtNow;
	    			subMap.put(equipId, dtNow);
    		}
    		}
    		synchronized(lock){
    			list = new ArrayList();
    			//��ȡ�����豸ʵʱ����
	    		if(equipId > 0){
	    			if(map.containsKey(equipId)){
	    				Map<Integer,RealData> mapRealData = map.get(equipId);
	    				if(mapRealData == null)
	    				{
	    					return list;
	    				}
	    				for(Map.Entry<Integer,RealData> e : mapRealData.entrySet()){     
	    					list.add(e.getValue());   
	    				}  
	    			}
	    		}
	    		//��ȡ�����豸ʵʱ����
	    		else if(map.size() > 0){
	    			for (Map.Entry<Integer, Map<Integer,RealData>> entry : map.entrySet()) {
	    				Map<Integer,RealData> mapRealData = entry.getValue();
	    				if(mapRealData == null)
	    				{
	    					continue;
	    				}
	    				for(Map.Entry<Integer,RealData> e : mapRealData.entrySet()){     
	    					list.add(e.getValue());   
	    					Thread.sleep(1);
	    				} 
	    			}
	    		}
    		}
    		Thread.sleep(10);
	    } 
		catch (Exception e)	{
			e.printStackTrace(); 
		}
		finally	{   
	    } 
    	
    	return list;
    }
    
    public void close() {
    	try	{
    		server.close();
	    } 
		catch (Exception e)	{
			e.printStackTrace(); 
		}
    }
}