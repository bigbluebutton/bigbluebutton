package org.bigbluebutton.api.messaging.messages;

public class UserStatusChanged implements IMessage {
  public final String meetingId;
  public final String userId;
  public final String status;
  public final String value;
  
  public UserStatusChanged(String meetingId, String userId, String status, String value) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.status = status;
  	this.value = value;
  }
}
