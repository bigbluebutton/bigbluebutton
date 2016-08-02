package org.bigbluebutton.app.screenshare;

public class ScreenShareInfoResponse {
  
  public final ScreenShareInfo info;
  public final Error error;
  
  public ScreenShareInfoResponse(ScreenShareInfo info, Error error) {
    this.info = info;
    this.error = error;
  }
}
