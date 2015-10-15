package org.bigbluebutton.messages;

import java.util.ArrayList;
import org.bigbluebutton.messages.CreateBreakoutRoomsRequest.BreakoutRoom;
import org.bigbluebutton.messages.CreateBreakoutRoomsRequest.CreateBreakoutRoomsRequestPayload;
import org.junit.Assert;
import org.junit.Test;
import com.google.gson.Gson;

public class CreateBreakoutRoomsRequestTest {
  @Test
  public void testCreateBreakoutRoomsRequest() {
    String meetingId = "abc123";
    Integer durationInMinutes = 20;
    
    ArrayList<String> room1Users = new ArrayList<String>();
    room1Users.add("Tidora"); room1Users.add("Nidora"); room1Users.add("Tinidora");
    BreakoutRoom room1 = new BreakoutRoom("room1", room1Users);
    
    ArrayList<String> room2Users = new ArrayList<String>();
    room2Users.add("Jose"); room2Users.add("Wally"); room2Users.add("Paolo");
    BreakoutRoom room2= new BreakoutRoom("room2", room2Users);
    
    ArrayList<String> room3Users = new ArrayList<String>();
    room3Users.add("Alden"); room3Users.add("Yaya Dub");
    BreakoutRoom room3= new BreakoutRoom("room3", room3Users);
    
    ArrayList<BreakoutRoom> rooms = new ArrayList<BreakoutRoom>();
    rooms.add(room1); rooms.add(room2); rooms.add(room3);
    
    CreateBreakoutRoomsRequestPayload payload = new CreateBreakoutRoomsRequestPayload(meetingId, rooms, durationInMinutes);
    CreateBreakoutRoomsRequest msg = new CreateBreakoutRoomsRequest(payload);    
    Gson gson = new Gson();
    String json = gson.toJson(msg);
    System.out.println(json);
    
    CreateBreakoutRoomsRequest rxMsg = gson.fromJson(json, CreateBreakoutRoomsRequest.class);
    
    Assert.assertEquals(rxMsg.payload.meetingId, meetingId);
    Assert.assertEquals(rxMsg.payload.rooms.size(), 3);
    Assert.assertEquals(rxMsg.payload.durationInMinutes, durationInMinutes);
  }
}
