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

public class TransferUserToMeetingRequestMessage implements ISubscribedMessage {
	public static final String TRANSFER_USER_TO_MEETING = "transfer_user_to_meeting_message";
	public static final String VERSION = "0.0.1";

	public final String meetingId;
	public final String breakoutId;
	public final String userId;
	public final Boolean toBreakout;

	private static final String TO_BREAKOUT = "to_breakout";
	private static final String BREAKOUT_ID = "breakout_id";

	public TransferUserToMeetingRequestMessage(String meetingId, String breakoutId,
			String userId, Boolean toBreakout) {
		this.meetingId = meetingId;
		this.breakoutId = breakoutId;
		this.userId = userId;
		this.toBreakout = toBreakout;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.USER_ID, userId);
		payload.put(BREAKOUT_ID, breakoutId);
		payload.put(TO_BREAKOUT, toBreakout);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(
				TRANSFER_USER_TO_MEETING, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static TransferUserToMeetingRequestMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (TRANSFER_USER_TO_MEETING.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
							&& payload.has(Constants.USER_ID)
							&& payload.has(BREAKOUT_ID)
							&& payload.has(TO_BREAKOUT)) {
						String id = payload.get(Constants.MEETING_ID)
								.getAsString();
						String userId = payload.get(Constants.USER_ID)
								.getAsString();
						String breakoutId = payload.get(BREAKOUT_ID)
								.getAsString();
						Boolean toBreakout = payload.get(TO_BREAKOUT)
								.getAsBoolean();
						return new TransferUserToMeetingRequestMessage(id, breakoutId,
								userId, toBreakout);
					}
				}
			}
		}
		return null;
	}

}
