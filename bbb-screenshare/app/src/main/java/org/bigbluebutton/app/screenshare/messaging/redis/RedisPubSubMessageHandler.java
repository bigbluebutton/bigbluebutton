package org.bigbluebutton.app.screenshare.messaging.redis;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bigbluebutton.app.screenshare.red5.Red5AppHandler;
import org.bigbluebutton.common.messages.MeetingDestroyedMessage;
import org.bigbluebutton.common.messages.MeetingCreatedMessage;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RedisPubSubMessageHandler implements MessageHandler {
    private static Logger log = Red5LoggerFactory.getLogger(RedisPubSubMessageHandler.class, "screenshare");
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

                    if (MeetingDestroyedMessage.NAME.equals(messageName)) {
                        MeetingDestroyedMessage msg = MeetingDestroyedMessage.fromJson(message);
                        handler.meetingHasEnded(msg.meetingId);

                    } else if (MeetingCreatedMessage.MEETING_CREATED.equals(messageName)) {
                        MeetingCreatedMessage msg = MeetingCreatedMessage.fromJson(message);
                        handler.meetingCreated(msg.meetingId, msg.record);

                    }
                }
            }
        }


    }

    public void setAppHandler(Red5AppHandler handler) {
        this.handler = handler;
  }

}
