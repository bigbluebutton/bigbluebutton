/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2016 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.common.messages;

import java.util.HashMap;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class TransferUserToVoiceConfRequestMessage {
	public static final String TRANSFER_USER_TO_VOICE_CONF_REQUEST = "transfer_user_to_voice_conf_request_message";
	public static final String VERSION = "0.0.1";

	public static final String VOICE_CONF_ID = "voice_conf_id";
	public static final String TARGET_VOICE_CONF_ID = "target_voice_conf_id";
	public static final String VOICE_USER_ID = "voice_user_id";

	public final String voiceConfId;
	public final String targetVoiceConfId;
	public final String voiceUserId;

	public TransferUserToVoiceConfRequestMessage(String voiceConfId,
			String breakoutVoiceConfId, String voiceUserId) {
		this.voiceConfId = voiceConfId;
		this.targetVoiceConfId = breakoutVoiceConfId;
		this.voiceUserId = voiceUserId;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(VOICE_CONF_ID, voiceConfId);
		payload.put(TARGET_VOICE_CONF_ID, targetVoiceConfId);
		payload.put(VOICE_USER_ID, voiceUserId);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(
				TRANSFER_USER_TO_VOICE_CONF_REQUEST, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static TransferUserToVoiceConfRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (TRANSFER_USER_TO_VOICE_CONF_REQUEST.equals(messageName)) {
					if (payload.has(VOICE_CONF_ID)
							&& payload.has(TARGET_VOICE_CONF_ID)
							&& payload.has(VOICE_USER_ID)) {
						String id = payload.get(VOICE_CONF_ID).getAsString();
						String targetVoiceConfId = payload.get(
								TARGET_VOICE_CONF_ID).getAsString();
						String voiceUserId = payload.get(VOICE_USER_ID)
								.getAsString();
						return new TransferUserToVoiceConfRequestMessage(id,
								targetVoiceConfId, voiceUserId);
					}
				}
			}
		}
		return null;
	}
}
