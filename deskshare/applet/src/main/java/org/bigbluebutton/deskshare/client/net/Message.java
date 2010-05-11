package org.bigbluebutton.deskshare.client.net;

public interface Message {

	public enum MessageType {BLOCK, CURSOR};
	
	public MessageType getMessageType();
}
