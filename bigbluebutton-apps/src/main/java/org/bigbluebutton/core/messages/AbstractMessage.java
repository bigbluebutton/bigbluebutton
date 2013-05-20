package org.bigbluebutton.core.messages;

public class AbstractMessage implements Message {

	private final String messageID;
	
	public AbstractMessage(String messageID) {
		this.messageID = messageID;
	}
	
	@Override
	public String getMeetingID() {
		return messageID;
	}

}
