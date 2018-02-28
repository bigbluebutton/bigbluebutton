package org.bigbluebutton.red5.pubsub;

public class ReceivedMessage {
    private final String pattern;
    private final String channel;
    private final String message;

    public ReceivedMessage(String pattern, String channel, String message) {
        this.pattern = pattern;
        this.channel = channel;
        this.message = message;
    }

    public String getPattern() {
        return pattern;
    }

    public String getChannel() {
        return channel;
    }

    public String getMessage() {
        return message;
    }
}
