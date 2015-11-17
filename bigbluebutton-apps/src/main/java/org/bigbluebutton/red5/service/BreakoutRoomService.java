/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.red5.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.bigbluebutton.messages.payload.BreakoutRoomRequestPayload;
import org.bigbluebutton.messages.payload.CreateBreakoutRoomsRequestPayload;
import org.bigbluebutton.messages.payload.EndAllBreakoutRoomsRequestPayload;
import org.bigbluebutton.messages.payload.ListenInOnBreakoutPayload;
import org.bigbluebutton.messages.payload.RequestBreakoutJoinURLPayload;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;

public class BreakoutRoomService {

	private static Logger log = Red5LoggerFactory.getLogger(
			BreakoutRoomService.class, "bigbluebutton");

	private MessagePublisher red5GW;

	public void setRed5Publisher(MessagePublisher inGW) {
		red5GW = inGW;
	}

	public void createBreakoutRooms(Map<String, Object> msg) {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingId = (String) msg.get("meetingId");
		Integer duration = (Integer) msg.get("durationInMinutes");
		ArrayList rooms = (ArrayList) msg.get("rooms");

		ArrayList<BreakoutRoomRequestPayload> breakoutRooms = new ArrayList<BreakoutRoomRequestPayload>();
		for (int i = 0; i < rooms.size(); i++) {
			HashMap room = (HashMap) rooms.get(i);
			breakoutRooms.add(new BreakoutRoomRequestPayload(room.get("name")
					.toString(), (ArrayList<String>) room.get("users")));
		}

		CreateBreakoutRoomsRequestPayload payload = new CreateBreakoutRoomsRequestPayload(
				meetingId, breakoutRooms, duration);
		red5GW.createBreakoutRooms(payload);
	}

	public void requestBreakoutJoinURL(Map<String, Object> msg) {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingId = (String) msg.get("meetingId");
		String breakoutId = (String) msg.get("breakoutId");
		String userId = (String) msg.get("userId");
		
		RequestBreakoutJoinURLPayload payload = new RequestBreakoutJoinURLPayload(meetingId, breakoutId, userId);
		red5GW.requestBreakoutJoinURL(payload);
	}

	public void listenInOnBreakout(Map<String, Object> msg) {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingId = (String) msg.get("meetingId");
		String breakoutId = (String) msg.get("breakoutId");
		String userId = (String) msg.get("userId");
		Boolean listen = (Boolean) msg.get("listen");
		
		ListenInOnBreakoutPayload payload = new ListenInOnBreakoutPayload(meetingId, breakoutId, userId, listen);
		red5GW.listenInOnBreakout(payload);
	}

	public void endAllBreakoutRooms(Map<String, Object> msg) {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingId = (String) msg.get("meetingId");

		EndAllBreakoutRoomsRequestPayload payload = new EndAllBreakoutRoomsRequestPayload(
				meetingId);
		red5GW.endAllBreakoutRooms(payload);
	}
}
