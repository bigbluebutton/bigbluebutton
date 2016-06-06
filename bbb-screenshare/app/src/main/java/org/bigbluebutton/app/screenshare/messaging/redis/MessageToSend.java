package org.bigbluebutton.app.screenshare.messaging.redis;

public class MessageToSend {
	private final String channel;
	private final String message;
	
	public MessageToSend(String channel, String message) {
		this.channel = channel;
		this.message = message;
	}
	
	public String getChannel() {
		return channel;
	}
	
	public String getMessage() {
		return message;
	}
}
