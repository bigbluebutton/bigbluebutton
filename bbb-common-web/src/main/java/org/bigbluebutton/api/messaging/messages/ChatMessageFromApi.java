package org.bigbluebutton.api.messaging.messages;

public class ChatMessageFromApi implements IMessage {
    public final String meetingId;
    public final String name;
    public final String message;

    public ChatMessageFromApi(String meetingId, String name, String message) {
        this.meetingId = meetingId;
        this.name = name;
        this.message = message;
    }
}
