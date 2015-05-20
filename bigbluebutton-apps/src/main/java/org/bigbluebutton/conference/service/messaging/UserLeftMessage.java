package org.bigbluebutton.conference.service.messaging;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UserLeftMessage implements IMessage {
	public static final String USER_LEFT = "user_left_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final Map<String, Object> user;

	public UserLeftMessage(String meetingID, Map<String, Object> user) {
		this.meetingId = meetingID;
		this.user = user;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);


		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(USER_LEFT, VERSION, null);

		return MessageBuilder.buildJson(header, payload);				
	}
	public static UserLeftMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (USER_LEFT.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER)) {
						String meetingID = payload.get(Constants.MEETING_ID).getAsString();
						
						JsonObject user = (JsonObject) payload.get(Constants.USER);
						if (user.has(Constants.USER_ID) &&
							user.has("voiceUser")) {
							Map<String, Object> userMap = new HashMap<String, Object>();
							Map<String, Object> vuMap = new HashMap<String, Object>();						
 
							String userid = user.get(Constants.USER_ID).getAsString();
							String username = user.get(Constants.NAME).getAsString();
							Boolean hasStream = user.get("has_stream").getAsBoolean();
							Boolean listenOnly = user.get("listenOnly").getAsBoolean();
							Boolean raiseHand = user.get("raise_hand").getAsBoolean();
							Boolean phoneUser = user.get("phone_user").getAsBoolean();
							Boolean presenter = user.get("presenter").getAsBoolean();
							Boolean locked = user.get("locked").getAsBoolean();
							String extUserId = user.get("extern_userid").getAsString();
							String role = user.get("role").getAsString();
							
							userMap.put("userid", userid);
							userMap.put("name", username);
							userMap.put("listenOnly", listenOnly);
							userMap.put("has_stream", hasStream);
							userMap.put("raise_hand", raiseHand);
							userMap.put("extern_userid", extUserId);
							userMap.put("phone_user", phoneUser);
							userMap.put("locked", locked);
							userMap.put("role", role);
							userMap.put("presenter", presenter);
							
							JsonObject vu = (JsonObject) user.get("voiceUser");
							
							Boolean talking = vu.get("talking").getAsBoolean();
							Boolean voiceLocked = vu.get("locked").getAsBoolean();
							Boolean muted = vu.get("muted").getAsBoolean();
							Boolean joined = vu.get("joined").getAsBoolean();
							String callername = vu.get("callername").getAsString();
							String callernum = vu.get("callernum").getAsString();
							String webUserId = vu.get("web_userid").getAsString();
							String voiceUserId = vu.get("userid").getAsString();
							
							vuMap.put("talking", talking);
							vuMap.put("locked", voiceLocked);
							vuMap.put("muted", muted);
							vuMap.put("joined", joined);
							vuMap.put("callername", callername);
							vuMap.put("callernum", callernum);
							vuMap.put("web_userid", webUserId);
							vuMap.put("userid", voiceUserId);
							
							userMap.put("voiceUser", vuMap);
							
							return new UserLeftMessage(meetingID, userMap);							
						}
						
					}
				}
			}
		}
		System.out.println("Failed to parse RegisterUserMessage");
		return null;
	}
}
