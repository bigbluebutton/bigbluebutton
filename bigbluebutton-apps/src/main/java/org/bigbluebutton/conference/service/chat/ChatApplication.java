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
import org.bigbluebutton.conference.service.chat.ChatRoom;
import org.bigbluebutton.conference.service.chat.IChatRoomListener;

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
	
	public boolean addRoomListener(String room, IChatRoomListener listener)
	{
		if (roomsManager.hasRoom(room))
		{
			log.debug("Adding listener to a room {}", room);
			roomsManager.addRoomListener(room, listener);
			return true;
		}
		log.warn("Adding listener to a non-existant room {}", room);
		return false;
	}
	
	public List<String> getChatMessages(String room) {
		return roomsManager.getChatMessages(room);
	}
	
	public void sendMessage(String room, String message) {
		roomsManager.sendMessage(room, message);
	}
    
    /*****************************************************************************
    ;  setRecordStatus
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to set the status whether the chat is recording or not
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT 
    ;   room : room name
    ;   isRecording : status whether user is recording chat message or not 
    ;   
    ; 
    ; IMPLEMENTATION
    ;   set the recording status to room
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 12-27-2010                        
    ******************************************************************************/
    public void setRecordStatus(String room, String userid, String username, boolean isRecording){
        log.debug("Setting Record Status {}",userid);
        roomsManager.setRecordStatus(room,userid,username,isRecording) ;
    }
    /**
    * END FUNCTION 'setRecordStatus'
    **/
    
	public void setRoomsManager(ChatRoomsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}
}
