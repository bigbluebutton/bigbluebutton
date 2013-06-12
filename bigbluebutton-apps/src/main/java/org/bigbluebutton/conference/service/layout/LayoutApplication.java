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
package org.bigbluebutton.conference.service.layout;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.bigbluebutton.conference.meeting.messaging.OutMessageGateway;
import org.bigbluebutton.conference.service.layout.messaging.messages.GetCurrentLayoutResponseMessage;
import org.bigbluebutton.conference.service.layout.messaging.messages.UpdateLayoutMessage;

public class LayoutApplication {	
	private final Map <String, LayoutRoom> rooms = new ConcurrentHashMap<String, LayoutRoom>();

	private OutMessageGateway outMessageGateway;
	
	public void setOutMessageGateway(OutMessageGateway outMessageGateway) {
		this.outMessageGateway = outMessageGateway;
	}
	
	public boolean createRoom(String meetingID, Boolean recorded) {
		if (!hasRoom(meetingID)) {
			LayoutRoom room = new LayoutRoom(meetingID, recorded);
			rooms.put(room.getMeetingID(), room);			
		}		
		return true;
	}
	
	public boolean destroyRoom(String meetingID) {
		if (hasRoom(meetingID)) {
			removeRoom(meetingID);
		}
		return true;
	}
	
	private void removeRoom(String meetingID) {
		rooms.remove(meetingID);
	}
	
	public boolean hasRoom(String meetingID) {
		return rooms.containsKey(meetingID);
	}
		
	private LayoutRoom getRoom(String meetingID) {
		return rooms.get(meetingID);
	}
	
	public void lockLayout(String meetingID, String userId, String layout) {
		LayoutRoom r = getRoom(meetingID);
		if (r != null) {
			r.lockLayout(userId, layout);
			UpdateLayoutMessage msg = new UpdateLayoutMessage(r.getMeetingID(), r.isRecorded(), r.isLocked(), r.getSetByUserID(), r.getCurrentLayout());
			outMessageGateway.send(msg);
		} 
	}

	public void unlockLayout(String meetingID) {
		LayoutRoom r = getRoom(meetingID);
		if (r != null) {
			r.unlockLayout();
			UpdateLayoutMessage msg = new UpdateLayoutMessage(r.getMeetingID(), r.isRecorded(), r.isLocked(), r.getSetByUserID(), r.getCurrentLayout());
			outMessageGateway.send(msg);			
		} 
	}

	public void getCurrentLayout(String meetingID, String requesterID) {
		LayoutRoom r = getRoom(meetingID);
		if (r != null) {
			GetCurrentLayoutResponseMessage msg = new GetCurrentLayoutResponseMessage(meetingID, r.isRecorded(), requesterID, r.isLocked(), r.getSetByUserID(), r.getCurrentLayout());
			outMessageGateway.send(msg);
		}
	}
}
