package org.bigbluebutton.app.screenshare.events;

public class ScreenShareClientPing implements IEvent {

  public final String meetingId;
  public final String userId;
  public final String session;
  public final Long timestamp;

  public ScreenShareClientPing(String meetingId, String userId, String session, Long timestamp) {
    this.meetingId = meetingId;
    this.userId = userId;
    this.session = session;
    this.timestamp = timestamp;
  }
}
