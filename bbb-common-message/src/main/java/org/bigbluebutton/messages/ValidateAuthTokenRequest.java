package org.bigbluebutton.messages;

public class ValidateAuthTokenRequest {
  public final static String NAME = "ValidateAuthTokenRequest";
  
  public final Header header;
  public final ValidateAuthTokenRequestPayload payload;
  
  public ValidateAuthTokenRequest(MessageType type, ValidateAuthTokenRequestPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  static class ValidateAuthTokenRequestPayload {

    public final String meetingId;
    public final String userId;
    public final String token;
    
    public ValidateAuthTokenRequestPayload(String meetingId, String userId, String token) {
      this.meetingId = meetingId;
      this.userId = userId;
      this.token = token;    
    }
  }
}
