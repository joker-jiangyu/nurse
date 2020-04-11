package nurse.logic.providers;


import java.io.*;
import java.net.Socket;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.ActiveAlarm;
import nurse.entity.persist.EventNotifyRule;
import nurse.entity.persist.NetworkPhone;
import nurse.utility.DatabaseHelper;

public class NetworkPhoneProvider {
	private static Logger log = Logger.getLogger(NetworkPhoneProvider.class);
	private static Map<String,String> NPContentMap = new HashMap<String,String>();

	public NetworkPhoneProvider() {
		
	}

	private static NetworkPhoneProvider instance = new NetworkPhoneProvider();

	public static NetworkPhoneProvider getInstance() {
		return instance;
	}
	
	public void networkPhoneFactory(){
		try {
			//网络电话过滤器数
			//if(getNetworkPhoneNotifyNumber() <= 0) return;
			
			//是否开始
			if(!whetherStart()) return;
			//网络电话配置
			List<NetworkPhone> nps = getNetworkPhoneInfo();
			if(nps.size() <= 0) return;
			//事件过滤器数
			ArrayList<EventNotifyRule> enrs = getNetworkPhoneNotifyList();
			if(enrs.size() <= 0) return;
			
			//当前所有告警
			ArrayList<ActiveAlarm> allAlarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
			//30s内的告警
    		List<ActiveAlarm> actives = getNewActiveAlarm(allAlarms);
    		//告警结束
    		List<ActiveAlarm> historys = ActiveAlarmProvider.getInstance().GetNewHistoryAlarm();
    		
    		ArrayList<ActiveAlarm> alarms = new ArrayList<ActiveAlarm>();
    		for(EventNotifyRule enr : enrs){
    			if(enr.NotifyEventType.indexOf("1") > -1){//事件类型：开始告警
					NetworkPhone np = nps.get(0);
    				//即时
    				alarms = getAlarmsByRule(actives, enr, "1");
    				if(alarms.size() > 0)
    					sendNetworkPhone(enr,np,alarms,"1",false);
    				
    				//定时
        			if(np.timeType != null && !np.timeType.equals("real")){
            			if(isRegularly(np)){//是否满足定时条件
            				alarms = getAlarmsByRule(allAlarms, enr, "1");//过滤后的告警
            				sendNetworkPhone(enr, np, alarms, "3", true);
            			}
            		}
    			}
    			if(enr.NotifyEventType.indexOf("2") > -1){//事件类型：结束告警
    				if(historys.size() > 0){
        				alarms = getAlarmsByRule(historys, enr, "2");
        				if(alarms.size() > 0)
        					sendNetworkPhone(enr,nps.get(0),alarms,"2",false);
    				}
    			}
    		}
		} catch (Exception e) {
			log.error("networkPhoneFactory : ",e);
		} finally {
			
		}
	}
	
	/**
	 * 发送短信、电话
	 * @param enr 短信过滤
	 * @param np 短信配置
	 * @param alarms 告警列表
	 * @param eventType 告警类型；1为告警开始，2为告警结束，3为告警未结束
	 * @param isRepet 是否可重复内容发送
	 */
	private void sendNetworkPhone(EventNotifyRule enr,NetworkPhone np,ArrayList<ActiveAlarm> alarms,String eventType,boolean isRepet){
		String json = spliceJson(enr.Receiver,np,alarms,eventType);
		
		String key = String.valueOf(String.format("%s%s", enr.Receiver,enr.NotifyID).hashCode());
		String value = String.valueOf(json.hashCode());
		if(isRepet){
			key = String.format("%s%s",key,"1");
			SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmm");
			value = String.format("%s%s", df.format(new Date()),value);
		}
		
		if(NPContentMap.containsKey(key))
			if(NPContentMap.get(key).equals(value))
				return;
		NPContentMap.put(key, value);
		//打开TCP/IP发送内容
		SocketNetworkPhone(np,json);
	}
	
	//获取手机电话号列，","逗号隔开
	private String filterPhone(String receiver){
		StringBuffer sb = new StringBuffer();
		String regEx = "1[0-9]{10}";
    	Pattern p = Pattern.compile(regEx);
    	Matcher m = p.matcher(receiver);
    	while(m.find()){
    		if(sb.length() > 0) sb.append(",");
    		sb.append(String.format("\"%s\"", m.group()));
    	}	
    	return sb.toString();
	}
	
