package org.bigbluebutton.conference.service.recorder.whiteboard;

import java.util.ArrayList;
import java.util.Map;

public class AddShapeWhiteboardRecordEvent extends AbstractWhiteboardRecordEvent {
	
	public AddShapeWhiteboardRecordEvent() {
		super();
		setEvent("AddShapeEvent");
	}
	
	public void addAnnotation(Map<String, Object> annotation) {
		for (Map.Entry<String, Object> entry : annotation.entrySet()) {
		    String key = entry.getKey();
		    Object value = entry.getValue();
		    
		    if (key.equals("points")) {
		    	eventMap.put("dataPoints", pointsToString((ArrayList<Double>) value));
		    } else {
		    	eventMap.put(key, value.toString());
		    }
		}
	}
	
	private String pointsToString(ArrayList<Double> points){
    	String datapoints = "";
    	for (Double i : points) {
    		datapoints += i + ",";
    	}
    	// Trim the trailing comma
    	return datapoints.substring(0, datapoints.length() - 1);
	}
}
