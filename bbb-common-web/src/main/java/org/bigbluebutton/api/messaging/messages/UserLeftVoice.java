package org.bigbluebutton.api.messaging.messages;

public class UserLeftVoice implements IMessage {
  public final String userId;
  public final String meetingId;
  
  public UserLeftVoice(String meetingId, String userId) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  }
}
