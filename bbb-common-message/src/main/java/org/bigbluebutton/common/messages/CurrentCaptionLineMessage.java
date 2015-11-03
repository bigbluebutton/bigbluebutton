package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class CurrentCaptionLineMessage implements ISubscribedMessage {
	public static final String CURRENT_CAPTION_LINE  = "current_caption_line_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String locale;
	public final String text;
	
	public CurrentCaptionLineMessage(String meetingID, String locale, String text) {
		this.meetingID = meetingID;
		this.locale = locale;
		this.text = text;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID); 
		payload.put(Constants.LOCALE, locale);
		payload.put(Constants.TEXT, text);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(CURRENT_CAPTION_LINE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static CurrentCaptionLineMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (CURRENT_CAPTION_LINE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.LOCALE)
							&& payload.has(Constants.TEXT)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String locale = payload.get(Constants.LOCALE).getAsString();
						String text = payload.get(Constants.TEXT).getAsString();
								
						return new CurrentCaptionLineMessage(meetingID, locale, text);					
					}
				} 
			}
		}
		return null;

	}
}
