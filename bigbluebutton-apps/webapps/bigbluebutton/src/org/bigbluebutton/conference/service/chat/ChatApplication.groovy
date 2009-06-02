
package org.bigbluebutton.conference.service.chat


import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import java.util.Mapimport org.bigbluebutton.conference.service.chat.ChatRoomsManager
import org.bigbluebutton.conference.service.chat.ChatRoomimport org.bigbluebutton.conference.Participantimport org.bigbluebutton.conference.service.chat.IChatRoomListener
public class ChatApplication {

	private static Logger log = Red5LoggerFactory.getLogger( ChatApplication.class, "bigbluebutton" );	
		
	private static final String APP = "CHAT";
	private ChatRoomsManager roomsManager
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new ChatRoom(name))
		return true
	}
	
	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name)) {
			roomsManager.removeRoom(name)
		}
		return true
	}
	
	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name)
	}
	
	public boolean addRoomListener(String room, IChatRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener)
			return true
		}
		log.warn("Adding listener to a non-existant room ${room}")
		return false
	}
	
	public String getChatMessages(String room) {
		return roomsManager.getChatMessages(room)
	}
	
	public void sendMessage(String room, String message) {
		roomsManager.sendMessage(room, message)
	}
	
	public void setRoomsManager(ChatRoomsManager r) {
		log.debug("Setting room manager")
		roomsManager = r
	}
}
