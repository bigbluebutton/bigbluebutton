package org.bigbluebutton.app.screenshare.events;

public class ShareStoppedEvent implements IEvent {

  public final String meetingId;
  public final String streamId;
  
  public ShareStoppedEvent(String meetingId, String streamId) {
    this.meetingId = meetingId;
    this.streamId = streamId;
  }
}
