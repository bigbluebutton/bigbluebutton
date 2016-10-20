package org.bigbluebutton.common.messages;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class SendStunTurnInfoReplyMessage {
    public static final String SEND_STUN_TURN_INFO_REPLY_MESSAGE  = "send_stun_turn_info_reply_message";
    public static final String VERSION = "0.0.1";

    public final String meetingId;
    public final String requesterId;
    public final ArrayList<String> stuns;
    public final ArrayList<Map<String, Object>> turns;

    public SendStunTurnInfoReplyMessage(String meetingId, String requesterId, ArrayList<String> stuns,
                                        ArrayList<Map<String, Object>> turns) {
        this.meetingId = meetingId;
        this.requesterId = requesterId;
        this.stuns = stuns;
        this.turns = turns;
    }

    public String toJson() {
        HashMap<String, Object> payload = new HashMap<String, Object>();
        payload.put(Constants.MEETING_ID, meetingId);
        payload.put(Constants.REQUESTER_ID, requesterId);
        payload.put(Constants.STUNS, stuns);
        payload.put(Constants.TURNS, turns);

        java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_STUN_TURN_INFO_REPLY_MESSAGE, VERSION, null);

        return MessageBuilder.buildJson(header, payload);
    }

    public static SendStunTurnInfoReplyMessage fromJson(String message) {
        JsonParser parser = new JsonParser();
        JsonObject obj = (JsonObject) parser.parse(message);

        if (obj.has("header") && obj.has("payload")) {
            JsonObject header = (JsonObject) obj.get("header");
            JsonObject payload = (JsonObject) obj.get("payload");

            if (header.has("name")) {
                String messageName = header.get("name").getAsString();
                if (SEND_STUN_TURN_INFO_REPLY_MESSAGE.equals(messageName)) {
                    if (payload.has(Constants.MEETING_ID)
                            && payload.has(Constants.STUNS)
                            && payload.has(Constants.TURNS)
                            && payload.has(Constants.REQUESTER_ID)) {
                        String meetingId = payload.get(Constants.MEETING_ID).getAsString();
                        String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();

                        Util util = new Util();
                        JsonArray stunsArray = (JsonArray) payload.get(Constants.STUNS);
                        ArrayList<String> stunsArrayList = util.extractStuns(stunsArray);

                        JsonArray turnsArray = (JsonArray) payload.get(Constants.TURNS);
                        ArrayList<Map<String, Object>> turnsArrayList = util.extractTurns(turnsArray);

                        return new SendStunTurnInfoReplyMessage(meetingId, requesterId, stunsArrayList, turnsArrayList);
                    }
                }
            }
        }
        return null;

    }

}
