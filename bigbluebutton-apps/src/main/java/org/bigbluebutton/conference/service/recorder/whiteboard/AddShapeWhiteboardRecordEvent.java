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
		    		    
		    if (key.equals("points")) {
		    	eventMap.put("dataPoints", pointsToString((ArrayList<Object>)entry.getValue()));
		    } else {
		    	Object value = entry.getValue();
		    	eventMap.put(key, value.toString());
		    }
		}
	}
	
	private String pointsToString(ArrayList<Object> points){
    	String datapoints = "";
    	for (int i = 0; i < points.size(); i++) {
    		datapoints += (points.get(i)).toString() + ",";
    	}
    	// Trim the trailing comma
    	return datapoints.substring(0, datapoints.length() - 1);
	}

	public void setFillColor(int fillColor) {
		eventMap.put("fillColor", Integer.toString(fillColor));
	}
	
	public void setThickness(int thickness) {
		eventMap.put("thickness", Integer.toString(thickness));
	}

    public void setFill(boolean fill) {
                eventMap.put("fill", Boolean.toString(fill));
    }
	
    public void setTransparent(boolean transparent) {
                eventMap.put("transparent", Boolean.toString(transparent));
    }

}
