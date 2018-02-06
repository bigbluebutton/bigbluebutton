package org.bigbluebutton.red5.pubsub;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bigbluebutton.app.video.ConnectionInvokerService;
import org.bigbluebutton.red5.pubsub.message.ValidateConnTokenRespMsg;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class MeetingMessageHandler implements MessageHandler {
    private static Logger log = Red5LoggerFactory.getLogger(MeetingMessageHandler.class, "video");

    private final String HEADER = "header";
    private final String NAME = "name";
    private final String BODY = "body";
    private final String MEETING_ID = "meetingId";
    private final String TIMESTAMP = "timestamp";
    private final String ENVELOPE = "envelope";
    private final String CORE = "core";

    private final String USERID = "userId";
    private final String AUTHZED = "authzed";
    private final String CONN = "connId";
    private final String APP = "app";
    private final String VIDEO_APP = "VIDEO";

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
            Gson gson = new Gson();
            String logStr = gson.toJson(body);

            log.debug("HANDLE: {}", logStr);
            if (body.has(MEETING_ID) && body.has(USERID)
                    && body.has(AUTHZED) && body.has(CONN) && body.has(APP)) {
                String meetingId = body.get(MEETING_ID).getAsString();
                String userId = body.get(USERID).getAsString();
                Boolean authzed = body.get(AUTHZED).getAsBoolean();
                String conn = body.get(CONN).getAsString();
                String app = body.get(APP).getAsString();

                log.debug("PROCESS: {}", name);
                if (VIDEO_APP.equals(app)) {
                    ValidateConnTokenRespMsg vctrm = new ValidateConnTokenRespMsg(meetingId, userId, authzed, conn);
                    connInvokerService.sendMessage(vctrm);
                }
            } else {
                log.debug("INVALID MSG FORMAT: {}", logStr);
            }
        }
    }

    public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
        this.connInvokerService = connInvokerService;
    }
}
