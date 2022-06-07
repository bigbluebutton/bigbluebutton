package org.bigbluebutton.api.messaging.messages;

public class UserListeningOnly implements IMessage {
  public final String userId;
  public final String meetingId;
  public final Boolean listenOnly;
  
  public UserListeningOnly(String meetingId, String userId, Boolean listenOnly) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.listenOnly = listenOnly;
  }
}
