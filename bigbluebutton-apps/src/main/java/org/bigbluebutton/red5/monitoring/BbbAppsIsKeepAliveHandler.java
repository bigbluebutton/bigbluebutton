package org.bigbluebutton.red5.monitoring;

import org.bigbluebutton.common.messages.BbbAppsIsAliveMessage;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class BbbAppsIsKeepAliveHandler {

	private BbbAppsIsAliveMonitorService monitorService;
	
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
					case BbbAppsIsAliveMessage.BBB_APPS_IS_ALIVE:
						processBbbAppsIsAliveMessage(message);
						break;
				}
			}
		}
	}
	
	private void processBbbAppsIsAliveMessage(String json) {
		BbbAppsIsAliveMessage msg = BbbAppsIsAliveMessage.fromJson(json);

		if (msg != null) {
			monitorService.handleKeepAliveMessage(msg.startedOn, msg.timestamp);
		}		
	}
}
