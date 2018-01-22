package org.bigbluebutton.red5.pubsub;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bigbluebutton.app.video.ConnectionInvokerService;
import org.bigbluebutton.red5.pubsub.message.ValidateConnTokenRespMsg;

public class MeetingMessageHandler implements MessageHandler {

    private final String HEADER = "header";
    private final String NAME = "name";
    private final String BODY = "body";
    private final String MEETING_ID = "meetingId";
    private final String TIMESTAMP = "timestamp";
    private final String ENVELOPE = "envelope";
    private final String CORE = "core";

    private final String USERID = "userId";
    private final String AUTHZED = "authzed";
    private final String CONN = "conn";

    private final String RecordingChapterBreakSysMsg = "RecordingChapterBreakSysMsg";
    private final String ValidateConnAuthTokenSysRespMsg = "ValidateConnAuthTokenSysRespMsg";

    private ConnectionInvokerService connInvokerService;

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
        if (ValidateConnAuthTokenSysRespMsg.equals(name)) {
            if (body.has(MEETING_ID) && body.has(USERID)
                    && body.has(AUTHZED) && body.has(CONN)) {
                String meetingId = body.get(MEETING_ID).getAsString();
                String userId = body.get(USERID).getAsString();
                Boolean authzed = body.get(AUTHZED).getAsBoolean();
                String conn = body.get(CONN).getAsString();
                if (conn.equals("VIDEO")) {
                    ValidateConnTokenRespMsg vctrm = new ValidateConnTokenRespMsg(meetingId, userId, authzed, conn);
                    connInvokerService.sendMessage(vctrm);
                }
            }
        }
    }

    public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
        this.connInvokerService = connInvokerService;
    }
}
