package org.bigbluebutton.app.screenshare;

public class ScreenShareInfo {

  public final String session;
  public final String streamId;
  public final String publishUrl;
  public final Boolean tunnel;

  public ScreenShareInfo(String session, String publishUrl, String streamId, Boolean tunnel) {
    this.session = session;
    this.streamId = streamId;
    this.publishUrl = publishUrl;
    this.tunnel = tunnel;
  }
}
