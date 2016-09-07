package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class EditCaptionHistoryMessage implements ISubscribedMessage {
	public static final String EDIT_CAPTION_HISTORY  = "edit_caption_history_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String userID;
	public final Integer startIndex;
	public final Integer endIndex;
	public final String locale;
	public final String localeCode;
	public final String text;
	
	public EditCaptionHistoryMessage(String meetingID, String userID, Integer startIndex, Integer endIndex, String locale, String localeCode,  String text) {
		this.meetingID = meetingID;
		this.userID = userID;
		this.startIndex = startIndex;
		this.endIndex = endIndex;
		this.locale = locale;
		this.localeCode = localeCode;
		this.text = text;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.USER_ID, userID);
		payload.put(Constants.START_INDEX, startIndex);
		payload.put(Constants.END_INDEX, endIndex);
		payload.put(Constants.LOCALE, locale);
		payload.put(Constants.LOCALE_CODE, localeCode);
		payload.put(Constants.TEXT, text);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(EDIT_CAPTION_HISTORY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static EditCaptionHistoryMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (EDIT_CAPTION_HISTORY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.START_INDEX)
							&& payload.has(Constants.END_INDEX)
							&& payload.has(Constants.LOCALE)
							&& payload.has(Constants.LOCALE_CODE)
							&& payload.has(Constants.TEXT)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String userID = payload.get(Constants.USER_ID).getAsString();
						Integer startIndex = payload.get(Constants.START_INDEX).getAsInt();
						Integer endIndex = payload.get(Constants.END_INDEX).getAsInt();
						String locale = payload.get(Constants.LOCALE).getAsString();
						String localeCode = payload.get(Constants.LOCALE_CODE).getAsString();
						String text = payload.get(Constants.TEXT).getAsString();
								
						return new EditCaptionHistoryMessage(meetingID, userID, startIndex, endIndex, locale, localeCode, text);
					}
				} 
			}
		}
		return null;

	}
}
