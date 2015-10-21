package org.bigbluebutton.messages;

import org.bigbluebutton.messages.CreateBreakoutRoomRequest.CreateBreakoutRoomRequestPayload;
import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class CreateBreakoutRoomRequestTest {
  @Test
  public void testCreateBreakoutRoomRequest() {
    String meetingId = "abc123";
    Integer durationInMinutes = 20;
    String name = "Breakout room 1";
    String voiceConfId = "851153";
    String viewerPassword = "vp";
    String moderatorPassword = "mp";
    String defaultPresentationURL = "http://localhost/foo.pdf";
    
    CreateBreakoutRoomRequestPayload payload = 
        new CreateBreakoutRoomRequestPayload(meetingId, name, voiceConfId, 
            viewerPassword, moderatorPassword, durationInMinutes, defaultPresentationURL);
    CreateBreakoutRoomRequest msg = new CreateBreakoutRoomRequest(payload);    
    Gson gson = new Gson();
    String json = gson.toJson(msg);
    System.out.println(json);
    
    CreateBreakoutRoomRequest rxMsg = gson.fromJson(json, CreateBreakoutRoomRequest.class);
    
    Assert.assertEquals(rxMsg.header.name, CreateBreakoutRoomRequest.NAME);
    Assert.assertEquals(rxMsg.payload.meetingId, meetingId);
    Assert.assertEquals(rxMsg.payload.name, name);
    Assert.assertEquals(rxMsg.payload.voiceConfId, voiceConfId);
    Assert.assertEquals(rxMsg.payload.viewerPassword, viewerPassword);
    Assert.assertEquals(rxMsg.payload.moderatorPassword, moderatorPassword);
    Assert.assertEquals(rxMsg.payload.durationInMinutes, durationInMinutes);
    Assert.assertEquals(rxMsg.payload.defaultPresentationURL, defaultPresentationURL);
  }
}
