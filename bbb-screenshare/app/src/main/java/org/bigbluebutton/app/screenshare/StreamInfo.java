package org.bigbluebutton.app.screenshare;

public class StreamInfo {

  public final String streamId;
  public final Boolean sharing;
  public final int width;
  public final int height;
  public final String url;
  
  public StreamInfo(Boolean sharing, String streamId,
                        int width, int height, String url) {
    this.sharing = sharing;
    this.streamId = streamId;
    this.width = width;
    this.height = height;
    this.url = url;
  }
}
