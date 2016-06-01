package org.bigbluebutton.api.messaging.messages;

public class UserJoinedVoice implements IMessage {
  public final String userId;
  public final String meetingId;
  
  public UserJoinedVoice(String meetingId, String userId) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  }
}
