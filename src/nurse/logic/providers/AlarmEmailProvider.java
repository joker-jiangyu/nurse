package nurse.logic.providers;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import nurse.common.DataTable;
import nurse.entity.persist.ActiveAlarm;
import nurse.entity.persist.EmailTiming;
import nurse.entity.persist.EventNotifyRule;
import nurse.utility.Base64Helper;
import nurse.utility.DatabaseHelper;
import nurse.utility.MainConfigHelper;

public class AlarmEmailProvider{
	
	private static AlarmEmailProvider instance = new AlarmEmailProvider();
	private static Logger log = Logger.getLogger(AlarmEmailProvider.class);
	private static Map<Integer, Integer> EmailContentMap = new HashMap<Integer, Integer>();
	private static Map<Integer,ArrayList<ActiveAlarm>> LastAlarmList = new HashMap<Integer,ArrayList<ActiveAlarm>>();

	private static EmailTiming emailTiming = null;
	
	public static AlarmEmailProvider getInstance(){
		return instance;
	}
	
	//发件人
    private static String host = "";//"42.120.219.29" SMTP的IP地址 
    private static String username = "";//用户名
    private static String password = "";//密码
    private static String from = "";////邮箱地址    
    private static String port = "";//"465" SMTP端口
    private static String nick = MainConfigHelper.getConfig().emailNick;//发件人
    private static String subject = MainConfigHelper.getConfig().emailSubject;//主题
    
    static{
    	initEmail();
    }
    
    public static void initEmail(){
    	EmailTiming et = AlarmEmailProvider.getInstance().GetEmailTimingInfo();
    	host = et.smtpIp;
    	username = et.account;
    	password = et.password;
    	from = et.account;
    	port = String.valueOf(et.smtpPort);
    }
    
    /**
     * 发送邮件 
     * @param to 收件人列表，以","分割 
     * @param subject 标题 
     * @param body 内容 
     */
    private synchronized static boolean sendMail(String to, String subject, String body,int jetLag){
    	// 参数修饰  
        if (body == null) {  
            body = "";  
        }  
        if (subject == null) {  
            subject = "无主题";  
        }  
        // 创建Properties对象  
        Properties props = System.getProperties();  
        // 创建信件服务器  
        props.put("mail.smtp.host", host);  
        props.put("mail.smtp.auth", "true"); // 通过验证  
        props.put("mail.smtp.port", port);//端口
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.ssl.enable", "true");
        //props.put("mail.debug", "true");
        // 得到默认的对话对象  
        Session session = Session.getDefaultInstance(props, null);  
        // 创建一个消息，并初始化该消息的各项元素  
        MimeMessage msg = new MimeMessage(session);  
        try {
        	nick = MimeUtility.encodeText(nick);  
            msg.setFrom(new InternetAddress(nick + "<" + from + ">"));  
            // 创建收件人列表  
            if (to != null && to.trim().length() > 0) {  
                String[] arr = to.split(",");  
                int receiverCount = arr.length;  
                if (receiverCount > 0) {  
                    InternetAddress[] address = new InternetAddress[receiverCount];  
                    for (int i = 0; i < receiverCount; i++) {  
                        address[i] = new InternetAddress(arr[i]);  
                    }  
                    msg.addRecipients(Message.RecipientType.TO, address);  
                    msg.setSubject(subject);  
                    // 设置邮件正文  
                    //msg.setText(body);
                    msg.setContent(body,"text/html;charset = utf-8");
                    //校时 -8 小时
					Calendar ca = Calendar.getInstance();
					ca.setTime(new Date());
					ca.add(Calendar.HOUR_OF_DAY, jetLag);
                    // 设置信件头的发送日期  
                    msg.setSentDate(ca.getTime());
                    msg.saveChanges();  
                    // 发送信件  
                    Transport transport = session.getTransport("smtp");  
                    transport.connect(username, password);
                    transport.sendMessage(msg,  
                            msg.getRecipients(Message.RecipientType.TO));  
                    transport.close();  
                    
                    log.info("Email:"+to+",Data:"+(new Date()));
                    return true;  
                } else {  
                	log.error("sendMail() None receiver!");  
                }  
            } else {  
            	log.error("sendMail() None receiver!");  
            }  
		} catch (Exception e) {
			log.error("sendMail() Electronic mailbox alarm exception:", e);
		}
		return false;
    }
    
