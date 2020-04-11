package nurse.logic.providers;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import nurse.logic.handlers.LanguageDataHandler;
import org.apache.log4j.Logger;

import nurse.common.DataRow;
import nurse.common.DataTable;
import nurse.entity.persist.AssetRack;
import nurse.entity.persist.AssetsManager;
import nurse.entity.persist.Cabinet;
import nurse.entity.persist.CollectRackData;
import nurse.utility.CabinetRackUtility;
import nurse.utility.DatabaseHelper;

public class AssetRackManagerProvider {
	private static Logger log = Logger.getLogger(AssetRackManagerProvider.class);
	private static final AssetRackManagerProvider instance = new AssetRackManagerProvider();
	
	/** 正在监听的服务   Key：CabinetId；Value：Port */
	private HashMap<Integer, Integer> RackServerMaps = new HashMap<Integer, Integer>();
	/** 机架状态  Key：CabinetId；Value：机架状态，0中断，1正常，2告警，3变更，4关闭监听 */
	private HashMap<Integer, Integer> RackStatus = new HashMap<Integer, Integer>();
	/** A1的内容   Key：CabinetId；Value：HexData */
	private HashMap<Integer, String> A1HexData = new HashMap<Integer, String>();
	
	private int RackId = 0;
	
	public static AssetRackManagerProvider getInstance() {
		return instance;
	}

	/** 服务器监听机架  */
	public void startRackServer(){
		StartRackServers(-1, -1);
		CabinetRackUtility.getInstance().saveRackServer(RackServerMaps);
		new Thread(CabinetRackUtility.getInstance()).start();
	}
	
	/** 定时解析集合中的数据，分别为资产条状态、机架设备的资产信息 */
	public synchronized void factory(){
		if(RackServerMaps == null || RackServerMaps.size() == 0) return;
		HashMap<Integer, HashMap<String, CollectRackData>> rackAssets = CabinetRackUtility.getInstance().getRackAssets();
		for(Integer cabinetId : rackAssets.keySet()){
			try{
				HashMap<String, CollectRackData> rackData = rackAssets.get(cabinetId);
				//log.info("1 CabinetId:"+cabinetId+", Rack Data Size:"+rackData.size()+", Value Size:"+rackData.values().size());
				//计较数据
				HashMap<String, ArrayList<AssetsManager>> hashMap = compareRackData(cabinetId,rackData);
				if(hashMap == null || hashMap.size() == 0) continue;
				//根据Hash集合添加、删除、修改资产信息
				changeAssetsManager(hashMap);
			}catch (Exception e){
				log.error("AssetRackManagerProvider factory Exception:",e);
				continue;
			}
		}
	}
	
	
	/**  比较新的A1数据和原来的A1数据，返回变更集合；Return <"下架",List>  */
	private HashMap<String, ArrayList<AssetsManager>> compareRackData(int cabinetId, HashMap<String, CollectRackData> rackData){
		try{
			// 机架状态集  RackStatus  | 原来的A1数据  A1HexData
			if(rackData == null || !rackData.containsKey("A1")) return null;
			//获取新数据
			String newA1Data = rackData.get("A1").getValue();
			//获取原数据
			String oldA1Data = "";
			if(A1HexData != null && A1HexData.containsKey(cabinetId))
				oldA1Data = A1HexData.get(cabinetId);
			else{
				List<CollectRackData> list = new ArrayList<CollectRackData>(rackData.values());
				//机架状态 连接ing 改为 正常
				UpdateRackStatus(cabinetId, 1, list.get(0).getValue());
				RackStatus.put(cabinetId, 1);
			}
			//数据不变
			if(oldA1Data.equals(newA1Data)) return null;
			//获取原来的机柜资产信息集合
			ArrayList<AssetsManager> oldAssetsList = SelectAssetsManager(String.valueOf(cabinetId));

			//解析最新的机柜资产信息集合
			ArrayList<AssetsManager> newAssetsList = parseA1Data(cabinetId,newA1Data);
			//比较机柜资产信息差异，参数2原数据，参数3新数据
			HashMap<String, ArrayList<AssetsManager>> hashMap = compareAssetsManager(cabinetId, oldAssetsList, newAssetsList);

			//存储最新的A1数据
			A1HexData.put(cabinetId, newA1Data);
			return hashMap;
		}catch (Exception e){
			log.error("compareRackData Exception:",e);
			return null;
		}
	}
	
