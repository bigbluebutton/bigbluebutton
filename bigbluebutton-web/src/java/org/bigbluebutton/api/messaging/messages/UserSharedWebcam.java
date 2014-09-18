package org.bigbluebutton.api.messaging.messages;

public class UserSharedWebcam implements IMessage {
  public final String userId;
  public final String meetingId;
  public final String stream;
  
  public UserSharedWebcam(String meetingId, String userId, String stream) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  	this.stream = stream;
  }
}
