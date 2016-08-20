package org.bigbluebutton.app.screenshare.events;

public class ScreenShareStoppedEvent implements IEvent {

  public final String meetingId;
  public final String streamId;
  
  public ScreenShareStoppedEvent(String meetingId, String streamId) {
    this.meetingId = meetingId;
    this.streamId = streamId;
  }
}
