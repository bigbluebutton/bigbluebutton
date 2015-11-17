package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.RequestBreakoutJoinURLPayload;

import com.google.gson.Gson;

public class RequestBreakoutJoinURL implements IBigBlueButtonMessage {
  public final static String NAME = "RequestBreakoutJoinURL";
  
  public final Header header;
  public final RequestBreakoutJoinURLPayload payload;
  
  public RequestBreakoutJoinURL(RequestBreakoutJoinURLPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  public String toJson() {
    Gson gson = new Gson();
    return gson.toJson(this);
  }
}
