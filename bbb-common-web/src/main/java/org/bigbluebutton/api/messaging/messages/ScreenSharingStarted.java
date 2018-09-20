package org.bigbluebutton.api.messaging.messages;

public class ScreenSharingStarted implements IMessage {
  public final String userId;
  public final String meetingId;
  public final String screenSharingType;
  
  public ScreenSharingStarted(String meetingId, String userId, String screenSharingType) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.screenSharingType = screenSharingType;
  }
}
