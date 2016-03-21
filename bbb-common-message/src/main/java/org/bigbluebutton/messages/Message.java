package org.bigbluebutton.messages;

import com.google.gson.JsonObject;

public class Message {
  
  public final Header header;
  public final JsonObject body;
  
  public Message(Header header, JsonObject body) {
    this.header = header;
    this.body = body;
  }
}
