package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class InitPermissionsSettingMessage implements ISubscribedMessage {
	public static final String INIT_PERMISSIONS_SETTING = "init_permission_settings_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final Map<String, Boolean> permissions;
	
	public InitPermissionsSettingMessage(String meetingID, Map<String, Boolean> permissions) {
		this.meetingId = meetingID;
		this.permissions = permissions;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.PERMISSIONS, permissions);
		
		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(INIT_PERMISSIONS_SETTING, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static InitPermissionsSettingMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");
			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (INIT_PERMISSIONS_SETTING.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.PERMISSIONS)) {
								
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();

						JsonObject permissions = (JsonObject) payload.get(Constants.PERMISSIONS);
						
						Util util = new Util();
						Map<String, Boolean> permissionsMap = util.extractPermission(permissions);
												
						if (permissionsMap != null) {
							return new InitPermissionsSettingMessage(meetingID, permissionsMap);					
						}						
					}
				}
			}
		}

		return null;
	}
}