	/**
	 * 拼接TCP文本
	 * @param receiver 接收者
	 * @param np 短信配置
	 * @param alarms 告警列表
	 * @param eventType 告警类型；1为告警开始，2为告警结束
	 * @return
	 */
	private String spliceJson(String receiver,NetworkPhone np,ArrayList<ActiveAlarm> alarms,String eventType){
		String json = "{\"To\":[%s],\"Type\":\"%s\",\"Encoding\":\"%s\",\"Text\":\"%s\"}";
		
		StringBuffer sb = new StringBuffer();
		
		if(alarms == null || alarms.size() == 0){
			sb.append("一切正常！");
		}else{
			sb.append("[共"+alarms.size()+"条] ");
			int number = 0;
			for(ActiveAlarm aa : alarms){
				number ++;
				if(number > 5){
					sb.append("......");
					break;
				}
				String text = np.textFormat;
				sb.append("  "+number+"、");
				//[{告警状态}] {局站名称} {告警内容} [触发值:{触发值}] {时间}
				if(eventType.equals("1")){
					text = text.replace("{告警状态}","告警开始");
					text = text.replace("{时间}","开始于："+String.valueOf(aa.startTime));
				}
				if(eventType.equals("2")){
					text = text.replace("{告警状态}","告警结束");
					text = text.replace("{时间}","结束于："+String.valueOf(aa.endTime));
				}
				if(eventType.equals("3")){
					text = text.replace("{告警状态}","告警未结束");
					text = text.replace("{时间}","开始于："+String.valueOf(aa.endTime));
				}
				text = text.replace("{局站名称}", aa.siteName);
				text = text.replace("{告警内容}",String.format("%s %s %s",
						aa.deviceName,aa.eventName,aa.meanings));
				text = text.replace("{触发值}",String.valueOf(aa.triggerValue));
				sb.append(text);
			}
		}
		json = String.format(json, filterPhone(receiver), np.type, np.encoding,sb.toString());
		
		return json;
	}
	
	//是否满足定时条件
	private boolean isRegularly(NetworkPhone np){
		Calendar now = Calendar.getInstance(); 
		//对象时间格式化
		//np.getEmailTiming();
		//日
    	if(np.timeType.equals("month"))
    		if(now.get(Calendar.DAY_OF_MONTH) != np.day) return false;
    	//周
    	if(np.timeType.equals("week")){
        	int week = now.get(Calendar.DAY_OF_WEEK) - 1;
            if(week == 0) week = 7;
    		if(week != np.week) return false;
    	}
    	//时&分
    	if(now.get(Calendar.HOUR_OF_DAY) != np.hour) return false;
    	if(now.get(Calendar.MINUTE) != np.minute) return false;
    	return true;
	}
	
	private void SocketNetworkPhone(NetworkPhone np,String json){
		try {
			Socket socket = null;
			//创建Socket对象
			try {
				socket = new Socket(np.npIp,np.npPort);
			} catch (Exception e) { return;}
			//获取json文本
			
			//根据输入输出流和服务端连接
			OutputStream outputStream=socket.getOutputStream();//获取一个输出流，向服务端发送信息
			PrintWriter printWriter=new PrintWriter(outputStream);//将输出流包装成打印流
			printWriter.print(json);
			printWriter.flush();
			socket.shutdownOutput();//关闭输出流
			
			InputStream inputStream=socket.getInputStream();//获取一个输入流，接收服务端的信息
			InputStreamReader inputStreamReader=new InputStreamReader(inputStream);//包装成字符流，提高效率
			BufferedReader bufferedReader=new BufferedReader(inputStreamReader);//缓冲区

			String info = "";
			String temp = null;//临时变量
			while((temp = bufferedReader.readLine())!=null){
				 info += temp;
			}
			log.info("NetworkPhone http://"+np.npIp+":"+np.npPort+" Server:"+info+" ,Date:"+(new Date()).toString());
			   
			//关闭相对应的资源
			bufferedReader.close();
			inputStream.close();
			printWriter.close();
			outputStream.close();
			socket.close();
		} catch (Exception e) {
			log.error("SocketNetworkPhone : ",e);
		}
	}
	
