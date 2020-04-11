package nurse.logic.providers;

import java.util.Date;
import java.util.ArrayList;
import java.util.Calendar;

import nurse.entity.persist.DeviceChartMap;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.HistorySignal;
import nurse.entity.persist.Signal;
import nurse.entity.persist.SignalInstance;
import nurse.utility.DatabaseHelper;

public class SignalProvider {

	private static SignalProvider instance = new SignalProvider();
	private static Logger log = Logger.getLogger(SignalProvider.class);
	
	public SignalProvider() {
	}
	
	public static SignalProvider getInstance(){
		return instance;
	}

	public ArrayList<SignalInstance> getAllSignalInstances()
	{
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT A.EquipmentId, A.EquipmentName, A.EquipmentTemplateId, B.SignalId, B.SignalName,\r\n");
            sb.append("B.ShowPrecision,B.Unit,B.BaseTypeId from tbl_equipment A INNER JOIN tbl_signal B\r\n");
            sb.append("ON A.EquipmentTemplateId = B.EquipmentTemplateId\r\n");
            sb.append("WHERE B.`Enable`= true AND B.Visible = true;");
 
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return SignalInstance.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all sigs", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return null;
	}

	public ArrayList<HistorySignal> getHistorySignals(String ids, Date startTime, Date endTime) {
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = buildhisDataQuerySQLList(ids,startTime,endTime);
									
			DataTable dt = dbHelper.executeToTable(sql);
			return HistorySignal.getListFromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read history sigs", e);
			return new ArrayList<HistorySignal>();
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	@SuppressWarnings("deprecation")
	public String buildhisDataQuerySQLList(String ids, Date startTime, Date endTime) throws Exception {
		if (ids == null || ids.isEmpty()) throw new Exception("id is empty");
		StringBuffer sqlList = new StringBuffer();
		
		Calendar calStart=Calendar.getInstance();  
		calStart.setTime(startTime); 
		Calendar calEnd=Calendar.getInstance();  
		calEnd.setTime(endTime); 
		int startMonth = calStart.get(Calendar.MONTH)+1;
		int endMonth = calEnd.get(Calendar.MONTH)+1;
		int difMonth = endMonth - startMonth; //月份差
		int difYear = calEnd.get(Calendar.YEAR) - calStart.get(Calendar.YEAR);//年份差
		if(difYear!=0)
			difMonth = 12 * difYear + endMonth - startMonth;
		int month = endMonth;//当前月份
		Date time = endTime;//当前时间
		Date sTime = firstDay(time);
		Date eTime = time;
		if(difMonth==0)
			sqlList.append(buildhisDataQuerySQL(true,ids,startTime,endTime,month,1000));
		else
			sqlList.append(buildhisDataQuerySQL(true,ids,sTime,eTime,month,1000));
		
		int count = getHisDataQueryCount(month,1000,ids,sTime,eTime);
		if(count>=1000)
			return sqlList.toString();
		int length = 1000 - count;//剩余需要查询的条数
		
		for(int i=0;i<difMonth;i++){
			time = lastMonth(time);
			month = time.getMonth()+1;
			if((difMonth-i)==1)
				sTime = startTime;
			else
				sTime = firstDay(time);
			eTime = lastDay(time);
			sqlList.append(" union ");
			sqlList.append(buildhisDataQuerySQL(true,ids,sTime,eTime,month,length));
			count = getHisDataQueryCount(month,length,ids,sTime,eTime);//查询结果条数
			if(count>=length || i==1)//i==1 限制查询不超过三个月
				return sqlList.toString();
			length -= count;
		}
		return sqlList.toString();
	}
	//获得当前月份第一天
	private Date firstDay(Date time){
		Calendar cal=Calendar.getInstance();  
		cal.setTime(time);
		cal.set(Calendar.MONTH,cal.get(Calendar.MONTH));
		int minday =cal.getActualMinimum(Calendar.DAY_OF_MONTH);
		cal.set(Calendar.DAY_OF_MONTH, minday);
	    return cal.getTime();
	}
	//获得当前月份最后一天
	private Date lastDay(Date time){
		Calendar cal=Calendar.getInstance();  
		cal.setTime(time);
		cal.set(Calendar.MONTH,cal.get(Calendar.MONTH));
		int maxday =cal.getActualMaximum(Calendar.DAY_OF_MONTH);
        cal.set(Calendar.DAY_OF_MONTH, maxday);
        return cal.getTime();
	}
	//上一个月
	private Date lastMonth(Date time){
		Calendar cal=Calendar.getInstance();  
		cal.setTime(time);
		cal.add(Calendar.MONTH, -1);
		return cal.getTime();
	}
	//返回数据总条数
	private int getHisDataQueryCount(int month,int length,String ids,Date startTime,Date endTime){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String countSql = buildhisDataQuerySQL(false,ids,startTime,endTime,month,length);
			
			DataTable dt = dbHelper.executeToTable(countSql);
			if(dt.getRowCount()>0)
				return Integer.parseInt(dt.getRows().get(0).getValueAsString(0));
			return 0;
		} catch (Exception e) {
			log.error("fail to read history sigs", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return 0;
	}
	//生成SQL语句 t=true为查询数据列  t=falsw为查询数据条
	private String buildhisDataQuerySQL(boolean t,String ids, Date startTime, Date endTime,int month,int length){
		StringBuffer sb = new StringBuffer();
		StringBuffer wheresb = new StringBuffer();
		wheresb.append(" WHERE (");
		String idTemp = " (SignalId = %s AND EquipmentId = %s) OR ";
		String timeTemp = ") AND SampleTime BETWEEN '%tF' AND '%tF' ";
		if (!ids.isEmpty())
		{			
			String[] arr = ids.split("\\,");
			for(String s : arr)
			{
				if (s.isEmpty()) continue;
				String[] ar = s.split("\\.");
				wheresb.append(String.format(idTemp,ar[1],ar[0]));
			}
			wheresb.delete(wheresb.length() - 3, wheresb.length());
			wheresb.append(String.format(timeTemp, startTime, endTime));
			wheresb.append("\r\n");
		}
		if(t)
			sb.append(String.format(" (SELECT EquipmentId,EquipmentName,SignalId,FloatValue,SampleTime from tbl_historysignal%s ",
				month));
		else
			sb.append(String.format(" (SELECT count(1) from tbl_historysignal%s ",
				month));
		sb.append(wheresb.toString());
		sb.append(String.format(" ORDER BY SampleTime DESC LIMIT %s) ", length));
		return sb.toString();
	}
	
	public boolean InsertSignal(int EquipmentTemplateId,
	        int SignalId,
	        boolean Enable,
	        boolean Visible,
	        String Description,
	        String SignalName,
	        int SignalCategory,
	        int SignalType,
	        int ChannelNo,
	        int ChannelType,
	        String Expression,
	        Integer DataType,
	        String ShowPrecision,
	        String Unit,
	        Float StoreInterval,
	        Float AbsValueThreshold,
	        Float PercentThreshold,
	        Integer StaticsPeriod,
	        Integer BaseTypeId,
	        Float ChargeStoreInterVal,
	        Float ChargeAbsValue,
	        int DisplayIndex,
	        Integer MDBSignalId,
	        int ModuleNo) {

		DatabaseHelper dbHelper = null;
		try
	        {
				if (Description == null) Description = "";
				if (Expression == null) Expression = "";
	            if (Unit == null) Unit = "";
            
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_Signal");
	            sb.append("(EquipmentTemplateId, SignalId, Enable, Visible, Description, SignalName, ");
	            sb.append("SignalCategory, SignalType, ChannelNo, ChannelType, Expression, DataType, ");
	            sb.append("ShowPrecision, Unit, StoreInterval, AbsValueThreshold, PercentThreshold, ");
	            sb.append("StaticsPeriod, BaseTypeId, ChargeStoreInterVal, ChargeAbsValue, DisplayIndex, MDBSignalId, ModuleNo)");
	            sb.append("VALUES (%d, %d, %d, %d, '%s', '%s', %d, %d, %d, %d, '%s', %s, '%s', '%s', %s, %s, %s, %s, %s, %s, %s, %d, %s, %d)");

	            String sql = sb.toString();
	            sql = String.format(sql, EquipmentTemplateId, SignalId, Enable ? 1 : 0, Visible ? 1 : 0, Description, SignalName,
	                    SignalCategory, SignalType, ChannelNo, ChannelType, Expression, DataType == null ? "NULL" : DataType,
	                            ShowPrecision, Unit, StoreInterval == null ? "NULL" : StoreInterval, AbsValueThreshold == null ? "NULL" : AbsValueThreshold, PercentThreshold == null ? "NULL" : PercentThreshold,
	                            StaticsPeriod == null ? "NULL" : StaticsPeriod, BaseTypeId == null ? "NULL" : BaseTypeId, ChargeStoreInterVal == null ? "NULL" : ChargeStoreInterVal, ChargeAbsValue == null ? "NULL" : ChargeAbsValue, DisplayIndex, MDBSignalId == null ? "NULL" : MDBSignalId, ModuleNo);
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertSignal() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}
	
	public ArrayList<Signal> GetCommmunicationSignal(int EquipmentTemplateId, int SignalId)
	{
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Signal WHERE EquipmentTemplateId = %d AND SignalId = %d \r\n");
            String sql = sb.toString();
            sql = String.format(sql, EquipmentTemplateId, SignalId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return Signal.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to get Commmunication signal", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return null;
	}

	public ArrayList<Signal> GetSignalsById(int EquipmentTemplateId){
		ArrayList<Signal> list = new ArrayList<Signal>();
		DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append(String.format("SELECT * FROM TBL_Signal WHERE EquipmentTemplateId = %d;", EquipmentTemplateId));
 
            DataTable dt = dbHelper.executeToTable(sb.toString());
            list = Signal.fromDataTable(dt);
		} catch (Exception e) {
			log.error("Database exception ", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        return list;
	}
}
