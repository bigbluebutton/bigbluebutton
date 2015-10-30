package org.bigbluebutton.messages.payload;

import java.util.ArrayList;

public class CreateBreakoutRoomsRequestPayload {
  // The main meeting internal id
  public final String meetingId;
  // The list of breakout rooms
  public final ArrayList<BreakoutRoomRequestPayload> rooms; 
  // The duration of the breakout room
  public final Integer durationInMinutes;
  
  public CreateBreakoutRoomsRequestPayload(String meetingId, ArrayList<BreakoutRoomRequestPayload> breakoutRooms, Integer duration) {
    this.meetingId = meetingId;
    this.rooms = breakoutRooms;
    this.durationInMinutes = duration;
  }
}
