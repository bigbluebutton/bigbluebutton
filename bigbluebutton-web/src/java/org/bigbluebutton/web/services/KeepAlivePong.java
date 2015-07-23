package org.bigbluebutton.web.services;

public class KeepAlivePong implements KeepAliveMessage {

	public final Long startedOn;
	public final Long timestamp;
	
	public KeepAlivePong(Long startedOn, Long timestamp) {
		this.startedOn = startedOn;
		this.timestamp = timestamp;
	}
}
