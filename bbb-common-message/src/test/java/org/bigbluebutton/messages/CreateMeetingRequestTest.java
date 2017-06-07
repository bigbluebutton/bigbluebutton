package org.bigbluebutton.messages;

import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import org.bigbluebutton.messages.CreateMeetingRequestPayload;
import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class CreateMeetingRequestTest {
    @Test
    public void testCreateMeetingRequest() {
        String meetingId = "abc123";
        String externalId = "extabc123";
        String parentId = "";
        Boolean record = false;
        Integer durationInMinutes = 20;
        String name = "Breakout room 1";
        String voiceConfId = "851153";
        Boolean autoStartRecording = false;
        Boolean allowStartStopRecording = false;
        Boolean webcamsOnlyForModerator = false;
        Boolean isBreakout = true;
        Integer sequence = 4;
        String viewerPassword = "vp";
        String moderatorPassword = "mp";
        long createTime = System.currentTimeMillis();
        String createDate = new Date(createTime).toString();
    Map<String, String> metadata = new HashMap<String, String>();
    metadata.put("meta_test", "test");

        CreateMeetingRequestPayload payload = new CreateMeetingRequestPayload(
                meetingId, externalId, parentId, name, record, voiceConfId,
                durationInMinutes, autoStartRecording, allowStartStopRecording,
                webcamsOnlyForModerator, moderatorPassword, viewerPassword,
                createTime, createDate, isBreakout, sequence, metadata, "ALWAYS_ALLOW");
        CreateMeetingRequest msg = new CreateMeetingRequest(payload);
        Gson gson = new Gson();
        String json = gson.toJson(msg);
        System.out.println(json);

        CreateMeetingRequest rxMsg = gson.fromJson(json,
                CreateMeetingRequest.class);

        Assert.assertEquals(rxMsg.header.name, CreateMeetingRequest.NAME);
        Assert.assertEquals(rxMsg.payload.id, meetingId);
        Assert.assertEquals(rxMsg.payload.externalId, externalId);
        Assert.assertEquals(rxMsg.payload.parentId, parentId);
        Assert.assertEquals(rxMsg.payload.name, name);
        Assert.assertEquals(rxMsg.payload.voiceConfId, voiceConfId);
        Assert.assertEquals(rxMsg.payload.viewerPassword, viewerPassword);
        Assert.assertEquals(rxMsg.payload.moderatorPassword, moderatorPassword);
        Assert.assertEquals(rxMsg.payload.durationInMinutes, durationInMinutes);
        Assert.assertEquals(rxMsg.payload.isBreakout, isBreakout);
        Assert.assertEquals(rxMsg.payload.sequence, sequence);
    }
}
