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
package org.bigbluebutton.messages;

import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.messages.payload.GetBreakoutRoomsListPayload;

import com.google.gson.Gson;

public class GetBreakoutRoomsList implements IBigBlueButtonMessage {
	public final static String NAME = "GetBreakoutRoomsList";

	public final Header header;
	public final GetBreakoutRoomsListPayload payload;

	public GetBreakoutRoomsList(GetBreakoutRoomsListPayload payload) {
		header = new Header(NAME);
		this.payload = payload;
	}

	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}
}
