package org.bigbluebutton.red5.service;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

public class JsonEncoderUtil {
	public static JsonObject addMessageHeader(String name) {
		JsonObject header = new JsonObject();
		header.add("name", new JsonPrimitive(name));
		return header;
	}
	
	public static JsonObject headerAndPayload(JsonElement header, JsonElement payload) {
		JsonObject message = new JsonObject();
		message.add("header", header);
		message.add("payload", payload);
		return message;
	}
	
	public static JsonObject buildPayload(String json) {
		JsonParser parser = new JsonParser();
		JsonObject payload = parser.parse(json).getAsJsonObject();
		return payload;
	}
}
