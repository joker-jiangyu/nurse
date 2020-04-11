package nurse.logic.providers;

import java.io.IOException;
import java.net.Socket;

import org.apache.log4j.Logger;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.DatabaseHelper;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.BufferedReader;


public class SyncConfigProvider {

	private static SyncConfigProvider instance = new SyncConfigProvider();
	private static Logger log = Logger.getLogger(SyncConfigProvider.class);
	
	private Thread myThread;
	
	public SyncConfigProvider() {
	}
	
	public static SyncConfigProvider getInstance(){
		return instance;
	}
	
	public DataTable GetCenterTable()
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM TBL_SyncCenter";
			dt = dbHelper.executeToTable(sql);
			
		} catch (Exception e) {
			log.error("GetCenterTable() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return dt;
	}
	
	public int GetStationId()
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		int stationId = -1;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM TBL_Station";
			dt = dbHelper.executeToTable(sql);
			int rowCount = dt.getRowCount();
			if(rowCount <= 0)
			{
				//还没有初始化局站
				return stationId;
			}
			
			DataRowCollection drs = dt.getRows();
			for(int i=0;i<rowCount;i++)
    		{
				//获取中心Id字段
				stationId = (int) drs.get(i).getValue("StationId");
        		if(stationId != -1)
        		{
        			break;
        		}
    		}
			
		} catch (Exception e) {
			log.error("GetStationId() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return stationId;
	}
	
	public int GetCenterId()
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		int centerId = -1;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM TBL_SyncCenter";
			dt = dbHelper.executeToTable(sql);
			int rowCount = dt.getRowCount();
			if(rowCount <= 0)
			{
				//还没有初始化中心
				return centerId;
			}
			
			DataRowCollection drs = dt.getRows();
			for(int i=0;i<rowCount;i++)
    		{
				//获取中心Id字段
				centerId = (int) drs.get(i).getValue("CenterId");
        		if(centerId != -1)
        		{
        			break;
        		}
    		}
			
		} catch (Exception e) {
			log.error("GetCenterId() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return centerId;
	}

	public String GetCenterIP()
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		String centerIP = "";
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM TBL_SyncCenter";
			dt = dbHelper.executeToTable(sql);
			int rowCount = dt.getRowCount();
			if(rowCount <= 0)
			{
				//还没有初始化中心
				return "";
			}
			
			DataRowCollection drs = dt.getRows();
			for(int i=0;i<rowCount;i++)
    		{
				//获取中心Id字段
				centerIP = (String) drs.get(i).getValue("CenterIP");
        		if(centerIP != "")
        		{
        			break;
        		}
    		}
			
		} catch (Exception e) {
			log.error("GetCenterIP() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return centerIP;
	}
	
	public int GetCenterPort()
	{
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		int centerPort = -1;
		
		try {
			dbHelper = new DatabaseHelper();

			String sql = "SELECT * FROM TBL_SyncCenter";
			dt = dbHelper.executeToTable(sql);
			int rowCount = dt.getRowCount();
			if(rowCount <= 0)
			{
				//还没有初始化中心
				return centerPort;
			}
			
			DataRowCollection drs = dt.getRows();
			for(int i=0;i<rowCount;i++)
    		{
				//获取中心Id字段
				centerPort = (int) drs.get(i).getValue("CenterPort");
        		if(centerPort != -1)
        		{
        			break;
        		}
    		}
			
		} catch (Exception e) {
			log.error("GetCenterPort() fail", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return centerPort;
	}
	
	public boolean IsEnableSyncConfig()
	{
		try
        {
			DataTable dtCenter = GetCenterTable();
			
			if(dtCenter == null)
        	{
        		//还没有初始化中心
        		return false;
        	}
			
			int rowCount = dtCenter.getRowCount();
			if(rowCount <= 0)
			{
				//还没有初始化中心
				return false;
			}
			
			DataRowCollection drs = dtCenter.getRows();
			for(int i=0;i<rowCount;i++)
    		{
				//获取是否同步配置字段
        		boolean enable = (boolean) drs.get(i).getValue("Enable");
        		if(!enable)
        		{
        			return false;
        		}
    		}
			
			return true;
	
		} catch (Exception e) {
			log.error("IsEnableSyncConfig() failed.", e);
		} finally {
		}
		
		return false;
	}

	public boolean UpdateCenterInfo(int centerId, boolean isNeedSync)
	{
		DatabaseHelper dbHelper = null;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sbCenter=new StringBuilder();
            sbCenter.append("UPDATE TBL_SyncCenter center\r\n");
            sbCenter.append("SET center.IsNeedSync = %b\r\n");
            sbCenter.append("WHERE center.CenterId = %d");

            String sqlCenter = sbCenter.toString();
            sqlCenter = String.format(sqlCenter, isNeedSync, centerId);
            
            dbHelper.executeNoQuery(sqlCenter);
            
            return true;
		} catch (Exception e) {
			log.error("UpdateCenterInfo() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return false;
	}
	
	
	public void StartSyncConfig()
	{
		//1、更新数据库标志位
		int centerId = GetCenterId();
		UpdateCenterInfo(centerId, true);
		
		int stationId = GetStationId();
		String centerIP = GetCenterIP();
		int centerPort = GetCenterPort();
		
		//2、连接中心，告诉中心开始同步
		myThread = new Thread( new Runnable()
		{
			public void run()
			{
				try
				{
					while( true ){
						//客户端
						//1、创建客户端Socket，指定服务器地址和端口
						Socket socket =new Socket(centerIP,centerPort);
						//2、获取输出流，向服务器端发送信息
						OutputStream os = socket.getOutputStream();//字节输出流
						PrintWriter pw =new PrintWriter(os);//将输出流包装成打印流
						
						String strSend = "START_SYNCCONFIG:%d";
						strSend = String.format(strSend, stationId);
						pw.write(strSend);
						pw.flush();
						socket.shutdownOutput();
						
						//3、获取输入流，并读取服务器端的响应信息
						InputStream is = socket.getInputStream();
						BufferedReader br = new BufferedReader(new InputStreamReader(is));
						String info = null;
						while((info=br.readLine()) != null){
							if(info.indexOf("SUCCESS") != -1)
							{
								log.info("Sync config success.");
							}
							else
							{
								log.error("Sync config failed.");
							}
						}

						//4、关闭资源
						br.close();
						is.close();
						pw.close();
						os.close();
						socket.close();
						break;
					}
				}
				catch ( Exception e )
				{
					log.error("StartSyncConfig() failed.", e);
				}
			}
		});
		myThread.setDaemon( true );
		myThread.start();
		
		return;
	}
}
