package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.BreakoutRoomsTimeRemainingPayload;

import com.google.gson.Gson;

public class BreakoutRoomsTimeRemainingUpdate implements IBigBlueButtonMessage {
    public final static String NAME = "BreakoutRoomsTimeRemainingUpdate";

    public final Header header;
    public final BreakoutRoomsTimeRemainingPayload payload;

    public BreakoutRoomsTimeRemainingUpdate(
            BreakoutRoomsTimeRemainingPayload payload) {
        header = new Header(NAME);
        this.payload = payload;
    }

    public String toJson() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
}
