package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

public class ValidateAuthTokenRequest implements IBigBlueButtonMessage {
  public final static String NAME = "ValidateAuthTokenRequest";
  
  public final Header header;
  public final ValidateAuthTokenRequestPayload payload;
  
  public ValidateAuthTokenRequest(MessageType type, ValidateAuthTokenRequestPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
}
