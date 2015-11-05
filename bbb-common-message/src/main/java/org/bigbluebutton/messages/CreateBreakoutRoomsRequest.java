package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.CreateBreakoutRoomsRequestPayload;

import com.google.gson.Gson;

/**
 * The message from the client to the server requesting to create breakout
 * rooms.
 */
public class CreateBreakoutRoomsRequest implements IBigBlueButtonMessage {
	public final static String NAME = "CreateBreakoutRoomsRequest";

	public final Header header;
	public final CreateBreakoutRoomsRequestPayload payload;

	public CreateBreakoutRoomsRequest(CreateBreakoutRoomsRequestPayload payload) {
		this.header = new Header(NAME);
		this.payload = payload;
	}

	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}

}
