package org.bigbluebutton.app.screenshare.events;

public class ScreenShareStoppedEvent implements IEvent {

  public final String meetingId;
  public final String session;
  public final String reason;

  public ScreenShareStoppedEvent(String meetingId, String session, String reason) {
    this.meetingId = meetingId;
    this.session = session;
    this.reason = reason;
  }
}
