package org.bigbluebutton.app.screenshare;

public class IsScreenSharingResponse {

  public final StreamInfo info;
  public final Error error;
  
  public IsScreenSharingResponse(StreamInfo info, Error error) {
    this.info = info;
    this.error = error;
  }
}
