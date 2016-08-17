package org.bigbluebutton.app.screenshare.events;

public class StartShareRequestFailedResponse implements IEvent {

  public final String meetingId;
  public final String userId;
  public final String reason;

  public StartShareRequestFailedResponse(String meetingId, String userId, String reason) {
    this.meetingId = meetingId;
    this.userId = userId;
    this.reason = reason;
  }
}
