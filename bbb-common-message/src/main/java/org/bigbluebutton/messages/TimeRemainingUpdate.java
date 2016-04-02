package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.MeetingTimeRemainingPayload;

import com.google.gson.Gson;

public class TimeRemainingUpdate implements IBigBlueButtonMessage {
  public final static String NAME = "TimeRemainingUpdate";
  
  public final Header header;
  public final MeetingTimeRemainingPayload payload;
  
  public TimeRemainingUpdate(MeetingTimeRemainingPayload payload) {
    header = new Header(NAME);
    this.payload = payload;
  }
  
  public String toJson() {
    Gson gson = new Gson();
    return gson.toJson(this);
  }
}
