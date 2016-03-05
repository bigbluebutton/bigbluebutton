package org.bigbluebutton.app.screenshare.events;

public class StreamUpdateEvent implements IEvent {

  public final String meetingId;
  public final String streamId;
  public final Long date;
  
  public StreamUpdateEvent(String meetingId, String streamId, Long date) {
    this.meetingId = meetingId;
    this.streamId = streamId;
    this.date = date;
  }
}
