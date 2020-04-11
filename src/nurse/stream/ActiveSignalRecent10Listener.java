package nurse.stream;

import org.apache.log4j.Logger;

import com.espertech.esper.client.EventBean;

/**
 * 这个业务本意是利用流处理对数据的最后10条暂存，但如果就这个简单需求，使用流处理只是减轻了对List的Count一个函数
 * 当新实时数据来的时候，如果长度为10，仍然要取出最旧的抛弃，插入最新的，能力有限大炮打文字，暂时搁置
 * @author HP
 *
 */
public class ActiveSignalRecent10Listener extends StreamListenerBase{

	private Logger log = Logger.getLogger(ActiveSignalRecent10Listener.class);
	public ActiveSignalRecent10Listener() {
	}
	
	@Override
	public String getExpression(){
		return "select * as total from ActiveSignalwin:length(10000) where endTime is null group by alarmLevel";
	}
	
	@Override
	public void update(EventBean[] newEvents, EventBean[] oldEvents) {
		log.debug("AlarmLevel:" + newEvents[0].get("alarmLevel") + "  COUNT:" + newEvents[0].get("total"));
	}
}
