package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

public class RegisterUserMessage implements IBigBlueButtonMessage {
	public static final String NAME = "register_user_request";
	public final Header header;
	public final RegisterUserMessagePayload payload;

	public RegisterUserMessage(RegisterUserMessagePayload payload) {
		this.header = new Header(NAME);
		this.payload = payload;
	}
}
