package org.bigbluebutton.conference.service.recorder.whiteboard;

public class AddShapeWhiteboardRecordEvent extends
		AbstractWhiteboardRecordEvent {
	
	public AddShapeWhiteboardRecordEvent() {
		super();
		setEvent("AddShapeEvent");
	}
	
	public void setDataPoints(String points) {
		eventMap.put("dataPoints", points);
	}
		
	public void setType(String type) {
		eventMap.put("type", type);
	}
	
	public void setColor(int color) {
		eventMap.put("color", Integer.toString(color));
	}
	
	public void setThickness(int thickness) {
		eventMap.put("thickness", Integer.toString(thickness));
	}
}
