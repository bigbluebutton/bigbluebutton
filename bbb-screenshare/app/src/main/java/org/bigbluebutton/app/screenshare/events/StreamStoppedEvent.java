package org.bigbluebutton.app.screenshare.events;

public class StreamStoppedEvent implements IEvent {

  public final String meetingId;
  public final String streamId;
  
  public StreamStoppedEvent(String meetingId, String streamId) {
    this.meetingId = meetingId;
    this.streamId = streamId;
  }
}
