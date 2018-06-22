package org.bigbluebutton.api.messaging.messages;

public class SetUserClientType implements IMessage {
  public final String meetingId;
  public final String userId;
  public final String clientType;
  
  public SetUserClientType(String meetingId, String userId, String clientType) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.clientType = clientType;
  }
}