	/**  解析A1的数据为机柜资产信息集合  */
	private ArrayList<AssetsManager> parseA1Data(int cabinetId, String data){
		//String devCode = getValueByKey(data,5,6);//机架编号
		//int moduleNum = hexToDecimal(getValueByKey(data,11,1));//模块数量
		int uNumber = hexToDecimal(getValueByKey(data,12,1)).intValue();//机架U高
		//从13Byte开始
		data = getValueByKey(data,13,-1);
		//每34Byte一段
		ArrayList<AssetsManager> rams = new ArrayList<AssetsManager>();
		while (data.length() >= 102) {
			//01 0E 32 30 31 38 31 30 32 30 30 30 30 32 40 49 4D 55 31 30 32 30 00 00 00 00 00 00 00 00 00 00 00 00
			//01 => 占1U位[1字节]
			//0E => 从上往下数第14个位置[1字节]
			//... => 资产SN号;40分割,前:资产编号,后:设备型号[32字节]
			AssetsManager ram = new AssetsManager();
			ram.cabinetId = cabinetId;
			String parm = getValueByKey(data,0,34);
			ram.uHeight = hexToDecimal(getValueByKey(parm,0,1)).intValue();
			int uIndex = hexToDecimal(getValueByKey(parm,1,1)).intValue();
			String snCode = getValueByKey(parm,2,-1);
			String[] cot = getCodeOrStyle(snCode);
			ram.assetsCode = cot[0];
			ram.assetStyle = cot[1];
			data = getValueByKey(data,34,-1);
			// 从下往上数的下标
			ram.uIndex = uNumber - uIndex - (ram.uHeight-1);
			rams.add(ram);
		}
		return rams;
	}
	
	/** 比较机柜资产信息；返回变更集合；Return <"下架",List> */
	private HashMap<String, ArrayList<AssetsManager>> compareAssetsManager(int cabinetId, ArrayList<AssetsManager> oldList, ArrayList<AssetsManager> newList){
		HashMap<String, ArrayList<AssetsManager>> hashMap = new HashMap<String, ArrayList<AssetsManager>>();
		//log.info("1 oldA1Data :"+oldList == null ? "null":oldList.size()+", newA1Data :"+newList==null?"null":newList.size());
		if(oldList == null || oldList.size() == 0){
			if(newList != null && newList.size() > 0){
				hashMap.put("上架", newList);
				return hashMap;
			}
			return null;
		}
		if(newList == null || newList.size() == 0){
			hashMap.put("下架", oldList);
			return hashMap;
		}
		
		//下架
		ArrayList<AssetsManager> delList = newAssetsManager(oldList, newList);
		if(delList != null && delList.size() > 0)
			hashMap.put("下架", delList);
		//上架
		ArrayList<AssetsManager> addList = newAssetsManager(newList, oldList);
		if(addList != null && addList.size() > 0)
			hashMap.put("上架", addList);
		//新的和旧的不同
		ArrayList<AssetsManager> diffList = diffAssetsManager(newList, oldList);
		if(diffList != null && diffList.size() > 0)
			hashMap.put("变更", diffList);
		
		//log.info("CompareAssets OldList Size:"+(oldList == null ? 0 : oldList.size())+", NewList Size:"+
		//		(newList == null ? 0 : newList.size())+", HashMap Size:"+(hashMap == null ? 0 : hashMap.size()));
		return hashMap;
	}
	
	private ArrayList<AssetsManager> newAssetsManager(ArrayList<AssetsManager> a, ArrayList<AssetsManager> b){
		ArrayList<AssetsManager> list = new ArrayList<AssetsManager>();
		for(AssetsManager x : a){
			boolean isSame = false;//不存在
			for(AssetsManager y : b){
				if(x.assetsCode.equals(y.assetsCode))
					isSame = true;//存在
			}
			if(!isSame) list.add(x);
		}
		return list;
	}
	
	private ArrayList<AssetsManager> diffAssetsManager(ArrayList<AssetsManager> a, ArrayList<AssetsManager> b){
		ArrayList<AssetsManager> list = new ArrayList<AssetsManager>();
		for(AssetsManager x : a){
			int isSame = 0;//不存在
			for(AssetsManager y : b){
				if(x.assetsCode.equals(y.assetsCode)){
					isSame = 1;//存在，不相同
					if(x.assetStyle.equals(y.assetStyle))
						if(x.uIndex == y.uIndex)
							if(x.uHeight == y.uHeight)
								isSame = 2;//相同
				}
			}
			if(isSame == 1) list.add(x);
		}
		return list;
	}
	
