package org.bigbluebutton.app.screenshare;

public class StartShareRequestResponse {

  public final String token;
  public final String jnlp;
  public final String streamId;
  public final Error error;
  
  public StartShareRequestResponse(String token, String jnlp, String streamId, Error error) {
    this.token = token;
    this.jnlp = jnlp;
    this.streamId = streamId;
    this.error = error;
  }
}
