package org.bigbluebutton.app.screenshare.events;

import org.bigbluebutton.app.screenshare.Error;

public class ScreenShareStartRequestSuccessResponse implements IEvent {

  public final String meetingId;
  public final String userId;
  public final String token;
  public final String jnlp;
  public final String streamId;
  
  public ScreenShareStartRequestSuccessResponse(String meetingId, String userId, String token, String jnlp, String streamId) {
    this.meetingId = meetingId;
    this.userId = userId;
    this.token = token;
    this.jnlp = jnlp;
    this.streamId = streamId;
  }
}
