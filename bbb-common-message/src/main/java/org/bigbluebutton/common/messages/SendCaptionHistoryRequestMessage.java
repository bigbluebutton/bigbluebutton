package org.bigbluebutton.common.messages;

import java.util.HashMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class SendCaptionHistoryRequestMessage implements ISubscribedMessage {
	public static final String SEND_CAPTION_HISTORY_REQUEST  = "send_caption_history_request_message";
	public static final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String requesterID;
	
	public SendCaptionHistoryRequestMessage(String meetingID, String requesterID) {
		this.meetingID = meetingID;
		this.requesterID = requesterID;
	}
	
	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID); 
		payload.put(Constants.REQUESTER_ID, requesterID);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_CAPTION_HISTORY_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static SendCaptionHistoryRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_CAPTION_HISTORY_REQUEST.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String requesterID = payload.get(Constants.REQUESTER_ID).getAsString();
								
						return new SendCaptionHistoryRequestMessage(meetingID, requesterID);					
					}
				} 
			}
		}
		return null;

	}
}
