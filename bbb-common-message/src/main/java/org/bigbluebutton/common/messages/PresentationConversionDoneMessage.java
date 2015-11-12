package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.ArrayList;



public class PresentationConversionDoneMessage implements ISubscribedMessage {
	public static final String PRESENTATION_CONVERSION_DONE = "presentation_conversion_done_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final String code;
	public final Map<String,Object> presentation;

	public PresentationConversionDoneMessage(String meetingId, String code, Map<String,Object> presentation) {
		this.meetingId = meetingId;
		this.code = code;
		this.presentation = presentation;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.CODE, code);
		payload.put(Constants.PRESENTATION, presentation);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(PRESENTATION_CONVERSION_DONE, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static PresentationConversionDoneMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PRESENTATION_CONVERSION_DONE.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.CODE)
						&& payload.has(Constants.PRESENTATION)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();
						String code = payload.get(Constants.CODE).getAsString();

						JsonObject presObj = (JsonObject) payload.get(Constants.PRESENTATION).getAsJsonObject();
						Map<String, Object> presentation = new HashMap<String, Object>();

						if (presObj.has("id") 
								&& presObj.has("name")
								&& presObj.has("current")
								&& presObj.has("pages")){

							String id = presObj.get("id").getAsString();
							boolean current = presObj.get("current").getAsBoolean();
							String name = presObj.get("name").getAsString();

							presentation.put("id", id);
							presentation.put("current", current);
							presentation.put("name", name);

							JsonArray pages = (JsonArray) presObj.get(Constants.PAGES);

							Util util = new Util();
							ArrayList<Map<String, Object>> pagesList = util.extractPages(pages);

							presentation.put("pages", pagesList);

							return new PresentationConversionDoneMessage(meetingId, code, presentation);
						}
					}
				}
			}
		}
		return null;
	}
}