	/**  根据Key值操作资产信息表  */
	private void changeAssetsManager(HashMap<String, ArrayList<AssetsManager>> hashMap){
		//log.info("changeAssetsManager Start! hashMap Size:"+hashMap.size());
		// 资产操作日志 saveAssetsManagerOperate("admin", 1, "自动上报", cabinetId, null);
		for(String key : hashMap.keySet()){
			ArrayList<AssetsManager> list = hashMap.get(key);
			//log.info("hashMap Key:"+key+", List Size:"+list.size());
			for(AssetsManager am : list){
				//log.info("Change Assets CabinetId:"+am.cabinetId+", AssetsCode:"+am.assetsCode+", UIndex:"+am.uIndex+", UHeight:"+am.uHeight);
				int type = 1,status = 1,aStatus = 1;
				if(key.equals("下架")){
					status = 2;//机架状态
					aStatus = 0;//资产状态
				}else{
					if(key.equals("上架")) type = 5;
					else if(key.equals("变更")) type = 6;
				} 
				//机柜状态
				UpdateRackStatus(am.cabinetId, status, null);
				RackStatus.put(am.cabinetId, status);
				//修改数据库的资产
				insertAssetsManager(am.cabinetId, am.assetsCode, am.assetStyle, am.uIndex, am.uHeight, String.valueOf(aStatus));
				saveAssetsManagerOperate("admin", type, 1, am.cabinetId, am.assetsCode, String.valueOf(am.uIndex), String.valueOf(am.uHeight));
			}
		}
	}
	
	/** cabinetId=-1;启动所有，其他启动单独的服务，并添加到集合中 */
	public String StartRackServers(int cabinetId, int port){
		try {
			if(cabinetId == -1){
				ArrayList<AssetRack> allRack = SelectAllRack();
				if(allRack == null || allRack.size() == 0) return "TableNotData";
				RackServerMaps.clear();//删除所有
				
				for(AssetRack item : allRack){
					if(item.Monitoring == 1)
						RackServerMaps.put(item.CabinetId, item.ServerPort);
				}
				CabinetRackUtility.getInstance().saveRackServer(RackServerMaps);
				return "Succeed";
			}else{
				if(RackServerMaps.containsKey(cabinetId)) return "CabinetIdExisted";
				
				RackServerMaps.put(cabinetId, port);
				CabinetRackUtility.getInstance().saveRackServer(RackServerMaps);
				return "Succeed";
			}
		} catch (Exception e) {
			log.error("StartRackServers Exception:",e);
			return "Error";
		}
	}
		
	/** cabinetId=-1;停止所有，其他停止单独的服务，并删除集合中的 */
	public boolean CloseRackServerMaps(int cabinetId){
		try {
			if(cabinetId == -1){
				RackServerMaps.clear();
				CabinetRackUtility.getInstance().saveRackServer(RackServerMaps);
				return true;
			}else{
				if(!RackServerMaps.containsKey(cabinetId)) return false; 
				
				//删除集合中的服务
				RackServerMaps.remove(cabinetId);
				CabinetRackUtility.getInstance().saveRackServer(RackServerMaps);
				return true;
			}
		} catch (Exception e) {
			log.error("CloseRackServerMaps Exception:",e);
			return false;
		}
	}
	
	/** 向资产条发送内容 */
	/*public String SendRackServers(int cabinetId, String command){
		if(!RackServerMaps.containsKey(cabinetId)) return "NotCabinetId";

		for(Integer key : RackServerMaps.keySet()){
			if(key == cabinetId){
				log.info("SendRackServers");
				CabinetRackUtility cru = RackServerMaps.get(key);
				return cru.SendInfo(command);
			}
		}
		return "NotData";
	}*/
	
	//DeBug Print Recv Data
	/*public void printDataMaps(){
		log.info("Print List Data  ------------- ");
		for(Integer key : RackServerMaps.keySet()){
			CabinetRackUtility cru = RackServerMaps.get(key);
			log.info("CabinetId:"+key+" -V-");
			for(String item : cru.getRackDatas().keySet()){
				String val = cru.getRackDatas().get(item);
				log.info("Key:"+item+" ,Value:"+val);
			}
		}
		log.info("Print List Data  ------------- ");
	}*/ 
	
