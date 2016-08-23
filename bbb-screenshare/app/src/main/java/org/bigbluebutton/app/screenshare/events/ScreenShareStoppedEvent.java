package org.bigbluebutton.app.screenshare.events;

public class ScreenShareStoppedEvent implements IEvent {

  public final String meetingId;
  public final String session;

  public ScreenShareStoppedEvent(String meetingId, String session) {
    this.meetingId = meetingId;
    this.session = session;
  }
}
