package org.bigbluebutton.web.services;

public abstract class KeepAliveMessage {

	protected final String id;
	
	public KeepAliveMessage(String id) {
		this.id = id;
	}
	
	public String getId() {
		return id;
	}
}
