package org.bigbluebutton.common.messages;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.HashMap;

/**
 * Created by anton on 07/01/16.
 */

// akka-bbb-apps to akka-bbb-fsesl
public class DeskShareHangUpEventMessage {
    public static final String DESKSHARE_HANG_UP_MESSAGE = "deskshare_hang_up_message";
    public static final String VERSION = "0.0.1";

    public static final String CONFERENCE_NAME = "conference_name";
    public static final String FS_CONFERENCE_NAME = "fs_conference_name";
    public static final String TIMESTAMP = "timestamp";

    public final String conferenceName;
    public final String timestamp;
    public final String fsConferenceName;

    public DeskShareHangUpEventMessage(String conferenceName, String fsConferenceName, String timestamp) {
        this.conferenceName = conferenceName;
        this.fsConferenceName = fsConferenceName;
        this.timestamp = timestamp;
    }

    public String toJson() {
        HashMap<String, Object> payload = new HashMap<String, Object>();
        payload.put(CONFERENCE_NAME, conferenceName);
        payload.put(FS_CONFERENCE_NAME, fsConferenceName);
        payload.put(TIMESTAMP, timestamp);

        java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(DESKSHARE_HANG_UP_MESSAGE, VERSION, null);

        return MessageBuilder.buildJson(header, payload);
    }

    public static DeskShareHangUpEventMessage fromJson(String message) {
        JsonParser parser = new JsonParser();
        JsonObject obj = (JsonObject) parser.parse(message);

        if (obj.has("header") && obj.has("payload")) {
            JsonObject header = (JsonObject) obj.get("header");
            JsonObject payload = (JsonObject) obj.get("payload");

            if (header.has("name")) {
                String messageName = header.get("name").getAsString();
                if (DESKSHARE_HANG_UP_MESSAGE.equals(messageName)) {
                    if (payload.has(CONFERENCE_NAME)
                            && payload.has(FS_CONFERENCE_NAME)
                            && payload.has(TIMESTAMP)) {
                        String conferenceName = payload.get(CONFERENCE_NAME).getAsString();
                        String fsConferenceName = payload.get(FS_CONFERENCE_NAME).getAsString();
                        String timestamp = payload.get(TIMESTAMP).getAsString();

                        return new DeskShareHangUpEventMessage(conferenceName, fsConferenceName, timestamp);
                    }
                }
            }
        }
        return null;

    }
}
