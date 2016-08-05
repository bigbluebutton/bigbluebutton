package org.bigbluebutton.messages.payload;

import java.util.ArrayList;

public class CreateBreakoutRoomsRequestPayload {
  // The main meeting internal id
  public final String meetingId;
  // The list of breakout rooms
  public final ArrayList<BreakoutRoomRequestPayload> rooms; 
  // The duration of the breakout room
  public final Integer durationInMinutes;
  // Breakout rooms recording option 
  public final String recordType;

  public CreateBreakoutRoomsRequestPayload(String meetingId, 
		  ArrayList<BreakoutRoomRequestPayload> breakoutRooms, 
		  Integer duration, String recordType) {
    this.meetingId = meetingId;
    this.rooms = breakoutRooms;
    this.durationInMinutes = duration;
    this.recordType = recordType;
  }
}
