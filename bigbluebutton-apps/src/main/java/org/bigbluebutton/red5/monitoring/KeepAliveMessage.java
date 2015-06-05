package org.bigbluebutton.red5.monitoring;

public class KeepAliveMessage implements IKeepAliveMessage {

	public final Long startedOn;
	public final Long timestamp;
	
	public KeepAliveMessage(Long startedOn, Long timestamp) {
		this.startedOn = startedOn;
		this.timestamp = timestamp;
	}
}
