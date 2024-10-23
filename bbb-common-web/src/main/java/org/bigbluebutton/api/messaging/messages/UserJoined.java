package org.bigbluebutton.api.messaging.messages;

public class UserJoined implements IMessage {
  public final String meetingId;
  public final String userId;
  public final String externalUserId;
  public final String name;
  public final String role;
  public final Boolean locked;
  public final String avatarURL;
  public final String webcamBackgroundURL;
	public final Boolean bot;
  public final Boolean guest;
  public final String guestStatus;
	public final String clientType;
  

  public UserJoined(String meetingId,
										String userId,
										String externalUserId,
										String name,
										String role,
										Boolean locked,
										String avatarURL,
										String webcamBackgroundURL,
										Boolean bot,
										Boolean guest,
										String guestStatus,
										String clientType) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.externalUserId = externalUserId;
  	this.name = name;
  	this.role = role;
  	this.locked = locked;
  	this.avatarURL = avatarURL;
	  this.webcamBackgroundURL = webcamBackgroundURL;
		this.bot = bot;
  	this.guest = guest;
  	this.guestStatus = guestStatus;
  	this.clientType = clientType;
  }
}
