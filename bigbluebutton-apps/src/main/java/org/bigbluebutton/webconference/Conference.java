package org.bigbluebutton.webconference;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Conference {

	private final Map<String, Object> apps;
	
	private final String name;
	
	public Conference(String name) {
		this.name = name;
		apps = new ConcurrentHashMap<String, Object>();
	}
	
	public void addApplication(String app, Object data) {
		apps.put(app, data);
	}
	
	public String getName() {
		return name;
	}
}
