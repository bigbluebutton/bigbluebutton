package org.bigbluebutton.messages.payload;

import java.util.ArrayList;

public class BreakoutRoomRequestPayload {
  // Name of the breakout room
  public final String name;
  // List of user ids to assign to the breakout room
  public final ArrayList<String> users;
  
  public BreakoutRoomRequestPayload(String name, ArrayList<String> users) {
    this.name = name;
    this.users = users;
  }
}
