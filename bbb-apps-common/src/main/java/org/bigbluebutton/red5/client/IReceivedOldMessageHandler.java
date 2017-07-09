package org.bigbluebutton.red5.client;

public interface IReceivedOldMessageHandler {
    void handleMessage(String pattern, String channel, String message);
}
