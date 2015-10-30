package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.RequestBreakoutJoinURLPayload;

public class RequestBreakoutJoinURL implements IBigBlueButtonMessage {
  public final static String NAME = "RequestBreakoutJoinURL";
  
  public final Header header;
  public final RequestBreakoutJoinURLPayload payload;
  
  public RequestBreakoutJoinURL(RequestBreakoutJoinURLPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
}
