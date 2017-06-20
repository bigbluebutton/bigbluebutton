package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

public class CreateMeetingRequest implements IBigBlueButtonMessage {
    public final static String NAME = "CreateMeetingRequest";

    public final Header header;
    public final CreateMeetingRequestPayload payload;

    public CreateMeetingRequest(CreateMeetingRequestPayload payload) {
        this.header = new Header(NAME);
        this.payload = payload;
    }
}
