package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

public class ValidateAuthTokenReply implements IBigBlueButtonMessage {
  public final static String NAME = "ValidateAuthTokenReply";
  
  public final Header header;
  public final ValidateAuthTokenReplyPayload payload;
  
  public ValidateAuthTokenReply(MessageType type, ValidateAuthTokenReplyPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  static class ValidateAuthTokenReplyPayload {
    public final String meetingId;
    public final String userId;
    public final String token;
    public final Boolean valid;
    
    public ValidateAuthTokenReplyPayload(String meetingId, String userId, String token, Boolean valid) {
      this.meetingId = meetingId;
      this.userId = userId;
      this.token = token;
      this.valid = valid;
    }
  }
}
