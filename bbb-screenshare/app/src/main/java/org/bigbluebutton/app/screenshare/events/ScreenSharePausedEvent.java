package org.bigbluebutton.app.screenshare.events;

public class ScreenSharePausedEvent implements IEvent {

  public final String meetingId;
  public final String streamId;

  public ScreenSharePausedEvent(String meetingId, String streamId) {
    this.meetingId = meetingId;
    this.streamId = streamId;
  }
}
