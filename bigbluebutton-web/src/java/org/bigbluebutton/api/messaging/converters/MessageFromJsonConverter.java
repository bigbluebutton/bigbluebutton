package org.bigbluebutton.api.messaging.converters;

import org.bigbluebutton.api.messaging.messages.IMessage;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MessageFromJsonConverter {

	public IMessage convert(String json) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(json);
		if (obj.has("header") && obj.has("payload")) {
			
		}
		
		return null;
	}
}
