package org.bigbluebutton.common.converters;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.common.messages.PubSubPingMessage;
import org.bigbluebutton.common.messages.PubSubPongMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class FromJsonDecoder {

	public IBigBlueButtonMessage decodeMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
	
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (PubSubPingMessage.PUBSUB_PING.equals(messageName)){
					Gson gson = new Gson();
					PubSubPingMessage msg = gson.fromJson(message, PubSubPingMessage.class);
					return msg;
				}else if (PubSubPongMessage.PUBSUB_PONG.equals(messageName)){
					Gson gson = new Gson();
					PubSubPongMessage msg = gson.fromJson(message, PubSubPongMessage.class);
					return msg;
				} else {
					// System.out.println("Unknown message name=[" + messageName + "]");
					return null;
				}
			}
		}
		System.out.println("Invalid message format");
		return null;
	}
}
