package nurse.stream;

import com.espertech.esper.client.EventBean;
import com.espertech.esper.client.UpdateListener;

public class StreamListenerBase  implements UpdateListener {

	public StreamListenerBase() {
	}

	@Override
	public void update(EventBean[] newEvents, EventBean[] oldEvents) {
		
	}
	
	public String getExpression(){
		return null;
	}

}
