package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SendLockSettingsMessage implements IBigBlueButtonMessage {
	public static final String SEND_LOCK_SETTINGS = "send_lock_settings";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String userId;
	public final Map<String, Boolean> newSettings;


	public SendLockSettingsMessage(String meetingId, String userId, Map<String, Boolean> newSettings) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.newSettings = newSettings;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();

		Map<String, Boolean> settingsMap = new HashMap<String, Boolean>();

		settingsMap.put(Constants.DISABLE_CAMERA, newSettings.get("disableCam"));
		settingsMap.put(Constants.DISABLE_MICROPHONE, newSettings.get("disableMic"));
		settingsMap.put(Constants.DISABLE_PRIVATE_CHAT, newSettings.get("disablePrivateChat"));
		settingsMap.put(Constants.DISABLE_PUBLIC_CHAT, newSettings.get("disablePublicChat"));
		settingsMap.put(Constants.LOCKED_LAYOUT, newSettings.get("lockedLayout"));
		settingsMap.put(Constants.LOCK_ON_JOIN, newSettings.get("lockOnJoin"));
		settingsMap.put(Constants.LOCK_ON_JOIN_CONFIGURABLE, newSettings.get("lockOnJoinConfigurable"));

		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.USER_ID, userId);
		payload.put(Constants.SETTINGS, settingsMap);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(SEND_LOCK_SETTINGS, VERSION, null);
		return MessageBuilder.buildJson(header, payload);
	}

	public static SendLockSettingsMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (SEND_LOCK_SETTINGS.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER_ID)
							&& payload.has(Constants.SETTINGS)) {

						JsonObject settingsObj = (JsonObject) payload.get(Constants.SETTINGS).getAsJsonObject();
						if (settingsObj.has(Constants.DISABLE_CAMERA)
								&& settingsObj.has(Constants.DISABLE_CAMERA)
								&& settingsObj.has(Constants.DISABLE_MICROPHONE)
								&& settingsObj.has(Constants.DISABLE_PRIVATE_CHAT)
								&& settingsObj.has(Constants.DISABLE_PUBLIC_CHAT)
								&& settingsObj.has(Constants.LOCKED_LAYOUT)
								&& settingsObj.has(Constants.LOCK_ON_JOIN)
								&& settingsObj.has(Constants.LOCK_ON_JOIN_CONFIGURABLE)) {

							Map<String, Boolean> settingsMap = new HashMap<String, Boolean>();

							settingsMap.put("disableCam", settingsObj.get(Constants.DISABLE_CAMERA).getAsBoolean());
							settingsMap.put("disableMic", settingsObj.get(Constants.DISABLE_MICROPHONE).getAsBoolean());
							settingsMap.put("disablePrivateChat", settingsObj.get(Constants.DISABLE_PRIVATE_CHAT).getAsBoolean());
							settingsMap.put("disablePublicChat", settingsObj.get(Constants.DISABLE_PUBLIC_CHAT).getAsBoolean());
							settingsMap.put("lockedLayout", settingsObj.get(Constants.LOCKED_LAYOUT).getAsBoolean());
							settingsMap.put("lockOnJoin", settingsObj.get(Constants.LOCK_ON_JOIN).getAsBoolean());
							settingsMap.put("lockOnJoinConfigurable", settingsObj.get(Constants.LOCK_ON_JOIN_CONFIGURABLE).getAsBoolean());

							String meetingId = payload.get(Constants.MEETING_ID).getAsString();
							String userId = payload.get(Constants.USER_ID).getAsString();

							return new SendLockSettingsMessage(meetingId, userId, settingsMap);
						}
					}
				}
			}
		}
		return null;
	}
}
