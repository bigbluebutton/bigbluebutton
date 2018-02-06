package org.bigbluebutton.red5.pubsub;

public interface MessageHandler {
    void handleMessage(String pattern, String channel, String message);
}
