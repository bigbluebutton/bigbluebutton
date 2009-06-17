
package org.bigbluebutton.conference.service.whiteboard


import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import java.util.Mapimport org.bigbluebutton.conference.service.whiteboard.WhiteboardRoomsManager
import org.bigbluebutton.conference.service.whiteboard.WhiteboardRoomimport org.bigbluebutton.conference.Participantimport org.bigbluebutton.conference.service.whiteboard.IWhiteboardRoomListener
public class WhiteboardApplication {

	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardApplication.class, "bigbluebutton" );	
		
	private static final String APP = "WHITEBOARD";
	private WhiteboardRoomsManager roomsManager
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new WhiteboardRoom(name))
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
	
	public boolean addRoomListener(String room, IWhiteboardRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener)
			return true
		}
		log.warn("Adding listener to a non-existant room ${room}")
		return false
	}
	
	public String getWhiteboardMessages(String room) {
		return roomsManager.getWhiteboardMessages(room)
	}

	public void setRoomsManager(WhiteboardRoomsManager r) {
		log.debug("Setting room manager")
		roomsManager = r
	}
	
	public void sendMessage(String room, String message) 
	{
		log.debug("WhiteboardApplication.groovy::sendMessage ... message=" + message)
	
		roomsManager.sendMessage(room, message)
	}
	
}
