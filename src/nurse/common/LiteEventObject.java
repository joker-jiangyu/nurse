package nurse.common;

import java.util.EventObject;

public class LiteEventObject extends EventObject {

	private static final long serialVersionUID = -1567915586300169128L;
	public Object tag;
	public String eventType;
	
	public Object getTag() {
		return tag;
	}

	public void setTag(Object tag) {
		this.tag = tag;
	}

	public LiteEventObject(Object source, String eventType, Object tag) {
		super(source);
		this.tag = tag;
		this.eventType = eventType;
	}

}