	/** 查询所有资产条信息 */
	public ArrayList<AssetRack> SelectAllRack(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT A.*,C.`Name` AS 'Name',(SELECT CabinetUHeight FROM Mdc LIMIT 1) AS 'TotalSpace',");
			sb.append("(SELECT SUM(UHeight) FROM TBL_AssetsManager B WHERE B.CabinetId = A.CabinetId AND B.`Status` <> '0') AS 'SurplusSpace' ");
			sb.append("FROM TBL_CabinetRackAssets A ");
			sb.append("LEFT JOIN Cabinet C ON A.CabinetId = C.Id ");
			sb.append("GROUP BY A.CabinetId;");
			DataTable dt = dbHelper.executeToTable(sb.toString());
			return AssetRack.fromRackDataTable(dt);
		} catch (Exception e) {
			log.error("SelectAllRack Error : " + e);
			return new ArrayList<AssetRack>();
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
	}
	
	//获取所有的Cabinet表的配置
	public List<Cabinet> SelectAllCabinet(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT * FROM Cabinet;";
			DataTable dt = dbHelper.executeToTable(sql);
			return Cabinet.fromDataTable(dt);
		} catch (Exception e) {
			log.error("SelectAllCabinet Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return new ArrayList<Cabinet>();
	}
	
	public boolean InsertCabinetRack(String cabinetId, String ip, String port){
		boolean flag = false;
		DatabaseHelper dbHelper = null;
		try {
			int cid = Integer.parseInt(cabinetId);
			//启动监控服务器
			String result = StartRackServers(cid,Integer.parseInt(port));
			if(result.equals("Succeed")){
			    //将数据存储到数据库中
				dbHelper = new DatabaseHelper();
				String sql = String.format("INSERT INTO TBL_CabinetRackAssets(RackId,CabinetId,RackIP,RackMask,RackGateway,RackPort,ServerIP,ServerPort,DeviceId,Status,UsedDate,Monitoring,Description) " +
								"VALUES(%s,%s,NULL,NULL,NULL,NULL,'%s',%s,NULL,0,SYSDATE(),1,NULL);",
						getMaxArckId(), cabinetId, ip, port);
				dbHelper.executeNoQuery(sql);
				flag = true;
				
				StartRackServers(Integer.parseInt(cabinetId), Integer.parseInt(port));
			}else{
				flag = false;
			}
		} catch (Exception e) {
			log.error("insertAssets Error  : " + e);
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
		return flag;
	}
	
	private int getMaxArckId(){
		DatabaseHelper dbHelper = null;
		try {
			if(this.RackId == 0){
				dbHelper = new DatabaseHelper();
				StringBuilder sb = new StringBuilder();
				sb.append("SELECT MAX(RackId) AS RackId FROM TBL_CabinetRackAssets;");
				DataTable dt = dbHelper.executeToTable(sb.toString());
				
				Object res = dt.getRows().get(0).getValue(0);
				if(res != null){
					this.RackId = Integer.parseInt(res.toString());
					this.RackId += 1;
				}else{
					this.RackId = 100000001;
				}
			}else
				this.RackId += 1;
			return this.RackId;
		} catch (Exception e) {
			log.error("getMaxArckId Error : " + e);
			return 999000001;
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
	}

	/**  根据机柜编号删除机架资产表，并删除缓存的线程  */
	public String DeleteCabinetRack(String cabinetId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			//删除资产机架表
			String sql = String.format("DELETE FROM TBL_CabinetRackAssets WHERE CabinetId = %s;", cabinetId);
			dbHelper.executeNoQuery(sql);
			
			//删除资产机架的设备资产表
			sql = String.format("DELETE FROM TBL_AssetsManager WHERE CabinetId = %s;", cabinetId);
			dbHelper.executeNoQuery(sql);
			
			//清理A1数据缓存
			if(A1HexData.containsKey(Integer.parseInt(cabinetId)))
				A1HexData.remove(Integer.parseInt(cabinetId));
			
			//关闭服务，清理服务缓存
			if(CloseRackServerMaps(Integer.parseInt(cabinetId)))
				return "Succeed";
			else
				return "ServerNotExistence";
		} catch (Exception e) {
			log.error("DeleteCabinetRack Error  : " + e);
			return "Error";
		} finally {
			if (dbHelper != null)
				dbHelper.close();
		}
	}
	
	/**
	 * 向资产条发送命令，并解析返回的资产条信息
	 * @param cabinetId 管理机柜编号，-1时为遍历所有的机柜
	 */
	/*public void parseCabinetRackInfo(int cabinetId){
		ArrayList<AssetRack> assetRacks = SelectAllRack();
		for(AssetRack ar : assetRacks){
			if(ar.CabinetId == cabinetId || cabinetId == -1){
				log.info("原数据："+ar.toString());
				//发送命令，并接收返回的网络信息
				String command = "FE FE 00 08 A9 00 00 00 00 00 00 00";
				String hex = SendRackServers(ar.CabinetId, command);
				if(hex.indexOf("Not") != -1 || hex.equals("FF")){
					log.error("ParseCabinetRackInfo CabinetId:"+ar.CabinetId+" Error:"+hex);
					continue;
				}
				//解析网络信息并赋值
				parseWebInfo(hex, ar);
				log.info("更新后："+ar.toString());
				//修改数据库的配置
				updateCabinetRackAssets(ar);
			}
		}
	}*/
	
	/**  Status 0：连接ing...  1：正常     2：告警     3：变更     4：关闭监听**/
	private boolean UpdateRackStatus(int cabinetId, int status, String hex){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String deviceId = null;
			String sql = "";
			if(hex != null && !hex.equals("")){
				deviceId = hexToDecimal(getValueByKey(hex,7,4)).toString();
				sql = String.format("UPDATE TBL_CabinetRackAssets SET `Status` = %s, DeviceId = '%s' WHERE CabinetId = %s;",
						status, deviceId, cabinetId);
			}else{
				sql = String.format("UPDATE TBL_CabinetRackAssets SET `Status` = %s WHERE CabinetId = %s;",
						status, cabinetId);
			}
			
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("UpdateRackStatus Exception:",e);
			return false;
		} finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	
	public boolean UpdateCabinetRack(String rackId,String cabinetId,String rackIp,String rackMask,String rackGateway,
			String rackPort,String serverIP,String serverPort,String deviceId,String usedDate,String monitoring){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			
			String sql = String.format("UPDATE TBL_CabinetRackAssets SET CabinetId = %s,RackIp = %s,RackMask = %s,RackGateway = %s,RackPort = %s,"+
						"ServerIP = '%s',ServerPort = %s,DeviceId = '%s',UsedDate = %s,Monitoring = %s WHERE RackId = %s;",
						cabinetId,resultString(rackIp),resultString(rackMask),resultString(rackGateway),resultInt(rackPort),
						serverIP,serverPort,deviceId,resultString(usedDate),resultInt(monitoring),rackId);
			dbHelper.executeNoQuery(sql);
			
			//判断端口是否变化了，启动新的端口监听
			existsRackServer(Integer.parseInt(cabinetId), Integer.parseInt(serverPort), monitoring);
			
			return true;
		} catch (Exception e) {
			log.error("UpdateCabinetRack Exception:",e);
			return false;
		} finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	private String resultString(String res){
		try {
			if(res == null || res.equals("undefined")) return "NULL";
			return String.format("'%s'", res);
		} catch (Exception e) {
			return "NULL";
		}
	}
	
	private String resultInt(String res){
		try {
			if(res == null || res.equals("undefined") || res.equals("-1")) return "NULL";
			return res;
		} catch (Exception e) {
			return "NULL";
		}
	}
	
	/**  判断机柜编号和端口是否启动了监听，都不存在启动新的监听；都存在不操作；机柜编号对端口不对关闭原来的监听，启动新的监听  */
	private boolean existsRackServer(int cabinetId, int port, String monitoring){
		try {
			int status = 0;
			if(RackStatus.containsKey(cabinetId)){
				status = RackStatus.get(cabinetId);
			}
			//monitoring为0时，取消监听
			if(monitoring != null && monitoring.equals("0")){
				if(RackServerMaps.containsKey(cabinetId))
					CloseRackServerMaps(cabinetId);
				UpdateRackStatus(cabinetId, 4, null);
				RackStatus.put(cabinetId, 4);
				
				//log.info("ColseServer! CabinetId:"+cabinetId);
				return true;
			}
			//关闭监听启动后，改为连接中
			if(status == 4){
				UpdateRackStatus(cabinetId, 0, null);
				RackStatus.put(cabinetId, 0);
			}
			//RackServerMaps监听集合中不存在添加监听
			if(RackServerMaps.containsKey(cabinetId)){
				//同机柜的监听端口不同，关闭原来的监听，添加新监听
				if(RackServerMaps.get(cabinetId) != port){
					CloseRackServerMaps(cabinetId);
					StartRackServers(cabinetId, port);

					//log.info("ColseServer! CabinetId:"+cabinetId);
					//log.info("OpenServer! CabinetId:"+cabinetId+", Port:"+port);
				}
			}else{
				StartRackServers(cabinetId, port);

				//log.info("OpenServer! CabinetId:"+cabinetId+", Port:"+port);
			}
			return true;
		} catch (Exception e) {
			log.error("existsRackServer Exception:",e);
			return false;
		}
	}
	
	/** 解析机架网络信息  命令码:A9 */
	private void parseWebInfo(String hex, AssetRack ar){
		//FE FE 00 1B A9 2A 3D 95 22 20 70 C0 A8 02 AA FF FF FF 00 C0 A8 02 01 01 F6 C0 A8 02 63 01 F6
		//2A 3D [2版本]| 95 22 20 70 [4 设备ID] 
		//C0 A8 02 AA [4 设备IP] | FF FF FF 00 [4 子网掩码] | C0 A8 02 01 [4 默认网关] | 01 F6 [2 设备端口]
		//C0 A8 02 63 [4 服务器IP] | 01 F6 [2 服务器端口]
		ar.DeviceId = hexToDecimal(getValueByKey(hex,7,4)).toString();
		ar.RackIP = parseNetwork(getValueByKey(hex,11,4));
		ar.RackMask = parseNetwork(getValueByKey(hex,15,4));
		ar.RackGateway = parseNetwork(getValueByKey(hex,19,4));
		ar.RackPort = hexToDecimal(getValueByKey(hex,23,2)).intValue();
		ar.ServerIP = parseNetwork(getValueByKey(hex,25,4));
		ar.ServerPort = hexToDecimal(getValueByKey(hex,29,2)).intValue();
	}
	
	/** 解析4个字节的十六进制为网络格式的字符串 */
	private String parseNetwork(String hex){
		//hex => C0 A8 02 AA => 192 168 2 170 => 192.168.2.170
		String[] nets = hex.split(" ");
		String works = "";
		for(String net : nets){
			Long asc = hexToDecimal(net);
			works = String.format("%s%s.", works,asc);
		}
		works = works.substring(0, works.length()-1);
		return works;
	}
	
	
	/**
	 * 获取十六进制字符串的指定值，根据开始Byte下标和长度
	 * @param hex 十六进制字符串
	 * @param index 开始Byte下标，从0开始，如“0A 0B 0C”,0B下标为1
	 * @param size 长度 -1为到最后
	 * @return
	 */
	private static String getValueByKey(String hex,int index,int size){
		try {
			if(size == 1){
				return hex.split(" ")[index];
			}else{
				int i = 3*index;
				if(size == -1){
					return hex.substring(i);
				}else{
					int y = (size-1)*3 + 2;
					if(y > (hex.length()-i))
						return hex.substring(i);
					else
						return hex.substring(i,i+y);
				}
			}
		} catch (Exception e) {
			return "00";
		}
	}

	/** 拆分并解析SN序列号的含义为资产编号和设备型号 */
	private static String[] getCodeOrStyle(String snCode){
		//32 30 31 38 31 30 32 30 30 30 30 32 40 49 4D 55 31 30 32 30 00 00 00 00 00 00 00 00 00 00 00 00
		String[] result = new String[]{null,null};
		try {
			if(snCode.indexOf("40") == -1) {
				result[0] = hexToASCII(snCode);
				result[1] = "";
				return result;
			}

			int index = snCode.indexOf("40")/3;
			String code = getValueByKey(snCode,0,index);
			String style = getValueByKey(snCode,index+1,-1);
			result[0] = hexToASCII(code);
			result[1] = hexToASCII(style);
			return result;
		} catch (Exception e) {
			return result;
		}
	}
	
	/** 添加/修改机架的资产信息  */
	private AssetsManager insertAssetsManager(int cabinetId, String assetsCode, String deviceStyle, int uIndex, int uHeight, String status){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" CALL PRO_InsertRackAssetsManager(%s,'%s','%s',%s,%s,%s)", 
					cabinetId,assetsCode,deviceStyle,uIndex,uHeight,resultString(status));
			
			DataTable dt = dbHelper.executeToTable(sql);
			return AssetsManager.fromDataTable(dt).get(0);
		} catch (Exception e) {
			log.error("insertAssetsManager failed.", e);
			return null;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	
	/** 强制停止机柜发生的告警  */
	public void ForcedEndAlarm(String cabinetId){
		int id = Integer.parseInt(cabinetId);
		if(RackStatus.containsKey(id)){
			//告警中，强制关闭告警状态
			if(RackStatus.get(id) == 2){
				UpdateRackStatus(id, 1, null);
				RackStatus.put(id, 1);
				
				//log.info("ForcedEndAlarm! CabinetId:"+cabinetId);
			}
		}
	}
	
	/** 根据机柜编号查询机柜的设备资产  **/
	public ArrayList<AssetsManager> SelectAssetsManager(String cabinetId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT * FROM TBL_AssetsManager WHERE CabinetId = %s;", cabinetId);
			DataTable dt = dbHelper.executeToTable(sql);
			return AssetsManager.fromDataTable(dt);
		} catch (Exception e) {
			log.error("SelectAssetsManager Error : " + e);
			return new ArrayList<AssetsManager>();
		} finally {
			if (dbHelper != null) dbHelper.close();
		}
	}
	
	/** 修改设备资产信息   **/
	public boolean UpdateAssetsManager(String assetsId,String assetsCode,String cabinetId,String assetsName,String assetStyle,
			String equipmentId,String usedDate,String uIndex,String uHeight,String description){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			//操作日志
			saveAssetsManagerOperate("admin", 6, 2, Integer.parseInt(cabinetId), assetsCode, uIndex, uHeight);
			
			//修改资产表
			String sql = String.format("UPDATE TBL_AssetsManager SET AssetsCode = '%s',CabinetId = %s,AssetsName = '%s',AssetStyle = '%s',"+
						"EquipmentId = %s,UsedDate = '%s',UIndex = %s,UHeight = %s,Description = %s WHERE AssetsId = %s;",
						assetsCode,cabinetId,assetsName,assetStyle,
						resultInt(equipmentId),usedDate,uIndex,uHeight,resultString(description),assetsId);
			dbHelper.executeNoQuery(sql);
			
			//修改机柜表
			sql = String.format("UPDATE MDC_CabinetDeviceMap SET DeviceName = '%s',DeviceId = %s WHERE UIndex = %s AND UHeight = %s;",
					assetsName,resultInt(equipmentId),uIndex,uHeight);
			dbHelper.executeNoQuery(sql);
			
			return true;
		} catch (Exception e) {
			log.error("UpdateAssetsManager Exception:",e);
			return false;
		} finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/** 根据U位删除资产信息  */
	public boolean DeleteAssetsManager(String cabinetId,String uIndex,String uHeight){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			//操作日志
			saveAssetsManagerOperate("admin", 7, 2, Integer.parseInt(cabinetId), null, uIndex, uHeight);
			//删除资产表
			String sql = String.format(" CALL PRO_DeleteRackAssetsManager(%s,NULL,%s,%s)", 
					cabinetId,uIndex,uHeight);
			Object number = dbHelper.executeScalar(sql);//下架状态的资产条数
			/*************************************************************************************/
			//log.info("DeleteAssets Number:"+number.toString()+", SQL:"+ sql);
			/*************************************************************************************/
			if(number != null && number.toString().equals("0"))
				ForcedEndAlarm(cabinetId);
			
			return true;
		} catch (Exception e) {
			log.error("DeleteAssetsManager Exception:",e);
			return false;
		} finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/** 添加资产操作数据  Type 1:资产下架 | 2:添加机架 | 3:修改机架 | 4:删除机架 | 5:添加资产 | 6:修改资产 | 7:删除资产 | 8:结束告警  Mean 1:自动上报 | 2:手动操作 **/
	public boolean saveAssetsManagerOperate(String loginId,int type,int mean,int cabinetId,String assetsCode,String uIndex, String uHeight){
		//PBL_SaveAssetsManagerOperate(loginId,type,'资产下架',meaning,cabinetId,assetsCode)
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql = String.format(" call PBL_SaveAssetsManagerOperate('%s',%s,%s,%s,%s,%s,%s)",
					loginId,type,mean,cabinetId,resultString(assetsCode),resultInt(uIndex),resultInt(uHeight));
			//log.info("AssetsLog SQL:"+sql);
			dbHelper.executeNoQuery(sql);
			
			return true;
		} catch (Exception e) {
			log.error("addAssetsManagerOperate() failed.", e);
			return false;
		} finally {
			dbHelper.close();
		}		
	}
	
	
	public String QueryAssetsManagerLog(String startDate, String endDate){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			DateFormat format = new SimpleDateFormat("yyyy-MM-dd");
			if(resultString(startDate) == null) startDate = format.format(new Date());
			if(resultString(endDate) == null) endDate = format.format(new Date());
			
			//[{"OperateId":"1000000001","Content":"[自动上报](资产下架 U:[1])iCan-1 iCan Code:201810200001","Date":"2019-01-01 00:00:00"},...]
			String sql = String.format("SELECT * FROM TBL_AssetsManagerOperate WHERE OperateDate > '%s 00:00:00' AND OperateDate < '%s 23:59:59' ORDER BY OperateDate DESC;",
					startDate,endDate);
			DataTable dt = dbHelper.executeToTable(sql);
			String result = "[%s]",log = "";
			for(int i = 0;i < dt.getRowCount();i ++){
				if(i > 0) log += ",";
				DataRow dr = dt.getRows().get(i);
				String u = "";
				int uIndex = Integer.parseInt(dr.getValueAsString("UIndex")),uHeight = Integer.parseInt(dr.getValueAsString("UHeight"));
				if(uHeight == 1)
					u = String.valueOf((uIndex + 1));
				else
					u = String.format("%s-%s", (uIndex+1),(uIndex+uHeight));
				String date = dr.getValueAsString("OperateDate");
				date = date.replace(".0","");
				String content = String.format("[%s] (%s U:[%s]) %s %s Code:%s",
						getLanguageValue(dr.getValueAsString("Meaning")),
						getLanguageValue(dr.getValueAsString("OperateType")),u,
						dr.getValueAsString("AssetsName"),dr.getValueAsString("AssetsStyle"),dr.getValueAsString("AssetsCode"));
				log += String.format("{\"OperateId\":\"%s\",\"Content\":\"%s\",\"Date\":\"%s\"}",
						dr.getValueAsString("OperateId"),content,date);
			}
			result = String.format(result, log);
			return result;
		} catch (Exception e) {
			log.error("QueryAssetsManagerLog Exception:",e);
			return "[]";
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
	}

