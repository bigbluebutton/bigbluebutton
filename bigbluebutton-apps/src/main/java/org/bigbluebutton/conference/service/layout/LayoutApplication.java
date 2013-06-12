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

import org.bigbluebutton.conference.service.layout.red5.LayoutClientSender;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class LayoutApplication {
	private static Logger log = Red5LoggerFactory.getLogger( LayoutApplication.class, "bigbluebutton" );	
		
	private final Map <String, LayoutRoom> rooms = new ConcurrentHashMap<String, LayoutRoom>();

	private LayoutClientSender sender;
	
	public void setLayoutClientSender(LayoutClientSender sender) {
		this.sender = sender;
	}
	
	public boolean createRoom(String meetingID) {
		LayoutRoom room = new LayoutRoom(meetingID);
		rooms.put(room.getMeetingID(), room);
		
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
			sender.updateLayout(r.getMeetingID(), r.isLocked(), r.getSetByUserID(), r.getCurrentLayout());
		} 
	}

	public void unlockLayout(String meetingID) {
		LayoutRoom r = getRoom(meetingID);
		if (r != null) {
			r.unlockLayout();
			sender.updateLayout(r.getMeetingID(), r.isLocked(), r.getSetByUserID(), r.getCurrentLayout());
		} 
	}

	public void getCurrentLayout(String meetingID, String requesterID) {
		LayoutRoom r = getRoom(meetingID);
		if (r != null) {
			sender.sendGetCurrentLayoutResponse(r.getMeetingID(), requesterID, r.isLocked(), r.getSetByUserID(), r.getCurrentLayout());
		}
	}
}
