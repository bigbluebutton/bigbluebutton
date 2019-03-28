package org.bigbluebutton.api.messaging.messages;

public class UserSharedScreen implements IMessage {
  public final String userId;
  public final String meetingId;
  
  public UserSharedScreen(String meetingId, String userId) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  }
}
