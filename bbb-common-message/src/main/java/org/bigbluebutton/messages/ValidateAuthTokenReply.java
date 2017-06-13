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
}
