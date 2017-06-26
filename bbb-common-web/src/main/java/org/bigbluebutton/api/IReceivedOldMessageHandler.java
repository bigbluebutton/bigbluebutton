package org.bigbluebutton.api;

public interface IReceivedOldMessageHandler {
    void handleMessage(String pattern, String channel, String message);
}
