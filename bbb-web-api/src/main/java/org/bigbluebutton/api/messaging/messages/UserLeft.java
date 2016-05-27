package org.bigbluebutton.api.messaging.messages;

public class UserLeft implements IMessage {
  public final String userId;
  public final String meetingId;
  
  public UserLeft(String meetingId, String userId) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  }
}
