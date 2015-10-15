package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class NewCaptionLineMessage implements ISubscribedMessage {
	public static final String NEW_CAPTION_LINE  = "new_caption_line_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final Integer lineNumber;
	public final String locale;
	public final Integer startTime;
	public final String text;
	
	public NewCaptionLineMessage(String meetingID, Integer lineNumber, String locale, Integer startTime, String text) {
		this.meetingID = meetingID;
		this.lineNumber = lineNumber;
		this.locale = locale;
		this.startTime = startTime;
		this.text = text;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID); 
		payload.put(Constants.LINE_NUMBER, lineNumber);
		payload.put(Constants.LOCALE, locale);
		payload.put(Constants.START_TIME, startTime);
		payload.put(Constants.TEXT, text);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(NEW_CAPTION_LINE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static NewCaptionLineMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (NEW_CAPTION_LINE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.LINE_NUMBER)
							&& payload.has(Constants.LOCALE)
							&& payload.has(Constants.START_TIME)
							&& payload.has(Constants.TEXT)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						Integer lineNumber = payload.get(Constants.LINE_NUMBER).getAsInt();
						String locale = payload.get(Constants.LOCALE).getAsString();
						Integer startTime = payload.get(Constants.START_TIME).getAsInt();
						String text = payload.get(Constants.TEXT).getAsString();
								
						return new NewCaptionLineMessage(meetingID, lineNumber, locale, startTime, text);					
					}
				} 
			}
		}
		return null;

	}
}
