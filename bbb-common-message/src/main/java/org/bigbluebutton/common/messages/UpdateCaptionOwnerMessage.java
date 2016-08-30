package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UpdateCaptionOwnerMessage implements ISubscribedMessage {
	public static final String UPDATE_CAPTION_OWNER  = "update_caption_owner_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String locale;
	public final String localeCode;
	public final String ownerID;
	
	public UpdateCaptionOwnerMessage(String meetingID, String locale, String localeCode, String ownerID) {
		this.meetingID = meetingID;
		this.locale = locale;
		this.localeCode = localeCode;
		this.ownerID = ownerID;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.LOCALE, locale);
		payload.put(Constants.LOCALE_CODE, localeCode);
		payload.put(Constants.OWNER_ID, ownerID);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(UPDATE_CAPTION_OWNER, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static UpdateCaptionOwnerMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (UPDATE_CAPTION_OWNER.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.LOCALE)
							&& payload.has(Constants.LOCALE_CODE)
							&& payload.has(Constants.OWNER_ID)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String locale = payload.get(Constants.LOCALE).getAsString();
						String localeCode = payload.get(Constants.LOCALE_CODE). getAsString();
						String ownerID = payload.get(Constants.OWNER_ID).getAsString();
								
						return new UpdateCaptionOwnerMessage(meetingID, locale, localeCode, ownerID);
					}
				} 
			}
		}
		return null;

	}
}
