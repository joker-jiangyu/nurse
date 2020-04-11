package nurse.logic.providers;


import nurse.common.DataTable;
import nurse.logic.handlers.ActiveSignalDataHandler;
import nurse.utility.DatabaseHelper;

import org.apache.log4j.Logger;

import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

public class DevControlProvider {

	public DevControlProvider() {
		
	}
	
	private static DevControlProvider instance = new DevControlProvider();
	private static Logger log = Logger.getLogger(DevControlProvider.class);
	
	public static DevControlProvider getInstance(){
		return instance;
	}

	public boolean SendControl(int deviceId,int basetypecontrolId,String parameterValue,String loginId) {
		//return MockHelper.getActiveSignals();	
		DatabaseHelper dbHelper = null;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder devsb=new StringBuilder();
	            devsb.append("select A.StationId,A.MonitorUnitId,B.ControlId from tbl_equipment A ");
	            devsb.append("LEFT JOIN tbl_control B ON A.EquipmentTemplateId=B.EquipmentTemplateId");
	            devsb.append(" where A.equipmentId="+deviceId+" and B.BaseTypeId="+basetypecontrolId+";");
	            //String deviceSql="select StationId,MonitorUnitId from tbl_equipment where EquipmentId="+deviceId;
	            DataTable dt = dbHelper.executeToTable(devsb.toString());
				//System.out.println("SQL:"+devsb.toString());
	            if(dt.getRowCount()==0) return false;
	            int site=(int)dt.getRows().get(0).getValue("StationId");
	            int hostid=(int)dt.getRows().get(0).getValue("MonitorUnitId");
	            int controlId=dt.getRows().get(0).getValue("ControlId")==null?0:(int)dt.getRows().get(0).getValue("ControlId");
	            
	            String sql = String.format("SELECT UserId FROM TBL_Account WHERE LogonId = '%s';", loginId);
	            dt = dbHelper.executeToTable(sql);
	            if(dt.getRowCount()==0) return false;
	            int userId = Integer.parseInt(dt.getRows().get(0).getValueAsString("UserId"));
	            
	            //String sql=String.format(" call PBL_SaveDistributeControl({0},{1},{2},{3},{4},{5},{6},{7},{8},@id)", site,hostid,deviceId,controlId,-1,parameterValue,"",0);
	            sql = " call PBL_SaveDistributeControl("+site+","+hostid+","+deviceId+","+controlId+","+userId+",'"+parameterValue+"','',0,@id)";
	            
	            dbHelper.executeNoQuery(sql);
	            log.info("Send Control OK! SQL:"+sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("send control failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
	public boolean checkLogin(String userName,String passWord){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("select * from tbl_account where logonId='%s' and Password='%s'",
					userName,passWord);
			DataTable dt = dbHelper.executeToTable(sql);
			if(dt.getRowCount() > 0) return true;
		} catch (Exception e) {
			log.error("Database exception.",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return false;
	}
	/**
	 * 定时移除控制命令
	 */
	public void removeCommand(){
		DoorProvider.getInstance().SaveDoorCardData();
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "INSERT INTO tbl_historycontrol SELECT * FROM tbl_activecontrol WHERE "
					+ "(ControlResultType IS NOT NULL AND ControlResultType <> '' AND ControlResultType <> 4 "
					+ "AND ControlPhase = 4) OR StartTime < SUBDATE(now(),interval 5 minute);";
			int i = dbHelper.executeNoQuery(sql);
			if(i>0){
				sql = "DELETE FROM tbl_activecontrol WHERE (ControlResultType IS NOT NULL "
						+ "AND ControlResultType <> '' AND ControlResultType <> 4 AND ControlPhase = 4) "
						+ "OR StartTime < SUBDATE(now(),interval 5 minute);";
				dbHelper.executeNoQuery(sql);
				log.debug("Remove control command successfully");
			}
		} catch (Exception e) {
			log.error("Database connection exception:", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}

	public String SendControlCinkage(String requestParams, String inetIp){
		try {
			System.out.println("SendControlCinkage:"+requestParams);
			String[] split = requestParams.split("\\+");
			String userName = split[0];

			return CreateThreadTask(split[1],userName,inetIp);
		}catch (Exception e){
			log.error("SendControlCinkage Exception:",e);
			return "danger";
		}
	}

	private String CreateThreadTask(String param, String userName, String inetIp){
		String result = "";
		try {
			Timer timer = new Timer();
			timer.schedule(new TimerTask() {
				public void run() {
					for(String obj : param.split("\\&")){
						String[] o = obj.split("\\|");
						int delay = Integer.parseInt(o[0]);
						int deviceId = Integer.parseInt(o[1]);
						int baseTypeId = Integer.parseInt(o[2]);
						String parameterValue = o[3];
						//创建定时任务 并 下发控制
						CreateSleepTask(delay, deviceId, baseTypeId, parameterValue, userName);
						//用户操作日志
						UserOperationLogProviders.getInstance().insertUserOperationLog(50, userName, inetIp, String.valueOf(deviceId),
								String.valueOf(baseTypeId), parameterValue, null, "");
					}
				}
			},0);
			//System.out.println("End Date:"+(new Date().toString()));
			result = "success";
		}catch (Exception e){
			log.error("CreateThreadTask Exception:",e);
			result = "danger";
		}
		return result;
	}

	private void CreateSleepTask(int delay, int deviceId, int baseTypeId, String paramValue, String loginId){
		//System.out.println("Start Date:"+(new Date().toString()));

		if(delay > 0){
			try {
				Thread.sleep(1000*delay);
			} catch (InterruptedException ex) {
				log.error("CreateSleepTask Thread Exception:",ex);
			}
		}

		if(ActiveSignalDataHandler.proxy==null)
			ActiveSignalDataHandler.proxy = new RealDataProvider();
		for(int i=0;i<3;i++){
			ActiveSignalDataHandler.proxy.GetData(8888);
		}

		SendControl(deviceId,baseTypeId,paramValue,loginId);
		//System.out.println("Execute Date:"+(new Date().toString()));
	}

	private boolean SendControls(int deviceId,int controlId,String parameterValue,String loginId) {
		//return MockHelper.getActiveSignals();
		DatabaseHelper dbHelper = null;
		try
		{
			dbHelper = new DatabaseHelper();
			StringBuilder devsb=new StringBuilder();
			devsb.append("select A.StationId,A.MonitorUnitId,B.ControlId from tbl_equipment A ");
			devsb.append("LEFT JOIN tbl_control B ON A.EquipmentTemplateId=B.EquipmentTemplateId");
			devsb.append(" where A.equipmentId="+deviceId+" and B.ControlId="+controlId+";");
			DataTable dt = dbHelper.executeToTable(devsb.toString());
			//System.out.println("SQL:"+devsb.toString());
			if(dt.getRowCount()==0) return false;
			int site=(int)dt.getRows().get(0).getValue("StationId");
			int hostid=(int)dt.getRows().get(0).getValue("MonitorUnitId");

			String sql = String.format("SELECT UserId FROM TBL_Account WHERE LogonId = '%s';", loginId);
			dt = dbHelper.executeToTable(sql);
			if(dt.getRowCount()==0) return false;
			int userId = Integer.parseInt(dt.getRows().get(0).getValueAsString("UserId"));

			sql = " call PBL_SaveDistributeControl("+site+","+hostid+","+deviceId+","+controlId+","+userId+",'"+parameterValue+"','',0,@id)";

			dbHelper.executeNoQuery(sql);
			log.info("Send Control OK! SQL:"+sql);

			return true;
		} catch (Exception e) {
			log.error("send control failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

		return false;

	}
}
