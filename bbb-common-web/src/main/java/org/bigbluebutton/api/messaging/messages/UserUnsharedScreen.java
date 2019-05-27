package org.bigbluebutton.api.messaging.messages;

public class UserUnsharedScreen implements IMessage {
  public final String userId;
  public final String meetingId;
  
  public UserUnsharedScreen(String meetingId, String userId) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  }
}
