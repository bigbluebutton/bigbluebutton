package org.bigbluebutton.messages.payload;

public class RequestBreakoutJoinURLPayload {

  public final String meetingId;
  public final String breakoutId;
  public final String userId;
  
  public RequestBreakoutJoinURLPayload(String meetingId, String breakoutId, String userId) {
    this.meetingId = meetingId;
    this.breakoutId = breakoutId;
    this.userId = userId;
  }
}
