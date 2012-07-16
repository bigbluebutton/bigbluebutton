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
	
	
}
