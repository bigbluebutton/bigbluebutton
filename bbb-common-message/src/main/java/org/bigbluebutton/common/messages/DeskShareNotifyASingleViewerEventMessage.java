package org.bigbluebutton.common.messages;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.HashMap;

//Message from bbb-akka-apps to bigbluebutton-apps (in red5)
public class DeskShareNotifyASingleViewerEventMessage {



    public static final String DESK_SHARE_NOTIFY_A_SINGLE_VIEWER = "desk_share_notify_a_single_viewer";
    public static final String VERSION = "0.0.1";

    public static final String MEETING_ID = "meeting_id";
    public static final String USER_ID = "userid";
    public static final String STREAM_PATH = "stream_path";
    public static final String BROADCASTING = "broadcasting";
    public static final String TIMESTAMP = "timestamp";

    public final String meetingId;
    public final String userId;
    public final String streamPath;
    public final boolean broadcasting;
    public final String timestamp;

    public DeskShareNotifyASingleViewerEventMessage(String meetingId, String userId, String streamPath,
                                                  boolean broadcasting, String timestamp) {
        this.meetingId = meetingId;
        this.userId=userId;
        this.streamPath = streamPath;
        this.broadcasting = broadcasting;
        this.timestamp = timestamp;
    }

    public String toJson() {
        HashMap<String, Object> payload = new HashMap<String, Object>();
        payload.put(MEETING_ID, meetingId);
        payload.put(USER_ID, userId);
        payload.put(STREAM_PATH, streamPath);
        payload.put(BROADCASTING, broadcasting);
        payload.put(TIMESTAMP, timestamp);

        java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESK_SHARE_NOTIFY_A_SINGLE_VIEWER, VERSION, null);

        return MessageBuilder.buildJson(header, payload);
    }

    public static DeskShareNotifyASingleViewerEventMessage fromJson(String message) {
        JsonParser parser = new JsonParser();
        JsonObject obj = (JsonObject) parser.parse(message);

        if (obj.has("header") && obj.has("payload")) {
            JsonObject header = (JsonObject) obj.get("header");
            JsonObject payload = (JsonObject) obj.get("payload");

            if (header.has("name")) {
                String messageName = header.get("name").getAsString();
                if (DESK_SHARE_NOTIFY_A_SINGLE_VIEWER.equals(messageName)) {
                    if (payload.has(MEETING_ID)
                            && payload.has(USER_ID)
                            && payload.has(BROADCASTING)
                            && payload.has(TIMESTAMP)
                            && payload.has(STREAM_PATH)) {
                        String meetingId = payload.get(MEETING_ID).getAsString();
                        String userId = payload.get(USER_ID).getAsString();
                        String streamPath = payload.get(STREAM_PATH).getAsString();
                        boolean broadcasting = payload.get(BROADCASTING).getAsBoolean();
                        String timestamp = payload.get(TIMESTAMP).getAsString();

                        return new DeskShareNotifyASingleViewerEventMessage(meetingId, userId, streamPath,
                                broadcasting, timestamp);
                    }
                }
            }
        }
        return null;

    }
}
