package nurse.logic.providers;

import java.util.ArrayList;
import java.util.Date;

import org.apache.log4j.Logger;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.EquipmentTemplate;
import nurse.entity.persist.EventNotifyRule;
import nurse.utility.DatabaseHelper;


public class EventFilterProvider {

	private static EventFilterProvider instance = new EventFilterProvider();
	private static Logger log = Logger.getLogger(EventFilterProvider.class);
	private static int gEventFilterId = 755000001;
	
	public EventFilterProvider() {
	}
	
	public static EventFilterProvider getInstance(){
		return instance;
	}

	public ArrayList<EventNotifyRule> GetAllEventNotifyRules() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM nt_eventnotifyrule");  
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return EventNotifyRule.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all eventNotifyRules", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

	}
	
	public int InsertEventNotifyRule(String description, int NotifyMode, String Receiver, String NotifyEventType, String NotifyEventLevel, String NotifyEquipID)
    {
        int NotifyID = -1;

        DatabaseHelper dbHelper = null;
		try
        {	
			//�����豸
            dbHelper = new DatabaseHelper();
            StringBuilder sbInsert=new StringBuilder();
            sbInsert.append("INSERT INTO nt_eventnotifyrule(NotifyID, Description, NotifyMode, Receiver, NotifyEventType, NotifyEventLevel, NotifyEquipID) VALUES (%d, '%s', %d, '%s', '%s', '%s', '%s')");
            //NotifyID = GetMaxNotifyID();
            NotifyID = GenerateEventFilterId();
            
            String sql = sbInsert.toString();
            sql = String.format(sql, NotifyID, description, NotifyMode, Receiver, NotifyEventType, NotifyEventLevel, NotifyEquipID);
            
            dbHelper.executeNoQuery(sql);
            
		} catch (Exception e) {
			log.error("InsertEventNotifyRule() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

        return NotifyID;
    }
	
	public int GetMaxNotifyID() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(NotifyID) FROM nt_eventnotifyrule");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = gEventFilterId++;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
					iMaxId++;
					gEventFilterId = iMaxId;
				}

			} catch (Exception e) {
				log.error("GetMaxNotifyID() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
	//根据时间戳生成ID
	public int GenerateEventFilterId()
	{
		Date date=new Date();  
		long lTime = date.getTime();
		int eventFilterId = (int)(lTime % 1000000000);
		
		return eventFilterId;
	}
		
	public ArrayList<EventNotifyRule> GetEventNotifyRule(int notifyId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM nt_eventnotifyrule WHERE NotifyID = %d");               
            String sql = sb.toString();
            sql = String.format(sql, notifyId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return EventNotifyRule.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetEventNotifyRule() failed.", e);
			
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		
	}
	
	public boolean DelEventNotifyRule(int notifyId) {
		
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format("DELETE FROM nt_eventnotifyrule WHERE NotifyID=%d", notifyId);
            dbHelper.executeNoQuery(sql);
			
			return true;

		} catch (Exception e) {
			log.error("DelEventNotifyRule() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return false;
				
	}
	
	public boolean UpdateEventNotifyReceiver(String receiver, int notifyId) {
		
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format("UPDATE nt_eventnotifyrule SET Receiver = '%s' WHERE NotifyID = %d", receiver, notifyId);
            dbHelper.executeNoQuery(sql);
			
			return true;

		} catch (Exception e) {
			log.error("UpdateEventNotifyReceiver() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return false;
				
	}

	public boolean DeleteEventNotifyReceiver(String receiver) {
		
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format("SELECT * FROM nt_eventnotifyrule WHERE Receiver LIKE '%%%s%%'", receiver);  
                        
            DataTable dt = dbHelper.executeToTable(sql);
            int rowCount = dt.getRowCount();
            if (rowCount > 0)
            {
            	DataRowCollection drs = dt.getRows();
            	for(int i=0;i<rowCount;i++)
        		{
            		int notifyId = (int) drs.get(i).getValue("NotifyID");
            		String Receivers = (String) drs.get(i).getValue("Receiver");
            		String[] paras = Receivers.split(";");
            		String tempReceivers = "";
            		
            		//去掉需要删除部分
            		for(String s : paras)
            		{
            			if(s.equals(receiver))
            			{
            				continue;
            			}
            			
            			if(tempReceivers.equals(""))
            			{
            				tempReceivers = s;
            			}
            			else
            			{
            				tempReceivers = tempReceivers + ";" + s;
            			}
            		}
            		
            		if(tempReceivers.equals(""))
            		{
            			//如果所有接收者被删除，需要删除该过滤器
            			DelEventNotifyRule(notifyId);
            		}
            		else
            		{
            			//更新过滤器接收者
            			UpdateEventNotifyReceiver(tempReceivers, notifyId);
            		}
        		}
            }

			return true;

		} catch (Exception e) {
			log.error("DeleteEventNotifyReceiver() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return false;
				
	}
	
	public int GetEventNotifyRuleNums() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iNums = 0;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT COUNT(*) FROM nt_eventnotifyrule");
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
				log.error("GetEventNotifyRuleNums() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iNums;
				
	}
	
}
