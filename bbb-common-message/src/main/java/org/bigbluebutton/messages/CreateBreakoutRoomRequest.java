package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.CreateBreakoutRoomRequestPayload;

import com.google.gson.Gson;

public class CreateBreakoutRoomRequest implements IBigBlueButtonMessage {
  public final static String NAME = "CreateBreakoutRoomRequest";
  
  public final Header header;
  public final CreateBreakoutRoomRequestPayload payload;
  
  public CreateBreakoutRoomRequest(CreateBreakoutRoomRequestPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  public String toJson() {
    Gson gson = new Gson();
    return gson.toJson(this);
  }
}