	private static String getLanguageValue(String key){
		if(LanguageDataHandler.getLanaguage().equals("Chinese")) return key;

		String k = "AssetOperation.";
		if(key.equals("自动上报"))
			k += "Automatic";
		else if(key.equals("手动操作"))
			k += "Manual";
		else if(key.equals("资产下架"))
			k += "AssetDemolition";
		else if(key.equals("添加机架"))
			k += "AddRack";
		else if(key.equals("修改机架"))
			k += "ModifyRack";
		else if(key.equals("删除机架"))
			k += "DeleteRack";
		else if(key.equals("添加资产"))
			k += "AssetPutaway";
		else if(key.equals("修改资产"))
			k += "ModifyAsset";
		else if(key.equals("删除资产"))
			k += "DeleteAsset";
		else
			k += "EndAlarm";

		//System.out.println("Key:"+key+", K:"+k+", Value:"+LanguageDataHandler.getLanaguageJsonValue(k));
		return LanguageDataHandler.getLanaguageJsonValue(k);
	}
	
	/** 将ASCII码转换为十六进制 */
	private static String asciiToHex(String str){
		char[] chars = str.toCharArray();
		
		StringBuffer hex = new StringBuffer();
		for(int i = 0; i < chars.length; i++){
			hex.append(Integer.toHexString((int)chars[i])+" ");
		}
		return hex.toString();
	}
	
