package org.bigbluebutton.messages;

import org.bigbluebutton.messages.payload.BreakoutRoomJoinURLPayload;

import com.google.gson.Gson;

public class BreakoutRoomJoinURL {
  public final static String NAME = "BreakoutRoomJoinURL";
  
  public final Header header;
  public final BreakoutRoomJoinURLPayload payload;
  
  public BreakoutRoomJoinURL(BreakoutRoomJoinURLPayload payload) {
    header = new Header(NAME );
    this.payload = payload;
  }
  
  public String toJson() {
    Gson gson = new Gson();
    return gson.toJson(this);
  }
}
