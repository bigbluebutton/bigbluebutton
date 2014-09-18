package org.bigbluebutton.api.messaging.messages;

public class UserUnsharedWebcam implements IMessage {
  public final String userId;
  public final String meetingId;
  public final String stream;
  
  public UserUnsharedWebcam(String meetingId, String userId, String stream) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.stream = stream;
  }
}
