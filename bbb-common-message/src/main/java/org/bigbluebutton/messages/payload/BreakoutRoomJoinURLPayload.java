package org.bigbluebutton.messages.payload;

public class BreakoutRoomJoinURLPayload {

  public final String meetingId;
  public final String breakoutId;
  public final String userId;
  public final String joinURL;
  
  public BreakoutRoomJoinURLPayload(String meetingId, String breakoutId, String userId, String joinURL) {
    this.meetingId = meetingId;
    this.breakoutId = breakoutId;
    this.userId = userId;
    this.joinURL = joinURL;
  }
}
