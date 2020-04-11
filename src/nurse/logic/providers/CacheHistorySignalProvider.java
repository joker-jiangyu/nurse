package nurse.logic.providers;

import java.sql.CallableStatement;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;


import nurse.common.DataSet;
import nurse.common.DataTable;
import nurse.entity.persist.ChartHistorySignal;
import nurse.entity.persist.Puerecord;
import nurse.entity.persist.SignalMeanings;
import nurse.utility.DatabaseHelper;
import nurse.utility.MainConfigHelper;

public class CacheHistorySignalProvider {
	private static CacheHistorySignalProvider instance = new CacheHistorySignalProvider();
	private static Logger log = Logger.getLogger(CacheHistorySignalProvider.class);
	
	private ArrayList<ChartHistorySignal> historySignals = new ArrayList<ChartHistorySignal>();
	private ArrayList<Puerecord> pueRecords = new ArrayList<Puerecord>();
	private long nowTime = 0;

	public static CacheHistorySignalProvider getInstance(){
		return instance;
	}
	
	public void factory(){
		try {
			SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd"); 
			long nowTime = format.parse((String) format.format(new Date())).getTime();
			
			if(nowTime == 0 || nowTime > this.nowTime){
				loadHistoryData();
				this.nowTime = nowTime;
			}
			
		} catch (Exception e) {
			log.error("factory Exception:"+e);
		}
	}
	
	private void loadHistoryData(){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String days = MainConfigHelper.getConfig().cacheDays;
			CallableStatement stat = dbHelper.prepareProcedure("PRO_CacheHistorySignal","?");
			stat.setInt(1, Integer.parseInt(days));
			DataSet ds = dbHelper.execute(stat);
			
			DataTable dt = ds.getDataTable(0);
			this.historySignals = ChartHistorySignal.getAllListFromDataTable(dt);
			
			dt = ds.getDataTable(1);
			this.pueRecords = Puerecord.getPuerecoreData(dt);
			
			log.info("Cache HistorySignals Size:"+this.historySignals.size()+" PueRecords Size:"+this.pueRecords.size());
		} catch (Exception e) {
			log.error("loadHistoryData Exception:"+e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<ChartHistorySignal> getAllHistorySignals(){
		return this.historySignals;
	};
	
	public ArrayList<Puerecord> getAllPueRecords(){
		return this.pueRecords;
	}
	
	public List<ChartHistorySignal> getHistorySignalsById(int deviceId,int baseTypeId){
		return this.historySignals.stream()
				.filter(d -> (d.deviceId == deviceId && d.baseTypeId == baseTypeId))
				.collect(Collectors.toList());
	};
	
	public ArrayList<ChartHistorySignal> getHistorySignalsByDay(int deviceId,int baseTypeId,int day){
		List<ChartHistorySignal> historySignals = getHistorySignalsById(deviceId,baseTypeId);
		ArrayList<ChartHistorySignal> list = new ArrayList<ChartHistorySignal>();
		try {
			SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd"); 
			Calendar rightNow = Calendar.getInstance();
			rightNow.setTime(new Date());
	        rightNow.add(Calendar.DAY_OF_YEAR,-day);
			long nowTime = rightNow.getTime().getTime();
			
			for(ChartHistorySignal hs : historySignals){
				Date dd = format.parse(hs.sampleTime.toString());
		        long curTime = dd.getTime();
		        
		        if(nowTime <= curTime)
		        	list.add(hs);
			}
		} catch (Exception e) {
			log.error("getHistorySignalsByDay Exception:"+e);
		}
		return list;
	}
	
	public ArrayList<Puerecord> getAllPueRecordsByDay(int day){
		ArrayList<Puerecord> list = new ArrayList<Puerecord>();
		try {
			Calendar rightNow = Calendar.getInstance();
			rightNow.setTime(new Date());
	        rightNow.add(Calendar.DAY_OF_YEAR,-day);
			long nowTime = rightNow.getTime().getTime();
						
			for(Puerecord pue : this.pueRecords){
		        long curTime = pue.collectTime.getTime();
		        
		        if(nowTime <= curTime)
		        	list.add(pue);
			}
		} catch (Exception e) {
			log.error("getAllPueRecordsByDay Exception:",e);
		}
		return list;
	}

	/**
	 * 将集合转为对象
	 * @param chss
	 * @return {dates:[],datas:[],name:,unit:,category:}
	 */
	public String toChartDataJson(ArrayList<ChartHistorySignal> chss,int deviceId,int baseTypeId){
		String result = "{\"dates\":[%s],\"datas\":[%s],\"name\":\"%s\",\"unit\":\"%s\",\"category\":\"%s\",\"yAxis\":[%s]}";
		try {
			SimpleDateFormat format = new SimpleDateFormat("MM-dd"); 
			String dates = "",datas = "",name = "",unit = "",yAxis = "";
			int category = 1;
			for(ChartHistorySignal chs : chss){
				if(dates.equals("")){
					dates = String.format("\"%s\"", format.format(chs.sampleTime));
					datas = String.format("\"%s\"", chs.floatValue);
				}else{
					dates += String.format(",\"%s\"", format.format(chs.sampleTime));
					datas += String.format(",\"%s\"", chs.floatValue);
				}
			}
			if(chss != null && chss.size() > 0){
				name = chss.get(0).signalName;
				unit = chss.get(0).unit;
				category = chss.get(0).signalCategory;
			}
			if(category == 2)
				yAxis = parseYAxis(deviceId,baseTypeId);
			
			return String.format(result, dates, datas, name, unit, category, yAxis);
		} catch (Exception e) {
			log.error("toChartJson Exception:",e);
			return "{\"dates\":[],\"datas\":[],\"name\":\"\",\"unit\":\"\",\"category\":\"1\"}";
		}
	}
	
	private String parseYAxis(int deviceId,int baseTypeId){
		ArrayList<SignalMeanings> sms = getSignalMeanings(deviceId,baseTypeId);
		String yAxis = "";
		for(SignalMeanings sm : sms){
			if(yAxis.equals(""))
				yAxis = String.format("{\"val\":%s,\"text\":\"%s\"}", sm.StateValue, sm.Meanings);
			else
				yAxis += String.format(",{\"val\":%s,\"text\":\"%s\"}", sm.StateValue, sm.Meanings);
		}
		
		return yAxis;
	}
	
	private ArrayList<SignalMeanings> getSignalMeanings(int deviceId,int baseTypeId){
		DatabaseHelper dbHelper = null;
		ArrayList<SignalMeanings> list = new ArrayList<SignalMeanings>();
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append("SELECT C.* FROM TBL_Equipment A ");
	            sb.append("LEFT JOIN TBL_Signal B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
	            sb.append("LEFT JOIN TBL_SignalMeanings C ON B.SignalId = C.SignalId AND A.EquipmentTemplateId = C.EquipmentTemplateId ");
	            sb.append(String.format("WHERE A.EquipmentId = %s AND B.BaseTypeId = %s;", deviceId,baseTypeId));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	            
	            list = SignalMeanings.fromDataTable(dt);
			} catch (Exception e) {
				log.error("fail to get getSignalMeanings event", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return list;
	}
}
