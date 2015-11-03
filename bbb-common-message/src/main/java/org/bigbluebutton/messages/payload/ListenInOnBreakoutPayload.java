package org.bigbluebutton.messages.payload;

public class ListenInOnBreakoutPayload {

  public final String meetingId;
  public final String breakoutId;
  public final String userId;
  public final Boolean listen;
  
  public ListenInOnBreakoutPayload(String meetingId, String breakoutId, String userId, Boolean listen) {
    this.meetingId = meetingId;
    this.breakoutId = breakoutId;
    this.userId = userId;
    this.listen = listen;
  }
}