	//是否开始短信
	private boolean whetherStart(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT `Enable` FROM TBL_NetworkPhone;";
			DataTable dt = dbHelper.executeToTable(sql);
			boolean bool = false;
			if(dt.getRowCount() > 0){
				Object obj = dt.getRows().get(0).getValue("Enable");
				bool = (boolean)(obj == null ? false : obj);
			}
			
			return bool;
		} catch (Exception e) {
			log.error("whetherStart()", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return false;
	}
	
	public List<NetworkPhone> getNetworkPhoneInfo(){
		DatabaseHelper dbHelper = null;
		ArrayList<NetworkPhone> nps = new ArrayList<NetworkPhone>();
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT * FROM TBL_NetworkPhone;";

			DataTable dt = dbHelper.executeToTable(sql);
			nps = NetworkPhone.fromDataTable(dt);
			return nps;
		} catch (Exception e) {
			log.error("GetNetworkPhoneInfo()", e);
			return nps;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	private List<ActiveAlarm> getNewActiveAlarm(ArrayList<ActiveAlarm> allAlarms){
		//ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
		Date now = new Date();
		ArrayList<ActiveAlarm> alarmList = new ArrayList<ActiveAlarm>();// 获得最新的所有告警
		for (ActiveAlarm a : allAlarms) {
			if ((now.getTime() - a.startTime.getTime()) / 1000 < 30) {
				alarmList.add(a);// 最新的告警
			}
		}
		return alarmList;
	}
	
    private ArrayList<EventNotifyRule> getNetworkPhoneNotifyList(){
    	DatabaseHelper dbHelper = null;
    	ArrayList<EventNotifyRule> enrs = new ArrayList<EventNotifyRule>();
        try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM nt_eventnotifyrule;");
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            ArrayList<EventNotifyRule> list = EventNotifyRule.fromDataTable(dt);

        	String regEx = "1[0-9]{10}";
        	Pattern p = Pattern.compile(regEx);
            for(EventNotifyRule enr : list){
        		boolean bool = p.matcher(enr.Receiver).find();
        		if(bool) enrs.add(enr);
            }
            
            return enrs;
		} catch (Exception e) {
			log.error("getEmailEventNotifyRules() fail to read all eventNotifyRules", e);
			return enrs;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
    }
    
    /**
     * 根据设备编号和告警等级筛选告警
     * @param alarms 告警列表
     * @param enr 过滤器
     * @param eventType  告警类型；1为告警开始，2为告警结束
     * @return
     */
    private ArrayList<ActiveAlarm> getAlarmsByRule(List<ActiveAlarm> alarms,EventNotifyRule enr,String eventType){
		ArrayList<ActiveAlarm> list = new ArrayList<ActiveAlarm>();
    	try {
    		String[] equipIds = enr.NotifyEquipID.split(",");//告警设备ID
    		String[] eventLevels = enr.NotifyEventLevel.split(",");//告警等级
    		if(enr.NotifyEventType.indexOf(eventType) > -1){
	    		for(ActiveAlarm as : alarms){
	        		for(String equipId : equipIds){
	        			if(as.deviceId == Integer.parseInt(equipId)){
	        				for(String level : eventLevels){
	        					if(as.alarmLevel == Integer.parseInt(level)){
	        						list.add(as);
	        					}
	        				}
	        			}
	        		}
	        	}
    		}
		} catch (Exception e) {
			log.error("getAlarmsByRule() event Notify Rule "+e);
		}
    	return list;
	}

	public boolean updateNetworkPhone(String nPIp, int nPPort, String type, String textFormat,boolean enable,String timeType,String timeRegularly) {
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(
					"UPDATE TBL_NetworkPhone SET NPIP='%s',NPPort = %d,Type = '%s',TextFormat = '%s',TimeType = '%s',TimeRegularly = '%s',`Enable` = %s;",
					nPIp, nPPort, type, textFormat,timeType,timeRegularly,enable?1:0);
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("Update netWorkPhone error.", e);
		}
		return false;
	}

}
