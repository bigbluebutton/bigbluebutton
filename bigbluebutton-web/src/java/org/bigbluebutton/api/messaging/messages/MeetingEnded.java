package org.bigbluebutton.api.messaging.messages;

public class MeetingEnded implements IMessage {
  public final String meetingId;
  
  public MeetingEnded(String meetingId) {
  	this.meetingId = meetingId;
  }
}
