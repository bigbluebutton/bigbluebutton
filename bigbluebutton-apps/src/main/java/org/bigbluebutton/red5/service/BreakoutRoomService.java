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

import org.bigbluebutton.messages.CreateBreakoutRoomsRequest;
import org.bigbluebutton.messages.EndAllBreakoutRoomsRequest;
import org.bigbluebutton.messages.GetBreakoutRoomsList;
import org.bigbluebutton.messages.ListenInOnBreakout;
import org.bigbluebutton.messages.RequestBreakoutJoinURL;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class BreakoutRoomService extends AbstractService {

	private static Logger log = Red5LoggerFactory.getLogger(
			BreakoutRoomService.class, "bigbluebutton");

	private MessagePublisher red5GW;

	public void setRed5Publisher(MessagePublisher inGW) {
		red5GW = inGW;
	}

	public void getBreakoutRoomsList(String jsonMessage) {
		red5GW.getBreakoutRoomsList(addHeaderToMessage(jsonMessage,
				GetBreakoutRoomsList.NAME));
	}

	public void createBreakoutRooms(String jsonMessage) {
		red5GW.createBreakoutRooms(addHeaderToMessage(jsonMessage,
				CreateBreakoutRoomsRequest.NAME));
	}

	public void requestBreakoutJoinUrl(String jsonMessage) {
		red5GW.requestBreakoutJoinURL(addHeaderToMessage(jsonMessage,
				RequestBreakoutJoinURL.NAME));
	}

	public void listenInOnBreakout(String jsonMessage) {
		red5GW.listenInOnBreakout(addHeaderToMessage(jsonMessage,
				ListenInOnBreakout.NAME));
	}

	public void endAllBreakoutRooms(String jsonMessage) {
		red5GW.endAllBreakoutRooms(addHeaderToMessage(jsonMessage,
				EndAllBreakoutRoomsRequest.NAME));
	}
}
