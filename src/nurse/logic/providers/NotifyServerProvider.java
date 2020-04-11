package nurse.logic.providers;

import java.util.Date;

import org.apache.log4j.Logger;
import nurse.utility.DatabaseHelper;


public class NotifyServerProvider {

	private static NotifyServerProvider instance = new NotifyServerProvider();
	private static Logger log = Logger.getLogger(NotifyServerProvider.class);
	
	public NotifyServerProvider() {
	}
	
	public static NotifyServerProvider getInstance(){
		return instance;
	}

	public int AddNotifyServer(int notifyCategory)
    {

        int serverId = 0;
        DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format(" call PCT_SaveNotifyServer(%d)", notifyCategory);
			dbHelper.executeNoQuery(sql);
			serverId = GetMaxNotifyServerId();

		} catch (Exception e) {
			log.error("AddNotifyServer() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return serverId;
    }
	
	public int AddNotifyReceiver(String notifyReceiverName, String notifyReceiverContact, int notifyCategory)
    {
    
        int receiverId = 0;
        if (notifyReceiverContact == "")
        {
            notifyReceiverContact = "0";
        }
        
        DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql = String.format("call PCT_SaveNotifyReceiver ('%s','%s',%d)", notifyReceiverName, notifyReceiverContact, notifyCategory);
			dbHelper.executeNoQuery(sql);
			//receiverId = GetMaxNotifyReceiverId();
			receiverId = GenerateNotifyServerId();

		} catch (Exception e) {
			log.error("AddNotifyReceiver() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return receiverId;
    }
	
	public void AddNotifyServerReceiverMap(int notifyServerId, int notifyReceiverId, int eventFilterId, int notifyCategory)
    {
        DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql = String.format("call PCT_SaveNotifyReceiverMap (%d,%d,%d,%d)", notifyServerId, notifyReceiverId, eventFilterId, notifyCategory);
			dbHelper.executeNoQuery(sql);

		} catch (Exception e) {
			log.error("AddNotifyServerReceiverMap() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
    }
	
	public int GetMaxNotifyServerId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(NotifyServerId) FROM NotifyServer");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = -1;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
				}

			} catch (Exception e) {
				log.error("GetMaxNotifyServerId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
	//根据时间戳生成ID
	public int GenerateNotifyServerId()
	{
		Date date=new Date();  
		long lTime = date.getTime();
		int notifyServerId = (int)(lTime % 1000000000);
		
		return notifyServerId;
	}
		
	public int GetMaxNotifyReceiverId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("SELECT MAX(NotifyReceiverId) FROM NotifyReceiver");
	            String sql = sb.toString();
	            
	            res = dbHelper.executeScalar(sql);
	            if(res == null)
				{
	            	iMaxId = -1;
				}
				else
				{
					iMaxId = Integer.parseInt(res.toString());
				}

			} catch (Exception e) {
				log.error("GetMaxNotifyServerId() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return iMaxId;
				
	}
	
}
