package org.bigbluebutton.messages;

import java.util.Date;

import org.bigbluebutton.messages.CreateBreakoutRoomRequest.CreateBreakoutRoomRequestPayload;import org.bigbluebutton.messages.CreateMeetingRequest.CreateMeetingRequestPayload;
import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class CreateMeetingRequestTest {
  @Test
  public void testCreateMeetingRequest() {
    String meetingId = "abc123";
    String externalId = "extabc123";
    Boolean record = false;
    Integer durationInMinutes = 20;
    String name = "Breakout room 1";
    String voiceConfId = "851153";
    Boolean autoStartRecording = false;
    Boolean allowStartStopRecording = false;
    Boolean isBreakout = true;
    String viewerPassword = "vp";
    String moderatorPassword = "mp";
    long createTime = System.currentTimeMillis();
    String createDate = new Date(createTime).toString();
    
    CreateMeetingRequestPayload payload = 
        new CreateMeetingRequestPayload(meetingId, externalId, name, record, voiceConfId, 
            durationInMinutes, autoStartRecording, 
            allowStartStopRecording, moderatorPassword,
            viewerPassword, createTime, createDate, isBreakout);
    CreateMeetingRequest msg = new CreateMeetingRequest(payload);    
    Gson gson = new Gson();
    String json = gson.toJson(msg);
    System.out.println(json);
    
    CreateMeetingRequest rxMsg = gson.fromJson(json, CreateMeetingRequest.class);
    
    Assert.assertEquals(rxMsg.header.name, CreateMeetingRequest.NAME);
    Assert.assertEquals(rxMsg.payload.id, meetingId);
    Assert.assertEquals(rxMsg.payload.name, name);
    Assert.assertEquals(rxMsg.payload.voiceConfId, voiceConfId);
    Assert.assertEquals(rxMsg.payload.viewerPassword, viewerPassword);
    Assert.assertEquals(rxMsg.payload.moderatorPassword, moderatorPassword);
    Assert.assertEquals(rxMsg.payload.durationInMinutes, durationInMinutes);
  }
}
