package nurse.stream;

import java.util.ArrayList;

import com.espertech.esper.client.Configuration;
import com.espertech.esper.client.EPServiceProvider;
import com.espertech.esper.client.EPServiceProviderManager;
import com.espertech.esper.client.EPStatement;

import nurse.entity.persist.ActiveAlarm;
import nurse.entity.persist.ActiveSignal;

public class StreamProcessor {

	private static StreamProcessor instance = new StreamProcessor();
	private EPServiceProvider epService = null;  
	
	public static StreamProcessor getInstance(){
		return instance;
	}
	
	public StreamProcessor() {
        //Creating a configuration  
        Configuration config= new Configuration();  
        
        //添加包路径，这样在查询表达式中就不需要写类的全路径了
        config.addEventTypeAutoName("nurse.entity.persist");
        //添加包路径，这样在查询表达式中就不需要写类的全路径了
        config.addEventTypeAutoName("nurse.entity.transfer");
        
        config.addEventType("ActiveAlarm", ActiveAlarm.class);
        config.addEventType("ActiveSignal", ActiveSignal.class);
        
        epService = EPServiceProviderManager.getProvider("default", config); 
	}
	
	public void sendEvent(Object obj)
	{
		epService.getEPRuntime().sendEvent(obj);
	}
	
	public void register(StreamListenerBase listener)
	{
		EPStatement statement = epService.getEPAdministrator().
				createEPL(listener.getExpression());
		
        //Adding a listener  
        statement.addListener(listener);
	}
	
	public void prepare()
	{
		register(new ActiveAlarmCountByLevelListener());
	}
	
	public void Mock()
	{
		prepare();
		
		try {
			
			//Replaced with 
			ArrayList<ActiveAlarm> alarms = new ArrayList<ActiveAlarm>(); 
			//ArrayList<ActiveAlarm> alarms = MockHelper.getActiveAlarms();
			
			for(ActiveAlarm a : alarms)
			{
				sendEvent(a);
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
