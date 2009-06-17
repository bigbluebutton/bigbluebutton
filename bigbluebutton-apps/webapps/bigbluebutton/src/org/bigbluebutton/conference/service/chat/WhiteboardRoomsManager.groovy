package org.bigbluebutton.conference.service.whiteboard

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import net.jcip.annotations.ThreadSafe
import java.util.concurrent.ConcurrentHashMap
/**
 * This encapsulates access to WhiteboardRoom and messages. This class must be threadsafe.
 */
@ThreadSafe
public class WhiteboardRoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardRoomsManager.class, "bigbluebutton" );
	
	private final Map <String, WhiteboardRoom> rooms
	
	public WhiteboardRoomsManager() {
		log.debug("In WhiteboardRoomsManager constructor")	
		rooms = new ConcurrentHashMap<String, WhiteboardRoom>()
	}
	
	public void addRoom(WhiteboardRoom room) {
		log.debug("In RoomsManager adding room ${room.name}")
		rooms.put(room.name, room)
	}
	
	public void removeRoom(String name) {
		log.debug("In RoomsManager remove room ${name}")
		rooms.remove(name)
	}
		
	public boolean hasRoom(String name) {
		log.debug("In RoomsManager has Room ${name}")
		return ((HashMap)rooms).containsKey(name)
	}
	
	
	/**
	 * Keeping getRoom private so that all access to WhiteboardRoom goes through here.
	 */
	private WhiteboardRoom getRoom(String name) {
		log.debug("In RoomsManager get room ${name}")
		rooms.get(name)
	}
	
	public String getWhiteboardMessages(String room) {
		WhiteboardRoom r = getRoom(room)
		if (r != null) {
			return r.getWhiteboardMessages()
		}
		log.warn("Getting messages from a non-existing room ${room}")
		return ""
	}
	
	public void sendMessage(String room, String message) {
		WhiteboardRoom r = getRoom(room)
		if (r != null) {
			r.sendMessage(message)
		}
		log.warn("Sending message to a non-existing room ${room}")
	}
	
	public void addRoomListener(String roomName, IWhiteboardRoomListener listener) {
		WhiteboardRoom r = getRoom(roomName)
		if (r != null) {
			r.addRoomListener(listener)
			return
		}
		log.warn("Adding listener to a non-existing room ${roomName}")
	}
	
	public void removeRoomListener(IWhiteboardRoomListener listener) {
		WhiteboardRoom r = getRoom(roomName)
		if (r != null) {
			r.removeRoomListener(listener)
			return
		}	
		log.warn("Removing listener from a non-existing room ${roomName}")
	}
	
}
