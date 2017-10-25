package org.bigbluebutton.red5.pubsub;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bigbluebutton.app.video.MeetingManager;
import org.bigbluebutton.red5.pubsub.message.RecordChapterBreakMessage;

public class MeetingMessageHandler implements MessageHandler {

    private final String HEADER = "header";
    private final String NAME = "name";
    private final String BODY = "body";
    private final String MEETING_ID = "meetingId";
    private final String TIMESTAMP = "timestamp";
    private final String ENVELOPE = "envelope";
    private final String CORE = "core";

    private final String RecordingChapterBreakSysMsg = "RecordingChapterBreakSysMsg";

    private MeetingManager meetingManager;

    public void handleMessage(String pattern, String channel, String message) {
        JsonParser parser = new JsonParser();
        JsonObject obj = (JsonObject) parser.parse(message);

        if (obj.has(ENVELOPE) && obj.has(CORE)) {
            JsonObject core = obj.getAsJsonObject(CORE);
            JsonObject header = core.getAsJsonObject(HEADER);
            if (header.has(NAME)) {
                String name = header.get(NAME).getAsString();
                handle(name, core.getAsJsonObject(BODY));
            }
        }
    }

    private void handle(String name, JsonObject body) {
        if (RecordingChapterBreakSysMsg.equals(name)) {
            if (body.has(MEETING_ID) && body.has(TIMESTAMP)) {
                String meetingId = body.get(MEETING_ID).getAsString();
                Long timestamp = body.get(TIMESTAMP).getAsLong();
                RecordChapterBreakMessage chBreak = new RecordChapterBreakMessage(meetingId, timestamp);
                meetingManager.stopStartAllRecordings(meetingId);
            }
        }
    }

    public void setMeetingManager(MeetingManager mgr) {
        this.meetingManager = mgr;
    }
}
