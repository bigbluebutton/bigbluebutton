package org.bigbluebutton.messages;


public class ValidateAuthTokenRequestTimedout {
  public final static String NAME = "ValidateAuthTokenRequestTimedout";
  
  public final Header header;
  public final ValidateAuthTokenRequestTimedoutPayload payload;
  
  public ValidateAuthTokenRequestTimedout(MessageType type, ValidateAuthTokenRequestTimedoutPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  static class ValidateAuthTokenRequestTimedoutPayload {
    public final String meetingId;
    public final String userId;
    public final String token;
    
    public ValidateAuthTokenRequestTimedoutPayload(String meetingId, String userId, String token) {
      this.meetingId = meetingId;
      this.userId = userId;
      this.token = token;
    }
  }  
}
