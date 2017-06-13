package org.bigbluebutton.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.common.messages.MessageBuilder;

public class RegisterUserMessage implements IBigBlueButtonMessage {
	public static final String NAME = "register_user_request";
	public final Header header;
	public final RegisterUserMessagePayload payload;

	public RegisterUserMessage(RegisterUserMessagePayload payload) {
		this.header = new Header(NAME);
		this.payload = payload;
	}
}
