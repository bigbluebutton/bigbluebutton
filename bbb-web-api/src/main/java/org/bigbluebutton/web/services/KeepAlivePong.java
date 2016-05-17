package org.bigbluebutton.web.services;

public class KeepAlivePong implements KeepAliveMessage {

	public final String system;
	public final Long timestamp;
	
	public KeepAlivePong(String system, Long timestamp) {
		this.system = system;
		this.timestamp = timestamp;
	}
}
