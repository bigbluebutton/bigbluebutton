/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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

package org.bigbluebutton.conference.service.chat;

import java.util.List;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.bigbluebutton.conference.service.chat.ChatRoomsManager;
import org.bigbluebutton.conference.service.chat.ChatRoom;import org.bigbluebutton.conference.service.chat.IChatRoomListener;

public class ChatApplication {

	private static Logger log = Red5LoggerFactory.getLogger( ChatApplication.class, "bigbluebutton" );	
		
	private static final String APP = "CHAT";
	private ChatRoomsManager roomsManager;
	public ChatHandler handler;
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new ChatRoom(name));
		return true;
	}
	
	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name)) {
			roomsManager.removeRoom(name);
		}
		return true;
	}
	
	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name);
	}
	
	public boolean addRoomListener(String room, IChatRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener);
			return true;
		}
		log.warn("Adding listener to a non-existant room " + room);
		return false;
	}
	
	public List<ChatObject> getChatMessages(String room) {
		return roomsManager.getChatMessages(room);
	}
	
	public void sendMessage(String room, ChatObject chatobj) {
		roomsManager.sendMessage(room, chatobj);
	}
	
	public void setRoomsManager(ChatRoomsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}
}
