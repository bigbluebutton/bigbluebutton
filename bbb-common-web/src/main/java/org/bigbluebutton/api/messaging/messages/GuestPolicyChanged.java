package org.bigbluebutton.api.messaging.messages;

public class GuestPolicyChanged implements IMessage {
    public final String meetingId;
    public final String policy;

    public GuestPolicyChanged(String meetingId, String policy) {
        this.meetingId = meetingId;
        this.policy = policy;
    }
}
