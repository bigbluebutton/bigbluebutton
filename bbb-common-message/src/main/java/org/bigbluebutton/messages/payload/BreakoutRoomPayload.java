package org.bigbluebutton.messages.payload;

public class BreakoutRoomPayload {

  public final String breakoutId;
  public final String name;
  
  public BreakoutRoomPayload(String breakoutId, String name) {
    this.breakoutId = breakoutId;
    this.name = name;
  }
}
