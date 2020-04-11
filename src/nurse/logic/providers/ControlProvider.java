package nurse.logic.providers;
import org.apache.log4j.Logger;

import java.lang.Thread;
import java.net.DatagramPacket;
import java.util.*;
import java.util.concurrent.locks.Lock;  
import java.util.concurrent.locks.ReentrantLock;
import nurse.utility.DatabaseHelper;
import nurse.webServer.*;
import nurse.common.DataTable;
import nurse.entity.persist.*;

public class ControlProvider {

	private static ControlProvider instance = new ControlProvider();
	private static Logger log = Logger.getLogger(ControlProvider.class);
	
	public ControlProvider() {
	}
	
	public static ControlProvider getInstance(){
		return instance;
	}
	
	public boolean InsertControl(int EquipmentTemplateId,
            int ControlId,
            String ControlName,
            int ControlCategory,
            String CmdToken,
            Integer BaseTypeId,
            int ControlSeverity,
            Integer SignalId,
            Float TimeOut,
            Integer Retry,
            String Description,
            boolean Enable,
            boolean Visible,
            int DisplayIndex,
            int CommandType,
            Integer ControlType,
            Integer DataType,
            Float MaxValue,
            Float MinValue,
            Float DefaultValue,
            int ModuleNo) {

		DatabaseHelper dbHelper = null;
		try
	        {
				if (CmdToken == null) CmdToken = "";
	            if (Description == null) Description = "";
            
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_Control");
	            sb.append("(EquipmentTemplateId, ControlId, ControlName, ControlCategory, CmdToken, ");
	            sb.append("BaseTypeId, ControlSeverity, SignalId, TimeOut, Retry, Description, Enable, Visible, ");
	            sb.append("DisplayIndex, CommandType, ControlType, DataType, MaxValue, MinValue, DefaultValue, ModuleNo)");
	            sb.append("  VALUES (%d, %d, '%s', %d, '%s', %s, %d, %s, %s, %s, '%s', %d, %d, %d, %d, %s, %s, %f, %f, %s, %d)");

	            String sql = sb.toString();
	            sql = String.format(sql, EquipmentTemplateId, ControlId, ControlName, ControlCategory, CmdToken,
	                    BaseTypeId == null ? "NULL" : BaseTypeId, ControlSeverity, SignalId == null ? "NULL" : SignalId, 
	                    		TimeOut == null ? "NULL" : TimeOut, Retry == null ? "NULL" : Retry, Description, Enable ? 1 : 0, 
	                    		Visible ? 1 : 0,  DisplayIndex, CommandType, ControlType == null ? "NULL" : ControlType, 
	                    		DataType == null ? "NULL" : DataType, MaxValue, MinValue, DefaultValue == null ? "NULL" : DefaultValue, ModuleNo);
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertControl() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
	public UDPServer server;
	private Map<Integer,Integer> map; 
	private Lock lock = new ReentrantLock(); 
	public void init(int listenPort,int destPort){
    	try {
			server = new UDPServer();
			server.open(listenPort);
			server.destPort = destPort;
			map = new HashMap<Integer,Integer>();
		} 
		catch (Exception e) 
		{
			e.printStackTrace(); 
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
			e.printStackTrace(); 
		}
	}
    public void run(){
    	if(server == null){
    		init(6001,5001);
    	}
		while(true)	{
	    	try {
	    		Thread.sleep(10);
	    		String recvStrAll="";
				DatagramPacket recvPacket = null;
				do{
					recvPacket = server.receive();
					String recvStr = new String(recvPacket.getData() , 0 , recvPacket.getLength());
					//System.out.println("recv length:" + recvPacket.getLength());
					System.out.println("recv ack:" + recvStr);
					recvStrAll += recvStr;
				}while(recvPacket.getLength() > 63*1024);
				String[] str = recvStrAll.split("\\#");
				int sequenceID = 0;
				int result = 0;
				if(str.length >= 2)	{
					sequenceID = Integer.parseInt(str[0]);
					result = Integer.parseInt(str[1]);
					if(recvStrAll.indexOf("ack") > 0){
						recvStrAll = recvStrAll.replaceAll("ack", "ok");
						send(recvStrAll,0);
						System.out.println("send ack:" + recvStrAll);
					}
				}
				lock.lock();
				map.put(sequenceID, result);
			} 
    		catch (Exception e){
    			e.printStackTrace(); 
    		}
	    	finally{  
	            lock.unlock();  
	        } 
		}
    }
    public int GetControlResult(int sequenceID) {
    	int result = 0;
    	try{
    		lock.lock();
    		if(sequenceID > 0 && map.containsKey(sequenceID)){
    			result = map.get(sequenceID);
    		}
	    } 
		catch (Exception e)	{
			e.printStackTrace(); 
		}
		finally	{  
	        lock.unlock();  
	    } 
    	return result;
    }
    public int GetControlResult(ActiveControl cmd) {
    	int result = 0;
    	
    	try{
    		result = GetControlResult(cmd.SerialNo);
	    } 
		catch (Exception e)	{
			e.printStackTrace(); 
		}
		 
    	
    	return result;
    }
    
    public int SendControl(ActiveControl cmd) {
    	int result = 0;
    	
    	try{
    		if(map == null)	{
    			map = new HashMap<Integer,Integer>();
    		}
    		lock.lock();
    		if(!map.containsKey(cmd.SerialNo)){
    			map.put(cmd.SerialNo, result);
    		}
    		lock.unlock();
    		for(int i=0;i<3;i++){
    			System.out.println("send:" + cmd.Data2String());
	    		send(cmd.Data2String(),0);
	    		
	    		for(int j=0;j<6;j++){
		    		result = GetControlResult(cmd.SerialNo);
		    		if(result != 0)
		    		{
		    			System.out.println("recv ack result:" + result);
		    			return result;
		    		}
		    		Thread.sleep(500);
	    		}
	    		Thread.sleep(1000);
    		}
	    } 
		catch (Exception e)	{
			e.printStackTrace(); 
		} 
    	
    	return result;
    }
    
    public void close() {
    	try	{
    		server.close();
	    } 
		catch (Exception e)	{
			e.printStackTrace(); 
		}
    }

    public ArrayList<Control> GetControlsById(int EquipmentTemplateId){
		ArrayList<Control> list = new ArrayList<Control>();
		DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append(String.format("SELECT * FROM TBL_Control WHERE EquipmentTemplateId = %d;", EquipmentTemplateId));
 
            DataTable dt = dbHelper.executeToTable(sb.toString());
            list = Control.fromDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception ", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        return list;
    }
    
    public ArrayList<Control> GetRemoteControlsById(int EquipmentTemplateId){
    	ArrayList<Control> list = new ArrayList<Control>();
		DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append(String.format("SELECT * FROM TBL_Control WHERE EquipmentTemplateId = %d;", EquipmentTemplateId));
 
            DataTable dt = dbHelper.executeToTable(sb.toString());
            list = Control.fromDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception ", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        return list;
    }


    public Control getControlById(int deviceId, int baseTypeId){
		DatabaseHelper dbHelper = null;
		try
		{
			dbHelper = new DatabaseHelper();
			StringBuilder sb = new StringBuilder();
			sb.append("SELECT A.* FROM TBL_Control A ");
			sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
			sb.append(String.format("WHERE EquipmentId = %d AND BaseTypeId = %d;", deviceId,baseTypeId));

			DataTable dt = dbHelper.executeToTable(sb.toString());
			ArrayList<Control> list = Control.fromDataTable(dt);
			if(list != null && list.size() > 0)
				return list.get(0);
		} catch (Exception e) {
			log.error("getControlById exception ", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return null;
	}
}