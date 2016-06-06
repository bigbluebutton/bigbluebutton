package org.bigbluebutton.app.screenshare;

public class ScreenShareInfo {

  public final String streamId;
  public final String publishUrl;

  public ScreenShareInfo(String publishUrl, String streamId) {
    this.streamId = streamId;
    this.publishUrl = publishUrl;
  }
}
