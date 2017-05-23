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
	public final Payload payload;

	public RegisterUserMessage(Payload payload) {
		this.header = new Header(NAME);
		this.payload = payload;
	}

	public static class Payload {
		public final String meetingId;
		public final String userId;
		public final String name;
		public final String role;
		public final String extUserId;
		public final String authToken;
		public final String avatarUrl;
		public final Boolean guest;
		public final Boolean authed;

		public Payload(String meetingId, String userId, String name, String role,
								   String extUserId, String authToken, String avatarUrl, Boolean guest, Boolean authed) {
			this.meetingId = meetingId;
			this.userId = userId;
			this.name = name;
			this.role = role;
			this.extUserId = extUserId;
			this.authToken = authToken;
			this.avatarUrl = avatarUrl;
			this.guest = guest;
			this.authed = authed;
		}
	}
}
