package org.bigbluebutton.api.messaging.messages;

public class ScreenSharingStopped implements IMessage {
  public final String userId;
  public final String meetingId;
  
  public ScreenSharingStopped(String meetingId, String userId) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  }
}
