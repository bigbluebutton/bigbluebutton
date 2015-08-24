package org.bigbluebutton.red5.monitoring;

public class KeepAliveMessage implements IKeepAliveMessage {

	public final String system;
	public final Long timestamp;
	
	public KeepAliveMessage(String system, Long timestamp) {
		this.system = system;
		this.timestamp = timestamp;
	}
}
