
package org.bigbluebutton.conference.service.participants


import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import java.util.Mapimport org.bigbluebutton.conference.RoomsManager
import org.bigbluebutton.conference.Roomimport org.bigbluebutton.conference.Participantimport org.bigbluebutton.conference.IRoomListener
public class ParticipantsApplication {

	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsApplication.class, "bigbluebutton" );	
	
	
	private static final String APP = "PARTICIPANTS";
	private RoomsManager roomsManager
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new Room(name))
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
	
	public boolean addRoomListener(String room, IRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener)
			return true
		}
		log.warn("Adding listener to a non-existant room ${room}")
		return false
	}
	
	public void setParticipantStatus(String room, Long userid, String status, Object value) {
		roomsManager.changeParticipantStatus(room, userid, status, value)
	}
	
	public Map getParticipants(String roomName) {
		log.debug("${APP}:getParticipants - ${roomName}")
		if (! roomsManager.hasRoom(roomName)) {
			log.warn("Could not find room ${roomName}")
			return null
		}

		return roomsManager.getParticipants(roomName)
	}
	
	public boolean participantLeft(String roomName, Long userid) {
		log.debug("Participant $userid leaving room $roomName")
		if (roomsManager.hasRoom(roomName)) {
			Room room = roomsManager.getRoom(roomName)
			log.debug("Removing $userid from room $roomName")
			room.removeParticipant(userid)
			return true;
		}

		return false;
	}
	
	public boolean participantJoin(String roomName, Long userid, String username, String role, Map status) {
		log.debug("${APP}:participant joining room ${roomName}")
		if (roomsManager.hasRoom(roomName)) {
			Participant p = new Participant(userid, username, role, status)			
			Room room = roomsManager.getRoom(roomName)
			room.addParticipant(p)
			log.debug("${APP}:participant joined room ${roomName}")
			return true
		}
		log.debug("${APP}:participant failed to join room ${roomName}")
		return false
	}
	
	public void setRoomsManager(RoomsManager r) {
		log.debug("Setting room manager")
		roomsManager = r
	}
}
