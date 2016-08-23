package org.bigbluebutton.app.screenshare;

public class ScreenShareInfo {

  public final String session;
  public final String streamId;
  public final String publishUrl;

  public ScreenShareInfo(String session, String publishUrl, String streamId) {
    this.session = session;
    this.streamId = streamId;
    this.publishUrl = publishUrl;
  }
}
