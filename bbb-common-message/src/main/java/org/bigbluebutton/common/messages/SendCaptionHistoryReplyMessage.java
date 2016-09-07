package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendCaptionHistoryReplyMessage implements ISubscribedMessage {
	public static final String SEND_CAPTION_HISTORY_REPLY = "send_caption_history_reply_message";
	public static final String VERSION = "0.0.1";

	public final String meetingID;
	public final String requesterID;
	public final Map<String, String[]> captionHistory;

	public SendCaptionHistoryReplyMessage(String meetingID, String requesterID, Map<String, String[]> captionHistory) {
		this.meetingID = meetingID;
		this.captionHistory = captionHistory;
		this.requesterID = requesterID;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingID);
		payload.put(Constants.REQUESTER_ID, requesterID);
		payload.put(Constants.CAPTION_HISTORY, captionHistory);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_CAPTION_HISTORY_REPLY, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static SendCaptionHistoryReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_CAPTION_HISTORY_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.CAPTION_HISTORY)
							&& payload.has(Constants.REQUESTER_ID)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						String requesterID = payload.get(Constants.REQUESTER_ID).getAsString();

						JsonObject history = (JsonObject) payload.get(Constants.CAPTION_HISTORY);

						Util util = new Util();

						Map<String, String[]> captionHistory = util.extractCaptionHistory(history);

						return new SendCaptionHistoryReplyMessage(meetingID, requesterID, captionHistory);
					}
				} 
			}
		}
		return null;
	}
}
