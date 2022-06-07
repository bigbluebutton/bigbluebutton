package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class BbbAppsIsAliveMessage {
	public static final String BBB_APPS_IS_ALIVE = "bbb_apps_is_alive_message";
	public static final String VERSION = "0.0.1";

	public static final String TIMESTAMP = "timestamp";	
	public static final String STARTED_ON = "started_on";
	
	public final Long timestamp;
	public final Long startedOn;

	public BbbAppsIsAliveMessage(Long startedOn, Long timestamp) {
		this.startedOn = startedOn;
		this.timestamp = timestamp;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<>();
		payload.put(TIMESTAMP, timestamp);
		payload.put(STARTED_ON, timestamp);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(BBB_APPS_IS_ALIVE, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static BbbAppsIsAliveMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (BBB_APPS_IS_ALIVE.equals(messageName)) {

					if (payload.has(TIMESTAMP) && payload.has(STARTED_ON)) {
						Long timestamp = payload.get(TIMESTAMP).getAsLong();
						Long startedOn = payload.get(STARTED_ON).getAsLong();
						return new BbbAppsIsAliveMessage(startedOn, timestamp);
					}
				}
			}
		}
		return null;
	}
}
