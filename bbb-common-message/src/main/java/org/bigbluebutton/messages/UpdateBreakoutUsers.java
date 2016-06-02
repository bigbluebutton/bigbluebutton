package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.UpdateBreakoutUsersPayload;

import com.google.gson.Gson;

public class UpdateBreakoutUsers implements IBigBlueButtonMessage {
	public final static String NAME = "UpdateBreakoutUsers";

	public final Header header;
	public final UpdateBreakoutUsersPayload payload;

	public UpdateBreakoutUsers(UpdateBreakoutUsersPayload payload) {
		this.header = new Header(NAME);
		this.payload = payload;

	}

	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}
}
