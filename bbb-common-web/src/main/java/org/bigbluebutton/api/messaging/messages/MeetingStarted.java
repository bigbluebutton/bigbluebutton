package org.bigbluebutton.api.messaging.messages;

public class MeetingStarted implements IMessage {
  public final String meetingId;
  
  public MeetingStarted(String meetingId) {
  	this.meetingId = meetingId;
  }
}
