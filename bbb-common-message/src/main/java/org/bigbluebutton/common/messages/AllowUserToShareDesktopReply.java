package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class AllowUserToShareDesktopReply implements ISubscribedMessage {
    public static final String NAME = "AllowUserToShareDesktopReply";
    public static final String VERSION = "0.0.1";

    public static final String TIMESTAMP = "timestamp";
    public static final String MEETING_ID = "meeting_id";
    public static final String USER_ID = "user_id";
    public static final String ALLOWED = "allowed";

    public final Long timestamp;
    public final String userId;
    public final String meetingId;
    public final Boolean allowed;

    public AllowUserToShareDesktopReply(String meetingId, String userId,
     Boolean allowed, Long timestamp) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.allowed = allowed;
        this.timestamp = timestamp;
    }

    public String toJson() {
        HashMap<String, Object> payload = new HashMap<String, Object>();
        payload.put(TIMESTAMP, timestamp);
        payload.put(MEETING_ID, meetingId);
        payload.put(USER_ID, userId);
        payload.put(ALLOWED, allowed);

        java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(NAME, VERSION, null);
        return MessageBuilder.buildJson(header, payload);
    }

    public static AllowUserToShareDesktopReply fromJson(String message) {
        JsonParser parser = new JsonParser();
        JsonObject obj = (JsonObject) parser.parse(message);
        if (obj.has("header") && obj.has("payload")) {
            JsonObject header = (JsonObject) obj.get("header");
            JsonObject payload = (JsonObject) obj.get("payload");

            if (header.has("name")) {
                String messageName = header.get("name").getAsString();
                if (NAME.equals(messageName)) {

                    if (payload.has(TIMESTAMP) && payload.has(MEETING_ID)
                            && payload.has(USER_ID) && payload.has(ALLOWED)) {
                        Long timestamp = payload.get(TIMESTAMP).getAsLong();
                        String meetingId = payload.get(MEETING_ID).getAsString();
                        String userId = payload.get(USER_ID).getAsString();
                        Boolean allowed = payload.get(ALLOWED).getAsBoolean();
                        return new AllowUserToShareDesktopReply(meetingId, userId, allowed,
                                timestamp);
                    }
                }
            }
        }
        return null;
    }
}
