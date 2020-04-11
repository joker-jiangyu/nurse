package nurse.logic.providers;

import java.sql.CallableStatement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;

import nurse.common.DataSet;
import nurse.common.DataTable;
import nurse.common.LiteEventListener;
import nurse.common.LiteEventObject;
import nurse.entity.persist.ActiveAlarm;
import nurse.entity.persist.AlarmChange;
import nurse.utility.DatabaseHelper;

public class ActiveAlarmProvider {

	private static Logger log = Logger.getLogger(ActiveAlarmProvider.class);
	private ConcurrentHashMap<String, ActiveAlarm> alarmCache = new ConcurrentHashMap<String, ActiveAlarm>();
	private long maxSerialNo = 0;
	private ArrayList<LiteEventListener> listeners = new ArrayList<LiteEventListener>(); // 存储所有注册进来的事件监听器对象;
	private Timer timer = new Timer();
	
	public ActiveAlarmProvider() {

		initAlarmCache();
	}

	private static ActiveAlarmProvider instance = new ActiveAlarmProvider();

	public static ActiveAlarmProvider getInstance() {
		return instance;
	}

	public ArrayList<ActiveAlarm> GetAllAlarms() {
		ArrayList<ActiveAlarm> als = new ArrayList<ActiveAlarm>(alarmCache.values());
		
		Collections.sort(als,
                (a1, a2) -> a2.startTime.compareTo(a1.startTime));

		return als;
	}

	public void closeAlarmCache(int equipmentId){
		for(Map.Entry<String, ActiveAlarm> entry : this.alarmCache.entrySet()){
			if(entry.getValue().deviceId == equipmentId)
				this.alarmCache.remove(entry.getKey());
		}
		
	}
	
	private void initAlarmCache() {
		List<ActiveAlarm> alarms = readAllAlarm();

		//因为去掉确认，所以对activeEvent中的无确认但结束的告警删除。
		CleanUnconfirmedEndAlarms(alarms);
		
		alarms.forEach((alarm) -> addOrUpdate(alarm));		

	    timer.schedule(new TimerTask(){   
            public void run() {  
            	syncDatabase();
            }  
        },1000,3000);//过1秒执行，之后每隔3秒执行一次
	}

    private void CleanUnconfirmedEndAlarms(List<ActiveAlarm> alarms) {
		ArrayList<ActiveAlarm> needRemoves = new ArrayList<ActiveAlarm>();
		ArrayList<String> ids = new ArrayList<String>();
		
		alarms.forEach((alarm)->{
			if (alarm.endTime != null && alarm.confirmTime == null)
				needRemoves.add(alarm);
		});
		
		StringBuilder idSection = new StringBuilder(4000);
		idSection.append("'");
		
		needRemoves.forEach((a)->{
			alarms.remove(a);
			
			idSection.append(a.uniqueId);
			idSection.append("','");
			if (idSection.length() > 2000){
				idSection.delete(idSection.length() - 4,idSection.length() - 1);
				ids.add(idSection.toString());
				idSection.setLength(0);
				idSection.append("'");
			}			
		});	
		
		if (idSection.length() > 1){
			idSection.delete(idSection.length() - 4,idSection.length() - 1);
			ids.add(idSection.toString());			
		}
		
		ids.forEach((s)->{
			EndAlarms(s,"admin","");
		});
	}

	// 同步数据库
    // 移除不在数据库中活动事件
    // 添加数据库中新的活动事件
    // 根据数据库更新旧活动事件
    public void syncDatabase()
    {
        ArrayList<AlarmChange> alarmChanges = readAlarmChange();
        
        alarmChanges.forEach((alarmChange)->{
            updateCacheByAlarmChange(alarmChange);
            updateMaxSerialNo(alarmChange);        	
        });
    }
    
    private void updateMaxSerialNo(AlarmChange alarmChange) {
        //更新序列号
        if (alarmChange.serialNo > maxSerialNo)
        {
            maxSerialNo = alarmChange.serialNo;
        }
	}

    private void updateCacheByAlarmChange(AlarmChange alarmChange) {
        try
        {
            if (alarmChange.operationType == AlarmOperationType.Start)
            {
                //开始告警
                addOrUpdate(alarmChange);
                //自诊断设备监控
				verifyDiagnostic(alarmChange);
            }
            else if (alarmChange.operationType == AlarmOperationType.End)
            {
                //结束告警
//                if (alarmChange.confirmTime == null)
//                {
//                    addOrUpdate(alarmChange);
//                }
//                else
                {
                    delete(alarmChange.uniqueId);
                }
            }
            else if (alarmChange.operationType == AlarmOperationType.Confirm)
            {
                //确认告警
                if (alarmChange.endTime == null)
                {
                    addOrUpdate(alarmChange);
                }
                else
                {
                    delete(alarmChange.uniqueId);
                }
            }
            else
            {
                //更新告警
                addOrUpdate(alarmChange);
            }

            notifyAlarmChange(alarmChange);
        }
        catch (Exception ex)
        {
            log.error("fail to update ActiveAlarmCacheByAlarmChange", ex);
        }
	}

    private void notifyAlarmChange(AlarmChange alarmChange) {
		for (LiteEventListener listener : this.listeners) {
			listener.Handle(new LiteEventObject(this, "AlarmChange", alarmChange));
		}
	}

	public void delete(String uniqueId)
    {
    	ActiveAlarm aa = this.alarmCache.remove(uniqueId);
		//EndAlarms('\'' + uniqueId + '\'', "");
    	if (aa != null) notifyActiveAlarm(aa);
    }
    
