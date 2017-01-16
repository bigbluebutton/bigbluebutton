package org.bigbluebutton.api.messaging.messages;

public class KeepAliveReply implements IMessage {
	
  public final String system;
  public final Long timestamp;
  
  public KeepAliveReply(String system, Long timestamp) {
  	this.system = system;
  	this.timestamp = timestamp;
  }
}