	/** 将十六进制转换为ASCII */
	private static String hexToASCII(String hex){
		StringBuilder sb = new StringBuilder();
		StringBuilder temp = new StringBuilder();
		//49204c6f7665204a617661 split into two characters 49, 20, 4c...
		hex = hex.replaceAll(" ", "");
		for( int i=0; i<hex.length()-1; i+=2 ){
			//grab the hex in pairs
			String output = hex.substring(i, (i + 2));
			if(output.equals("00")) continue;
			//convert hex to decimal
			int decimal = Integer.parseInt(output, 16);
			//convert the decimal to character
			sb.append((char)decimal);
			temp.append(decimal);
		}
		
		return sb.toString();
	}

	/** 将十六进制转为十进制 */
	private static Long hexToDecimal(String hex){
		hex = hex.replaceAll(" ", "");
		Long decimal = Long.valueOf(hex,16);
		return decimal;
	}

	/** 将十进制转为十六进制 */
	private static String decimalToHex(String decimal) { 
		String hex = Long.toHexString(Long.parseLong(decimal));
		
		if(hex.length()%2 == 1) hex = String.format("0%s", hex);
		
		String regex = "(.{2})";
		hex = hex.replaceAll(regex, "$1 ");
		hex = hex.toUpperCase();
			
		return hex;
    } 
}
