package org.bigbluebutton.app.screenshare.events;

public class ScreenShareStoppedEvent implements IEvent {

  public final String meetingId;
  public final String streamId;
  public final String session;

  public ScreenShareStoppedEvent(String meetingId, String streamId, String session) {
    this.meetingId = meetingId;
    this.streamId = streamId;
    this.session = session;
  }
}
