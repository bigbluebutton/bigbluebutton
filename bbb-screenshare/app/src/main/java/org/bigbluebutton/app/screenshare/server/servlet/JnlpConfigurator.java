package org.bigbluebutton.app.screenshare.server.servlet;

import org.bigbluebutton.app.screenshare.IScreenShareApplication;
import org.bigbluebutton.app.screenshare.ScreenShareInfo;
import org.bigbluebutton.app.screenshare.ScreenShareInfoResponse;

public class JnlpConfigurator {

  private String jnlpUrl;
  private IScreenShareApplication screenShareApplication;
  private String streamBaseUrl;
  private String codecOptions;
  private boolean useH264 = false;
  
  
  public String getJnlpUrl() {
    return jnlpUrl;
  }
  
  public void setJnlpUrl(String url) {
    this.jnlpUrl = url;
  }
  
  public void setStreamBaseUrl(String baseUrl) {
    streamBaseUrl = baseUrl;
  }
  
  public String getStreamBaseUrl() {
    return streamBaseUrl;
  }
  
  public void setCodecOptions(String codeOptions) {
    this.codecOptions = codeOptions;
  }
  
  public String getCodecOptions() {
    return codecOptions;
  }

  public void setUseH264(boolean h264) {
    useH264 = h264;
  }

  public boolean isUseH264() {
    return useH264;
  }
  
  public ScreenShareInfo  getScreenShareInfo(String meetingId, String token) {
    ScreenShareInfoResponse resp = screenShareApplication.getScreenShareInfo(meetingId, token);
    if (resp.error != null) return null;
    else return resp.info;
  }
  
  public void setApplication(IScreenShareApplication screenShareApplication) {
    this.screenShareApplication = screenShareApplication;
  }
}
