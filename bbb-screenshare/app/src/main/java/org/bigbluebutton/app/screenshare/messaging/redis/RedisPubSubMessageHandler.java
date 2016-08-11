package org.bigbluebutton.app.screenshare.messaging.redis;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bigbluebutton.app.screenshare.red5.Red5AppHandler;
import org.bigbluebutton.common.messages.AllowUserToShareDesktopReply;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RedisPubSubMessageHandler implements MessageHandler {
    private static Logger log = Red5LoggerFactory.getLogger(RedisPubSubMessageHandler.class,
            "screenshare");
    private Red5AppHandler handler;

    @Override
    public void handleMessage(String pattern, String channel, String message) {
        if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {
            JsonParser parser = new JsonParser();
            JsonObject obj = (JsonObject) parser.parse(message);
            if (obj.has("header") && obj.has("payload")) {
                JsonObject header = (JsonObject) obj.get("header");
                if (header.has("name")) {
                    String messageName = header.get("name").getAsString();

                    if (AllowUserToShareDesktopReply.NAME.equals(messageName)) {
                        AllowUserToShareDesktopReply msg = AllowUserToShareDesktopReply.fromJson(message);
                        log.info("^^^^^^^AllowUserToShareDesktopReply in " +
                                "RedisPubSubMessageHandler::handleMessage^^^^^^allowed=" + msg.allowed);
                        handler.startShareRequest(msg.meetingId, msg.userId, msg.allowed);

                    } else {
                        log.info("some other meeting message");
                    }
                }
            }
        }


    }

    public void setAppHandler(Red5AppHandler handler) {
        this.handler = handler;
  }

}
