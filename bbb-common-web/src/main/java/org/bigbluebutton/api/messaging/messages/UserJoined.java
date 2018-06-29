package org.bigbluebutton.api.messaging.messages;

public class UserJoined implements IMessage {
  public final String meetingId;
  public final String userId;
  public final String externalUserId;
  public final String name;
  public final String role;
  public final String avatarURL;
  public final Boolean guest;
  public final Boolean waitingForAcceptance;
  public final String clientType;

  public UserJoined(String meetingId, String userId, String externalUserId, String name, String role, String avatarURL,
                    Boolean guest, Boolean waitingForAcceptance, String clientType) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.externalUserId = externalUserId;
  	this.name = name;
  	this.role = role;
  	this.avatarURL = avatarURL;
  	this.guest = guest;
  	this.waitingForAcceptance = waitingForAcceptance;
  	this.clientType = clientType;
  }
}
