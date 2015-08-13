package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GetPresentationInfoReplyMessage implements IBigBlueButtonMessage {
	public static final String GET_PRESENTATION_INFO_REPLY = "get_presentation_info_reply";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String requesterId;
	public final Map<String, Object> presenter;
	public final ArrayList<Map<String, Object>> presentations;
			
	public GetPresentationInfoReplyMessage(String meetingId, String requesterId, 
			Map<String, Object> presenter, ArrayList<Map<String, Object>> presentations) {
		this.meetingId = meetingId;
		this.requesterId = requesterId;
		this.presenter = presenter;
		this.presentations = presentations;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.REQUESTER_ID, requesterId);
		payload.put(Constants.PRESENTER, presenter);
		payload.put(Constants.PRESENTATIONS, presentations);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GET_PRESENTATION_INFO_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static GetPresentationInfoReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GET_PRESENTATION_INFO_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID) 
							&& payload.has(Constants.REQUESTER_ID)
							&& payload.has(Constants.PRESENTER)
							&& payload.has(Constants.PRESENTATIONS)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String requesterId = payload.get(Constants.REQUESTER_ID).getAsString();
						JsonObject presenterJsonObject = payload.get(Constants.PRESENTER).getAsJsonObject();
						
						Util util = new Util();
						Map<String, Object> presenter = util.extractCurrentPresenter(presenterJsonObject);
						
						JsonArray presentationsJsonArray = payload.get(Constants.PRESENTATIONS).getAsJsonArray();
						ArrayList<Map<String, Object>> presentations = util.extractPresentations(presentationsJsonArray);
						
						return new GetPresentationInfoReplyMessage(meetingId, requesterId, presenter, presentations);
					}
				} 
			}
		}
		return null;
	}
}
