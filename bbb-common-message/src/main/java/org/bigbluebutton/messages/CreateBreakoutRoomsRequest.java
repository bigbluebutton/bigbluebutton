package org.bigbluebutton.messages;

import java.util.ArrayList;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

/** The message from the client to the server
 * requesting to create breakout rooms.
 */
public class CreateBreakoutRoomsRequest implements IBigBlueButtonMessage {
  public final static String NAME = "CreateBreakoutRoomsRequest";
  
  public final Header header;
  public final CreateBreakoutRoomsRequestPayload payload;
  
  public CreateBreakoutRoomsRequest(CreateBreakoutRoomsRequestPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  static class CreateBreakoutRoomsRequestPayload {
    // The main meeting internal id
    public final String meetingId;
    // The list of breakout rooms
    public final ArrayList<BreakoutRoom> rooms; 
    // The duration of the breakout room
    public final Integer durationInMinutes;
    
    public CreateBreakoutRoomsRequestPayload(String meetingId, ArrayList<BreakoutRoom> breakoutRooms, Integer duration) {
      this.meetingId = meetingId;
      this.rooms = breakoutRooms;
      this.durationInMinutes = duration;
    }
  }
  
  static class BreakoutRoom {
    // Name of the breakout room
    public final String name;
    // List of user ids to assign to the breakout room
    public final ArrayList<String> users;
    
    public BreakoutRoom(String name, ArrayList<String> users) {
      this.name = name;
      this.users = users;
    }
  }
}