    /**
     * 获得所有人员邮箱
     * @return email,email...
     */
    private String getEmailByEmpName(EventNotifyRule enr){
		DatabaseHelper dbHelper = null;
		StringBuffer email = new StringBuffer();
    	try {
    		dbHelper = new DatabaseHelper();
    		
    		String[] emps = enr.Receiver.split(";");
    		for(String emp : emps){
    			email.append(emp.split("\\|")[1]+",");
    		}
		} catch (Exception e) {
			log.error("getEmailByEmpName() Electronic mailbox alarm exception:", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return email.toString();
    }
    /**
     * 格式化数据
     * @param email 邮件账号
     * @param alarmList 告警列表
     * @param key 唯一值
     * @param isTiming 是否是定时邮件
     * @param isSent 是否是排除已发送的告警
     */
    public void sendEmailAlarm(String email,ArrayList<ActiveAlarm> alarmList,String key,boolean isTiming,boolean isSent, int jetLag){
    	int keyCode = 0;
    	if(isTiming)
    		keyCode = String.format("%s%s", key, isTiming).hashCode();
    	else
    		keyCode = String.format("%s%s", key, isTiming).hashCode();
    		
    	//格式化数据
    	StringBuffer content = new StringBuffer();
    	String color = "";
    	int[] count = new int[4];
    	boolean isNewAlarm = false; //是否有新告警
    	content.append("<table style='font-weight:bold;'>");
    	list:for(ActiveAlarm item : alarmList){
        	content.append("<tr>");
    		if(isSent){
    			if(LastAlarmList.containsKey(keyCode)){
	    			for(ActiveAlarm lal : LastAlarmList.get(keyCode)){
	        			if(item.uniqueId != null && lal.uniqueId != null && 
	        					item.uniqueId.equals(lal.uniqueId)){
	        				continue list;
	        			}
	        		}
    			}
    		}
    		isNewAlarm = true;
    		switch(item.alarmLevel){
        		case 3:
        			color = "red";
        			count[3] ++;
        			break;
        		case 2:
        			color = "orange";
        			count[2] ++;
        			break;
        		case 1:
        			color = "blue";
        			count[1] ++;
        			break;
        		default:
        			color = "green";
        			count[0] ++;
        			break;
    		}
    		/*content.append("[<span style='color:"+color+";'>"+item.alarmLevelName+"</span>] "
    				+item.deviceName+" "+item.eventName+" "+item.meanings
    				+" [触发值："+item.triggerValue+"]&nbsp;&nbsp;&nbsp;&nbsp;开始于:"+item.startTime);
    		if(item.endTime != null)
    			content.append("&nbsp;&nbsp;&nbsp;&nbsp;结束于:"+item.endTime);
    		content.append("<br/>");*/
        	content.append("	<td>[<span style='color:"+color+";'>"+item.alarmLevelName+"</span>]</td>");
        	content.append("	<td>"+item.deviceName+" "+item.eventName+" "+item.meanings
    				+" [触发值："+item.triggerValue+"]</td>");
        	content.append("	<td>&nbsp;&nbsp;开始于:"+item.startTime+"</td>");
        	if(item.endTime != null)
        		content.append("	<td>&nbsp;&nbsp;结束于:"+item.endTime+"</td>");
        	content.append("</tr>");
    	}
    	content.append("</table>");
    	if(!isNewAlarm) return;
    	
    	String title = "当前告警列表";
    	if(isTiming) title = "历史告警列表";
    	if(isSent) LastAlarmList.put(keyCode, alarmList);//最新的告警列表
    	
    	content.insert(0,"<meta http-equiv='Content-Type' content='text/html; charset=utf-8' /> "
    			+"<strong>"+subject+"</strong> - ["+title+"]<br/>" 
    			+ "<span style='font-weight:bold;'>"
    			+ "------------------------------------------------------------------<br/>"
    			+ "| <span style='color:red;'>"+count[3]+" 条  紧急告警</span> "
    			+ "| <span style='color:orange;'>"+count[2]+" 条  重要告警</span> "
    			+ "| <span style='color:blue;'>"+count[1]+" 条  一般告警</span> "
    			+ "| <span style='color:green;'>"+count[0]+" 条  提示信息</span> |<br/>"
    			+ "------------------------------------------------------------------<br/>");
		content.append("</span>");
		
    	int valCode = 0;
    	if(isTiming){
    		Calendar now = Calendar.getInstance();
        	SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHH");
    		valCode = df.format(now.getTime()).hashCode();
    	}else{
    		valCode = content.toString().hashCode();
    	}
    	//相同的收件人不接收相同内容的邮件
        if(EmailContentMap.containsKey(keyCode)){
        	if(EmailContentMap.get(keyCode) == valCode)
        		return;
        }
		EmailContentMap.put(keyCode, valCode);
		
    	if(!sendMail(email,subject,content.toString(),jetLag))
    		log.error("Failed to send e-mail");
    }
    /**
     * 邮箱告警封装
     */
    public void factory(int jetLag){
    	//发件人邮箱
    	if(username == null || username.equals("")) return;
    	//邮箱过滤器数
    	int eventNums = getEmailEventNotifyRuleNums();
    	if(eventNums <= 0) return;
    	//邮箱定时
    	if(emailTiming == null)
    		emailTiming = getEmailTiming();
    	//所有告警
		ArrayList<ActiveAlarm> alarms = ActiveAlarmProvider.getInstance().GetAllAlarms();
    	if(emailTiming.type.equals("all")){ //即时，发生告警就发送邮箱。
    		Date now = new Date();
    		ArrayList<ActiveAlarm> alarmList = new ArrayList<ActiveAlarm>();//获得最新的所有告警
    		for(ActiveAlarm a : alarms)
    		{
    			if ((now.getTime()-a.startTime.getTime())/1000<30)
    			{
    				alarmList.add(a);//最新的告警
    			}
    		}
    		if(alarmList.size() == 0) return;
    		sendMail(alarmList,false,true,jetLag);
    	}else{//定时
    		if(verificationTime(emailTiming)){
    			sendTimingMail(emailTiming,jetLag);
    			if(alarms.size() != 0) sendMail(alarms,false,false,jetLag);
    		}
    	}
    }
    // 根据过滤器查询告警
    private ArrayList<ActiveAlarm> getAlarmsByRule(ArrayList<ActiveAlarm> alarms,EventNotifyRule enr){
		ArrayList<ActiveAlarm> list = new ArrayList<ActiveAlarm>();
    	try {
    		String[] equipIds = enr.NotifyEquipID.split(",");//告警设备ID
    		String[] eventLevels = enr.NotifyEventLevel.split(",");//告警等级
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
		} catch (Exception e) {
			log.error("getAlarmsByRule() event Notify Rule "+e);
		}
    	return list;
    }
    
    public String getMailDict(){
    	String result = "{\"Type\":\"%s\",\"Data\":%s}";
    	String data = "{}";
    	try {
    		EmailTiming et = GetEmailTimingInfo();
            
            if(et != null){
    			if(et.type.equals("day")){//每天
    				String[] split2 = et.regularly.split(":");
    				data = String.format("{\"hour\":\"%s\",\"minute\":\"%s\"}", split2[0],split2[1]);
    			}else if(et.type.equals("week")){//每周
    				String[] split2 = et.regularly.split(" ");
    				String[] split3 = split2[1].split(":");
    				data = String.format("{\"week\":\"%s\",\"hour\":\"%s\",\"minute\":\"%s\"}", split2[0],split3[0],split3[1]);
    			}else if(et.type.equals("month")){//每月
    				String[] split2 = et.regularly.split(" ");
    				String[] split3 = split2[1].split(":");
    				data = String.format("{\"day\":\"%s\",\"hour\":\"%s\",\"minute\":\"%s\"}", split2[0],split3[0],split3[1]);
    			}
            }
    		result = String.format(result, et.type,data);
		} catch (Exception e) {
			log.error("getMailDict() getMailDict exception:", e);
		}
    	return result;
    }
    
    public EmailTiming GetEmailTimingInfo(){
    	DatabaseHelper dbHelper = null;
    	try {
    		dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT * FROM EMailTiming;");
            String sql = sb.toString();
            DataTable dt = dbHelper.executeToTable(sql);
            ArrayList<EmailTiming> list = EmailTiming.fromDataTable(dt);
            return list.get(0);
    	} catch (Exception e) {
			log.error("GetEmailTiming() exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
    	return null;
    }
    
    public String setMailDict(String requestParams){
    	try {
    		String[] split = Base64Helper.decode(requestParams).split("\\&");

    		EmailTiming tim = new EmailTiming();
    		tim.id = Integer.parseInt(split[0]);
    		
    		String[] et = split[1].split("\\|");
    		tim.type = et[0];
    		tim.regularly = et.length > 1 ? et[1] : "";
    		
    		String[] ec = split[2].split("\\|");
    		tim.account = ec.length > 0 ? ec[0] : "";
    		tim.password = ec.length > 1 ? ec[1] : "";
    		tim.smtpIp = ec.length > 2 ? ec[2] : "";
    		tim.smtpPort = ec.length > 3 ? Integer.parseInt(ec[3]) : 0;

    		//发件人邮箱
    		UpdateEmailAccount(tim);
    		initEmail();
    		
    		emailTiming = getEmailTiming();
			return "OK";
		} catch (Exception e) {
			log.error("setMailDict exception:", e);
			return "Exception";
		}
    }
    
    private boolean UpdateEmailAccount(EmailTiming tim){
    	DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("UPDATE EMailTiming SET Type = '%s',Regularly = '%s',Account = '%s',`Password` = '%s',SmtpIp = '%s',SmtpPort = %s,Description = '%s' WHERE Id = %s;",
					tim.type,tim.regularly,tim.account,tim.password,tim.smtpIp,tim.smtpPort,tim.description,tim.id); 
			dbHelper.executeNoQuery(sql);
			return true;
		} catch (Exception e) {
			log.error("deleteDoorCard failed.", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
    }
    
    public int getEmailEventNotifyRuleNums(){
    	DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT COUNT(*) FROM nt_eventnotifyrule WHERE Receiver LIKE '%@%.%'");
            String sql = sb.toString();
            
            res = dbHelper.executeScalar(sql);
            if(res == null)
			{
            	iNums = 0;
			}
			else
			{
				iNums = Integer.parseInt(res.toString());
			}

		} catch (Exception e) {
			log.error("getEmailEventNotifyRuleNums() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return iNums;
    }
    
    public ArrayList<EventNotifyRule> getEmailEventNotifyRules(){
    	DatabaseHelper dbHelper = null;
        try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM nt_eventnotifyrule WHERE Receiver LIKE '%@%.%'");  
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return EventNotifyRule.fromDataTable(dt);
		} catch (Exception e) {
			log.error("getEmailEventNotifyRules() fail to read all eventNotifyRules", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
    }

    public EmailTiming getEmailTiming(){
    	//每月month|day HH:mm  每周week|week HH:mm   每天day|HH:mm  即时all
		EmailTiming tim = new EmailTiming();
    	String str = AlarmEmailProvider.getInstance().getMailDict();
		JSONObject mail = new JSONObject(str);
		
		tim.type = mail.getString("Type");
		if(tim.type.equals("all")) return tim;
		
		JSONObject data = new JSONObject(mail.get("Data").toString());
		try {
			if(tim.type.equals("month")) tim.day = data.getInt("day");
			if(tim.type.equals("week")) tim.week = data.getInt("week");
			tim.hour = data.getInt("hour");
			tim.minute = data.getInt("minute");
		} catch (Exception e) {}
		return tim;
    }
    
    public boolean verificationTime(EmailTiming et){
    	if(et.type.equals("all")) return true;
    	Calendar now = Calendar.getInstance(); 
    	//日
    	if(et.type.equals("month"))
    		if(now.get(Calendar.DAY_OF_MONTH) != et.day) return false;
    	//周
    	if(et.type.equals("week")){
        	int week = now.get(Calendar.DAY_OF_WEEK) - 1;
            if(week == 0) week = 7;
    		if(week != et.week) return false;
    	}
    	//时&分
    	if(now.get(Calendar.HOUR_OF_DAY) != et.hour) return false;
    	if(now.get(Calendar.MINUTE) != et.minute) return false;
    	return true;
    }

    public void sendMail(ArrayList<ActiveAlarm> alarmList,boolean isTiming,boolean isSent, int jetLag){
    	//查询所有的邮箱过滤器
    	ArrayList<EventNotifyRule> eventList = getEmailEventNotifyRules();
    	for(EventNotifyRule enr : eventList){
    		String email = getEmailByEmpName(enr);
        	if(email == null || email.length() <= 0) continue;
    		ArrayList<ActiveAlarm> list = getAlarmsByRule(alarmList,enr);
    		String key = String.format("%s%s", email,enr.NotifyID);
    		sendEmailAlarm(email,list,key,isTiming,isSent,jetLag);
    	}
    }
    
    public void sendTimingMail(EmailTiming et,int jetLag){
    	//查询所有的邮箱过滤器
    	ArrayList<EventNotifyRule> eventList = getEmailEventNotifyRules();
    	for(EventNotifyRule enr : eventList){
			String email = getEmailByEmpName(enr);
	    	if(email == null || email.length() <= 0) continue;
	    	String key = String.format("%s%s", email,enr.NotifyID);
	    	ArrayList<ActiveAlarm> list = GetAlarmByTimeSpan(GetStartTime(et), GetEndTime(et));//获取所有时间段内的历史事件
	    	list = getAlarmsByRule(list,enr);//过滤历史事件，获取过滤器中的条件的事件
	    	if(list.size() == 0){//无告警时，发送平安邮件。
    			normalSendEmail(email,key,jetLag);
    			continue;
    		}
	    	sendEmailAlarm(email,list,key,true,false,jetLag);
    	}
    }
    
    private String GetEndTime(EmailTiming et){
    	Calendar now = Calendar.getInstance();
    	SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		//时&分&秒
		now.set(Calendar.HOUR_OF_DAY, et.hour);
		now.set(Calendar.MINUTE, et.minute);
		now.set(Calendar.SECOND, 00);
    	return df.format((new java.sql.Date(now.getTime().getTime())));
    }
    
    private String GetStartTime(EmailTiming et){
    	Calendar now = Calendar.getInstance();
    	SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    	if(et.type.equals("day")){//每天
    		now.set(Calendar.DAY_OF_MONTH, (now.get(Calendar.DAY_OF_MONTH) - 1));
    	}else if(et.type.equals("week")){//每周
    		now.set(Calendar.DAY_OF_MONTH, (now.get(Calendar.DAY_OF_MONTH) - 7));
    	}else if(et.type.equals("month")){//每月
    		now.set(Calendar.MONTH, (now.get(Calendar.MONTH) - 1));
    	}
		//时&分&秒
		now.set(Calendar.HOUR_OF_DAY, et.hour);
		now.set(Calendar.MINUTE, et.minute);
		now.set(Calendar.SECOND, 00);
    	return df.format((new java.sql.Date(now.getTime().getTime())));
    }
    
    public ArrayList<ActiveAlarm> GetAlarmByTimeSpan(String StartDate,String EndDate){
    	DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append(String.format("SELECT * FROM TBL_HistoryEvent WHERE StartTime >= '%s' AND StartTime <= '%s' ORDER BY StartTime DESC LIMIT 3000;",
            		StartDate,EndDate));
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return ActiveAlarm.GetListFromDataTable(dt);
		} catch (Exception e) {
			log.error("GetAlarmByTimeSpan() fail to read all sig basetypes", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return new ArrayList<ActiveAlarm>();
    }
    
    public void normalSendEmail(String email,String key,int jetLag){
		StringBuffer content = new StringBuffer();
		content.append("<strong>"+subject+"</strong> - [历史告警列表]<br/>");
		content.append("<span style='color:green;'><strong> [ 无告警 ]  </strong></span> <br/>");
		int keyCode = key.hashCode();
		Calendar now = Calendar.getInstance();
    	int valCode = String.format("%s%s%s", 
    			now.get(Calendar.DAY_OF_MONTH),now.get(Calendar.HOUR_OF_DAY),now.get(Calendar.MINUTE)).hashCode();
    	//相同的收件人不接收相同内容的邮件
        if(EmailContentMap.containsKey(keyCode)){
        	if(EmailContentMap.get(keyCode) == valCode)
        		return;
        }
		EmailContentMap.put(keyCode, valCode);
		
    	if(!sendMail(email,subject,content.toString(),jetLag))
    		log.error("normalSendEmail() Failed to send e-mail");
    }
}
