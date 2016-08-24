package org.bigbluebutton.app.screenshare.events;

public class ScreenSharePausedEvent implements IEvent {

  public final String meetingId;
  public final String session;

  public ScreenSharePausedEvent(String meetingId, String session) {
    this.meetingId = meetingId;
    this.session = session;
  }
}
