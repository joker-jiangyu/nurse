package nurse.utility;


import java.util.HashMap;

import org.apache.log4j.Logger;

import nurse.entity.persist.CollectRackData;
import nurse.webServer.RackServer;



public class CabinetRackUtility implements Runnable  {
	private static CabinetRackUtility instance = new CabinetRackUtility();
	public volatile boolean exit = false;
	/** 正在监听的服务   Key：CabinetId；Value：Port */
	private volatile HashMap<Integer, Integer> RackServerMaps = new HashMap<Integer, Integer>();
	/** 机架的资产数据  Key:CabinetId; Value:资产数据集 */
	private HashMap<Integer, HashMap<String, CollectRackData>> RackAssetsMaps = new HashMap<Integer, HashMap<String, CollectRackData>>();
	
	private Logger log = Logger.getLogger(CabinetRackUtility.class);
	
	public CabinetRackUtility(){}
	
	public static CabinetRackUtility getInstance() {
		return instance;
	}
	
	public void saveRackServer(HashMap<Integer, Integer> rsms){
		RackServerMaps = rsms;
	}
	
	public HashMap<Integer, Integer> getAllRackServer(){
		return RackServerMaps;
	}
	
	public HashMap<Integer, HashMap<String, CollectRackData>> getRackAssets(){
		return RackAssetsMaps;
	}
	
	public void run(){
		while(!exit){
			try {
				if(RackServerMaps == null || RackServerMaps.size() == 0){
					Thread.sleep(3000);
					continue;
				}
				
				//log.info("Start Run Date:"+new Date().toString());
				for(int cabinetId : RackServerMaps.keySet()){
					int port = RackServerMaps.get(cabinetId);
					
					CollectRackData recvData = null;
					
					while(true){
						recvData = new RackServer().RecvData(port);
						if(recvData == null) break;

						HashMap<String, CollectRackData> dataMap = new HashMap<String, CollectRackData>();
						if(RackAssetsMaps.containsKey(cabinetId)){
							dataMap = RackAssetsMaps.get(cabinetId);
						}
						dataMap.put(recvData.getCode(), recvData);
						
						RackAssetsMaps.put(cabinetId, dataMap);
						/*log.info("Port:"+port+", RackSize:"+RackAssetsMaps.size()+" CabinetId:"+
								cabinetId+", Size:"+RackAssetsMaps.get(cabinetId).size());*/
						
						Thread.sleep(1000);
						if(recvData.getCode().equals("A1")) break;
					}
				}
				//log.info("End Run Date:"+new Date().toString());
			} catch (Exception e) {
				log.error("CabinetRackUtility Run Exception:",e);
			}
		}
	}
	
/*	public synchronized String SendInfo(String command){
		if(this.exit) return "FF";
		System.out.println("启动线程   Date:"+new Date().toString());
		ExecutorService executorService = Executors.newSingleThreadExecutor();
    	FutureTask<String> future = new FutureTask<>(()->{
    		try {
    			Socket s = this.socket.accept();
    			RackServer rs = new RackServer(s, DataMap);
    			return rs.Send(command);
    		} catch (Exception e) {
    			log.error("SendInfo Exception:",e);
    			return "FF";
    		}
    	});
    	
    	executorService.execute(future);
		
		try {
			String result = future.get(60,TimeUnit.SECONDS);//超时任务 1分钟
			System.out.println("线程结束   Date:"+new Date().toString());
			return result;
		} catch (Exception e) {
			System.out.println("线程超时   Date:"+new Date().toString());
			try {
				this.socket.close();
			} catch (Exception e1) {}
			return "FF";
		}
	}*/
}