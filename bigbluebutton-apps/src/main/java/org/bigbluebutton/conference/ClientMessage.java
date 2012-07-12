package org.bigbluebutton.conference;

import java.util.Map;

public class ClientMessage {
	public static final String BROADCAST = "broadcast";
	public static final String DIRECT = "direct";
	
	private String type;
	private String dest;
	private Map<String, Object> message;
	private String messageName;
	
	public ClientMessage(String type, String dest, String messageName, Map<String, Object> message) {
		this.type = type;
		this.dest = dest;
		this.message = message;
		this.messageName = messageName;
	}
	
	public String getType() {
		return type;
	}
	
	public String getDest() {
		return dest;
	}
	
	public String getMessageName() {
		return messageName;
	}
	
	public Map<String, Object> getMessage() {
		return message;
	}
}
