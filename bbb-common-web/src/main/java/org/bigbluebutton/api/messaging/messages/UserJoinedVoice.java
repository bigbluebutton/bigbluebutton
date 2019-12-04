package org.bigbluebutton.api.messaging.messages;

public class UserJoinedVoice implements IMessage {
  public final String userId;
  public final String meetingId;
  public final String name;
  
  public UserJoinedVoice(String meetingId, String userId, String name) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.name = name;
  }
}
