package org.bigbluebutton.app.screenshare.events;

public class ShareStartedEvent implements IEvent {
  
  public final String meetingId;
  public final String streamId;
  
  public ShareStartedEvent(String meetingId, String streamId) {
    this.meetingId = meetingId;
    this.streamId = streamId;
  }
}
