package org.bigbluebutton.app.screenshare;

public class StartShareRequestResponse {

  public final String token;
  public final String jnlp;
  public final Error error;
  
  public StartShareRequestResponse(String token, String jnlp, Error error) {
    this.token = token;
    this.jnlp = jnlp;
    
    this.error = error;
  }
}
