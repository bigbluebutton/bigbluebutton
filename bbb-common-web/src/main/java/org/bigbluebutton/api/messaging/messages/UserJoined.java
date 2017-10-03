package org.bigbluebutton.api.messaging.messages;

public class UserJoined implements IMessage {
  public final String meetingId;
  public final String userId;
  public final String externalUserId;
  public final String name;
  public final String role;
  public final String avatarURL;
  public final Boolean guest;
  public final String guestStatus;
  
  public UserJoined(String meetingId, String userId, String externalUserId, String name, String role,
                    String avatarURL, Boolean guest, String guestStatus) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.externalUserId = externalUserId;
  	this.name = name;
  	this.role = role;
  	this.avatarURL = avatarURL;
  	this.guest = guest;
  	this.guestStatus = guestStatus;
  }
}
