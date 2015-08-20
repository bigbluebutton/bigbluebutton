package org.bigbluebutton.common.messages;

public class KeepAliveMessage implements IBigBlueButtonMessage {
	public static final String KEEP_ALIVE_REQUEST                 = "keep_alive_request";
	public static final String VERSION = "0.0.1";
	
	public final String keepAliveId;
	
	public KeepAliveMessage(String keepAliveId) {
		this.keepAliveId = keepAliveId;	
	}
}
