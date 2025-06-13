package org.bigbluebutton.api.messaging.messages;

public class UnmuteRequestAnswer implements IMessage {
  public final String userId;
  public final String meetingId;
  
  public UnmuteRequestAnswer(String meetingId, String userId) {
  	this.meetingId = meetingId;
  	this.userId = userId;
  }
}