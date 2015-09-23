package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class NewPermissionsSettingMessage implements ISubscribedMessage {
	public static final String NEW_PERMISSIONS_SETTING = "new_permission_settings";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final ArrayList<Map<String, Object>> users;
	public final Map<String, Boolean> permissions;
	
	public NewPermissionsSettingMessage(String meetingID, Map<String, Boolean> permissions, ArrayList<Map<String, Object>> users) {
		this.meetingId = meetingID;
		this.users = users;
		this.permissions = permissions;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(NEW_PERMISSIONS_SETTING, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	
	public static NewPermissionsSettingMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (NEW_PERMISSIONS_SETTING.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USERS)
							&& payload.has(Constants.PERMISSIONS)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();

						JsonObject permissions = (JsonObject) payload.get(Constants.PERMISSIONS);
						
						Util util = new Util();
						Map<String, Boolean> permissionsMap = util.extractPermission(permissions);
						
						JsonArray users = (JsonArray) payload.get(Constants.USERS);
						
						ArrayList<Map<String, Object>> usersList = util.extractUsers(users);
						
						if (usersList != null && permissionsMap != null) {
							return new NewPermissionsSettingMessage(meetingID, permissionsMap, usersList);					
						}						
					}
				}
			}
		}

		return null;
	}
}
