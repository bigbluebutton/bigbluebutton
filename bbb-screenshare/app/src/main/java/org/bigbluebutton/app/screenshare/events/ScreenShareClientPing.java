package org.bigbluebutton.app.screenshare.events;

public class ScreenShareClientPing implements IEvent {

  public final String meetingId;
  public final String userId;
  public final String streamId;
  public final Long timestamp;

  public ScreenShareClientPing(String meetingId, String userId, String streamId, Long timestamp) {
    this.meetingId = meetingId;
    this.userId = userId;
    this.streamId = streamId;
    this.timestamp = timestamp;
  }
}
