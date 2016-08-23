package org.bigbluebutton.app.screenshare;

public class StreamInfo {

  public final String streamId;
  public final Boolean sharing;
  public final int width;
  public final int height;
  public final String url;
  public final String session;
  
  public StreamInfo(Boolean sharing, String streamId,
                        int width, int height, String url, String session) {
    this.sharing = sharing;
    this.streamId = streamId;
    this.width = width;
    this.height = height;
    this.url = url;
    this.session = session;
  }
}
