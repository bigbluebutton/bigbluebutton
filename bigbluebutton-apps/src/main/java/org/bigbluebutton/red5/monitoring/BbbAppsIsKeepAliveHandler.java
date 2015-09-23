package org.bigbluebutton.red5.monitoring;

import org.bigbluebutton.common.converters.FromJsonDecoder;
import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.common.messages.PubSubPongMessage;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class BbbAppsIsKeepAliveHandler {

	private BbbAppsIsAliveMonitorService monitorService;
	
	private final FromJsonDecoder decoder = new FromJsonDecoder();
	
	public void setBbbAppsIsAliveMonitorService(BbbAppsIsAliveMonitorService s) {
		monitorService = s;
	}
	
	public void handleKeepAliveMessage(String message) {
		
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
					case PubSubPongMessage.PUBSUB_PONG:
						
						processBbbAppsIsAliveMessage(message);
						break;
				}
			}
		}
	}
	
	private void processBbbAppsIsAliveMessage(String json) {
		IBigBlueButtonMessage msg = decoder.decodeMessage(json);
		
		if (msg != null) {
			PubSubPongMessage m = (PubSubPongMessage) msg;
			monitorService.handleKeepAliveMessage(m.payload.system, m.payload.timestamp);
		} 
	}
}
