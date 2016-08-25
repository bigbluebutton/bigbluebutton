package org.bigbluebutton.app.screenshare.events;

public class ScreenShareRequestTokenSuccessResponse implements IEvent {

  public final String meetingId;
  public final String userId;
  public final String token;
  public final String jnlp;
  public final String streamId;
  public final String session;
  
  public ScreenShareRequestTokenSuccessResponse(String meetingId, String userId, String token,
                                                String jnlp, String streamId, String session) {
    this.meetingId = meetingId;
    this.userId = userId;
    this.token = token;
    this.jnlp = jnlp;
    this.streamId = streamId;
    this.session = session;
  }
}
