package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;


public class ValidateAuthTokenRequestTimedout implements IBigBlueButtonMessage {
  public final static String NAME = "ValidateAuthTokenRequestTimedout";
  
  public final Header header;
  public final ValidateAuthTokenRequestTimedoutPayload payload;
  
  public ValidateAuthTokenRequestTimedout(MessageType type, ValidateAuthTokenRequestTimedoutPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
}
