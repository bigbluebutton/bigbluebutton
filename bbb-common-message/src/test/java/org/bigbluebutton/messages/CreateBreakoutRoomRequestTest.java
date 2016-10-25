package org.bigbluebutton.messages;

import org.bigbluebutton.messages.payload.CreateBreakoutRoomRequestPayload;
import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class CreateBreakoutRoomRequestTest {
  @Test
  public void testCreateBreakoutRoomRequest() {
      String breakoutId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1474984695664";
    String parentId = "abc-123";
    Integer durationInMinutes = 20;
    String name = "Breakout room 1";
    Integer sequence = 3;
    String voiceConfId = "851153";
    String viewerPassword = "vp";
    String moderatorPassword = "mp";
    String sourcePresentationId = "d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1474984695907";
    Integer sourePresentationSlide = 5;
    Boolean record = false;
    
        CreateBreakoutRoomRequestPayload payload = new CreateBreakoutRoomRequestPayload(
                breakoutId, parentId, name, sequence, voiceConfId,
                viewerPassword, moderatorPassword, durationInMinutes,
                sourcePresentationId, sourePresentationSlide, record);
    CreateBreakoutRoomRequest msg = new CreateBreakoutRoomRequest(payload);    
    Gson gson = new Gson();
    String json = gson.toJson(msg);
    System.out.println(json);
    
    CreateBreakoutRoomRequest rxMsg = gson.fromJson(json, CreateBreakoutRoomRequest.class);
    
    Assert.assertEquals(rxMsg.header.name, CreateBreakoutRoomRequest.NAME);
    Assert.assertEquals(rxMsg.payload.breakoutMeetingId, breakoutId);
    Assert.assertEquals(rxMsg.payload.name, name);
    Assert.assertEquals(rxMsg.payload.sequence, sequence);
    Assert.assertEquals(rxMsg.payload.voiceConfId, voiceConfId);
    Assert.assertEquals(rxMsg.payload.viewerPassword, viewerPassword);
    Assert.assertEquals(rxMsg.payload.moderatorPassword, moderatorPassword);
    Assert.assertEquals(rxMsg.payload.durationInMinutes, durationInMinutes);
    Assert.assertEquals(rxMsg.payload.sourcePresentationId, sourcePresentationId);
    Assert.assertEquals(rxMsg.payload.sourcePresentationSlide, sourePresentationSlide);
    Assert.assertEquals(rxMsg.payload.record, record);
  }
}
