/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.app.screenshare.red5;

import java.util.Map;

public class BroadcastClientMessage implements ClientMessage {

	private String meetingID;
	private Map<String, Object> message;
	private String messageName;
	
	public BroadcastClientMessage(String meetingID, String messageName, Map<String, Object> message) {
		this.meetingID = meetingID;
		this.message = message;
		this.messageName = messageName;
	}
		
	public String getMeetingID() {
		return meetingID;
	}
	
	public String getMessageName() {
		return messageName;
	}
	
	public Map<String, Object> getMessage() {
		return message;
	}
}
