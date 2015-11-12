package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendConversionUpdateMessage implements IBigBlueButtonMessage {
	public static final String SEND_CONVERSION_UPDATE = "send_conversion_update";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String messageKey;
	public final String code;
	public final String presId;
	public final String presName;


	public SendConversionUpdateMessage(String messageKey, String meetingId,
			String code, String presId, String presName) {
		this.meetingId = meetingId;
		this.messageKey = messageKey;
		this.code = code;
		this.presId = presId;
		this.presName = presName;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.MESSAGE_KEY, messageKey);
		payload.put(Constants.CODE, code);
		payload.put(Constants.PRESENTATION_ID, presId);
		payload.put(Constants.PRESENTATION_NAME, presName);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_CONVERSION_UPDATE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static SendConversionUpdateMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_CONVERSION_UPDATE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.MESSAGE_KEY)
							&& payload.has(Constants.CODE)
							&& payload.has(Constants.PRESENTATION_NAME)
							&& payload.has(Constants.PRESENTATION_ID)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String code = payload.get(Constants.CODE).getAsString();
						String messageKey = payload.get(Constants.MESSAGE_KEY).getAsString();
						String presId = payload.get(Constants.PRESENTATION_ID).getAsString();
						String presName = payload.get(Constants.PRESENTATION_NAME).getAsString();

						return new SendConversionUpdateMessage(messageKey, meetingId, code, presId, presName);
					}
				} 
			}
		}
		return null;
	}
}
