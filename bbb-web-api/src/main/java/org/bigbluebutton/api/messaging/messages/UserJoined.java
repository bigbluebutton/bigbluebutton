package org.bigbluebutton.api.messaging.messages;

public class UserJoined implements IMessage {
  public final String meetingId;
  public final String userId;
  public final String externalUserId;
  public final String name;
  public final String role;
  public final String avatarURL;
  
  public UserJoined(String meetingId, String userId, String externalUserId, String name, String role, String avatarURL) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.externalUserId = externalUserId;
  	this.name = name;
  	this.role = role;
  	this.avatarURL = avatarURL;
  }
}
