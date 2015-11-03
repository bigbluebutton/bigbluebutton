package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.ListenInOnBreakoutPayload;

public class ListenInOnBreakout implements IBigBlueButtonMessage {
  public final static String NAME = "ListenInOnBreakout";
 
  public final Header header;
  public final ListenInOnBreakoutPayload payload;
  
  public ListenInOnBreakout(ListenInOnBreakoutPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
}
