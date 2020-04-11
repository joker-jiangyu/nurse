package nurse.stream;

import org.apache.log4j.Logger;

import com.espertech.esper.client.EventBean;

/**
 * 这个类目前无法使用，Esper的流分析是以时间和长度为缓冲的是静态的，而这个业务是要考虑目前现存的活动告警
 * 实际上是一个不断被修改的缓冲中统计的，采用流分析就会有旧数据依然存在或扔掉存在告警的情况
 * 
 * 采用Esper的方法可以创建一个命名窗口(类似表)当告警变化时对这个表进行++或--（根据告警开始和结束是否存在）
 * 这样也可以达到这个效果，但这样的话和写存储过程没什么两样，而目前对AlarmList进行count也很快，所以不需要用流分析
 * 
 * 废弃此代码，仅作为如何x
 * @author HP
 *
 */
public class ActiveAlarmCountByLevelListener  extends StreamListenerBase{
	
	private Logger log = Logger.getLogger(ActiveAlarmCountByLevelListener.class);
	
	public ActiveAlarmCountByLevelListener() {
	}

	@Override
	public String getExpression(){
		return "select alarmLevel, count(*) as total from ActiveAlarm.win:length(10000) where endTime is null group by alarmLevel";
	}
	
	@Override
	public void update(EventBean[] newEvents, EventBean[] oldEvents) {
		log.debug("AlarmLevel:" + newEvents[0].get("alarmLevel") + "  COUNT:" + newEvents[0].get("total"));
	}
}
