package org.bigbluebutton.api.messaging.messages;

public class KeepAliveReply implements IMessage {
	
  public final Long startedOn;
  public final Long timestamp;
  
  public KeepAliveReply(Long startedOn, Long timestamp) {
  	this.startedOn = startedOn;
  	this.timestamp = timestamp;
  }
}