	private ArrayList<AlarmChange> readAlarmChange()
    {
        DatabaseHelper dbHelper = null;
        
        try
        {
        	dbHelper = new DatabaseHelper();
        	
        	CallableStatement stat = dbHelper.prepareProcedure("PBL_GetAlarmChange", "?");
        	stat.setLong(1, this.maxSerialNo);

            DataTable dt = dbHelper.executeQuery(stat);

            ArrayList<AlarmChange> acs = AlarmChange.getAlarmChangeListFromDataTable(dt);

            //需要按序列号排序
            Collections.sort(acs, new Comparator<AlarmChange>() {
                @Override
                public int compare(AlarmChange  ac1, AlarmChange  ac2)
                {
                    return  (int) (ac1.serialNo - ac2.serialNo);
                }
            });
            
            return acs;
        }
        catch (Exception e)
        {        	
            log.error("fail to read alarm change error:", e);
            return new ArrayList<AlarmChange>();
        }
        finally
        {
        	if(dbHelper != null) dbHelper.close();
        }
    }
    
	private void addOrUpdate(ActiveAlarm newAlarm) {
		ActiveAlarm existAlarm = select(newAlarm.uniqueId);
		if (existAlarm != null) {
			updateActiveAlarm(newAlarm, existAlarm);
		} else {
			addActiveAlarm(newAlarm.uniqueId, newAlarm);
		}
	}

	private void addActiveAlarm(String uniqueId, ActiveAlarm newAlarm) {
		newAlarm.LastUpdateDateTime = new Date();
		this.alarmCache.put(uniqueId, newAlarm);
		notifyActiveAlarm(newAlarm);
	}

	private void notifyActiveAlarm(ActiveAlarm alarm) {
		for (LiteEventListener listener : this.listeners) {
			listener.Handle(new LiteEventObject(this, "ActiveAlarm", alarm));
		}
	}

	// 把一个事件监听器对象注册进来;
	public void addListener(LiteEventListener listener) 
	{
		this.listeners.add(listener);
	}

	// 移除一个已经注册的事件监听器对象
	public void removeListener(LiteEventListener listener) 
	{
		this.listeners.remove(listener);
	}

	private void updateActiveAlarm(ActiveAlarm newAlarm, ActiveAlarm existAlarm) {
		try {
			existAlarm = (ActiveAlarm) newAlarm.clone();
		} catch (CloneNotSupportedException e) {
			e.printStackTrace();
		}

		existAlarm.LastUpdateDateTime = new Date();
		notifyActiveAlarm(existAlarm);
	}

	public ActiveAlarm select(String uniqueId) {
		return this.alarmCache.get(uniqueId);
	}

	// 获取数据库中所有活动告警并返回最大的告警变化序列号
	public ArrayList<ActiveAlarm> readAllAlarm() {
		ArrayList<ActiveAlarm> alarms = new ArrayList<ActiveAlarm>();
		DatabaseHelper dbHelper = null;

		try {
			dbHelper = new DatabaseHelper();

			CallableStatement stat = dbHelper.prepareProcedure("PBL_GetActiveEvent");

			DataSet ds = dbHelper.execute(stat);

			// get maxNo
			Object res = ds.getDataTable(1).getRows().get(0).getValue(0);
			
			if (res != null)
			{
				maxSerialNo = Long.parseLong(res.toString());
			}
			else
			{
				maxSerialNo = 0;
			}
			
			// get alarms
			DataTable alarmTable = ds.getDataTable(0);
			
			log.info("PBL_GetActiveEvent EventList Size:"+alarmTable.getRowCount()+", Date:"+(new Date()));
	
			return ActiveAlarm.GetListFromDataTable(alarmTable);

		} catch (Exception e) {
			log.error("fail to read all active alarms", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

		return alarms;
	}

	// 强制结束一批事件
	// sequenceIds 事件流水号  ex: 'xxx','yyy','zzz'
	// note 注释内容
	public void EndAlarms(String sequenceIds,String logonId, String note) {
		
		if (sequenceIds == null || sequenceIds.length() < 1) return;
		
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = String.format("SELECT UserId FROM TBL_Account WHERE LogonId = '%s';", logonId);
            DataTable dt = dbHelper.executeToTable(sql);
            int userId = -1;
            if(dt.getRowCount() > 0){
            	userId = Integer.parseInt(dt.getRows().get(0).getValueAsString("UserId"));
            }
            
            CallableStatement stat  = dbHelper.prepareProcedure("PAM_CancelEvent","?,?,?");
            
            stat.setString(1, sequenceIds);
            stat.setInt(2, userId);
            stat.setString(3, note);

            dbHelper.execute(stat);
        }
        catch (Exception e)
        {
            log.error("fail to close event error", e);
        }
	}
	
	// 获取最新的结束告警，By:网络电话配置表有数据时
	public List<ActiveAlarm> GetNewHistoryAlarm(){
		List<ActiveAlarm> list = new ArrayList<ActiveAlarm>();
		DatabaseHelper dbHelper = null;
		try {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_HistoryEvent WHERE EndTime > SUBDATE(now(),interval 30 second);");       
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            list = ActiveAlarm.GetListFromDataTable(dt);
		} catch (Exception e) {
			log.error("GetNewHistoryAlarm : ", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return list;
	}

	/** 判断是否是自诊断设备 */
	public void verifyDiagnostic(ActiveAlarm newAlarm){
		ActiveAlarm alarm = select(newAlarm.uniqueId);
		if(alarm.baseTypeId == 2001328001){
			HardDiskMonitorProvider.getInstance().start(alarm.deviceId,alarm.triggerValue);
		}
	}
}
