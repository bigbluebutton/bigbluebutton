package org.bigbluebutton.messages;

import java.util.ArrayList;

public class CreateBreakoutRoomsRequest {
  public final static String NAME = "CreateBreakoutRoomsRequest";
  
  public final Header header;
  public final CreateBreakoutRoomsRequestPayload payload;
  
  public CreateBreakoutRoomsRequest(CreateBreakoutRoomsRequestPayload payload) {
    this.header = new Header(NAME);
    this.payload = payload;
  }
  
  static class CreateBreakoutRoomsRequestPayload {
    public final String meetingId;
    public final ArrayList<BreakoutRoom> rooms;
    public final Integer durationInMinutes;
    
    public CreateBreakoutRoomsRequestPayload(String meetingId, ArrayList<BreakoutRoom> breakoutRooms, Integer duration) {
      this.meetingId = meetingId;
      this.rooms = breakoutRooms;
      this.durationInMinutes = duration;
    }
  }
  
  static class BreakoutRoom {
    public final String name;
    public final ArrayList<String> users;
    
    public BreakoutRoom(String name, ArrayList<String> users) {
      this.name = name;
      this.users = users;
    }
  }
}
