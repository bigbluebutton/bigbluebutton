package org.bigbluebutton.conference.service.recorder.whiteboard;

public class AddTextWhiteboardRecordEvent extends
		AbstractWhiteboardRecordEvent {
	
	public AddTextWhiteboardRecordEvent() {
		super();
		setEvent("AddTextEvent");
	}
	
	public void setDataPoints(String points) {
		eventMap.put("dataPoints", points);
	}
	
	public void setText(String text) {
		eventMap.put("text", text);
	}
	
	public void setTextColor(int textColor) {
		eventMap.put("textColor", Integer.toString(textColor));
	}
	
	public void setBGColor(int bgColor) {
		eventMap.put("bgColor", Integer.toString(bgColor));
	}
	
	public void setBGColorVisible(boolean bgColorVis) {
		eventMap.put("bgColorVisible", Boolean.toString(bgColorVis));
	}
	
}
