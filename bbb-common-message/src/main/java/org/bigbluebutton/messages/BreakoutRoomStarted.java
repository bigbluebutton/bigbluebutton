package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.BreakoutRoomPayload;

import com.google.gson.Gson;

public class BreakoutRoomStarted implements IBigBlueButtonMessage {
  public final static String NAME = "BreakoutRoomStarted";
  
  public final Header header;
  public final BreakoutRoomPayload payload;
  
  public BreakoutRoomStarted(BreakoutRoomPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  public String toJson() {
    Gson gson = new Gson();
    return gson.toJson(this);
  }
}
