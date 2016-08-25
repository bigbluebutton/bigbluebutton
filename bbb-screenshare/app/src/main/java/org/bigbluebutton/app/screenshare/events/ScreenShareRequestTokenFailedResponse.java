package org.bigbluebutton.app.screenshare.events;

public class ScreenShareRequestTokenFailedResponse implements IEvent {

  public final String meetingId;
  public final String userId;
  public final String reason;

  public ScreenShareRequestTokenFailedResponse(String meetingId, String userId, String reason) {
    this.meetingId = meetingId;
    this.userId = userId;
    this.reason = reason;
  }
}
