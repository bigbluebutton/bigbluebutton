package org.bigbluebutton.conference.service.whiteboard.shapes;

import java.util.Map;

public class Annotation {

	private Map<String, Object> annotation;
	
	public Annotation(Map<String, Object> annotation) {
		this.annotation = annotation;
	}
	
	public Map<String, Object> getAnnotation() {
		return annotation;
	}
	
	public String getID() {
		return (String) annotation.get("id");
	}
	
	public void setID(String id) {
		annotation.put("id", id);
	}
	
	public String getType() {
		return (String) annotation.get("type");
	}
	
	public String getStatus() {
		return (String) annotation.get("status");
	}
}
