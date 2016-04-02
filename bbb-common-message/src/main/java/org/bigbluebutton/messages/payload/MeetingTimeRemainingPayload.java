package org.bigbluebutton.messages.payload;

public class MeetingTimeRemainingPayload {

  public final String meetingId;
  public final Integer timeRemaining;
  
  public MeetingTimeRemainingPayload(String meetingId, Integer timeRemaining) {
    this.meetingId = meetingId;
    this.timeRemaining = timeRemaining;
  }
}
