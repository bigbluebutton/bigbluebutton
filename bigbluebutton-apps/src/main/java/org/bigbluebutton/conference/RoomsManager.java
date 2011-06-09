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
package org.bigbluebutton.conference;

import org.slf4j.Logger;
import org.bigbluebutton.conference.service.messaging.RedisPublisher;
import org.bigbluebutton.conference.service.recorder.RedisDispatcher;
import org.red5.logging.Red5LoggerFactory;
import net.jcip.annotations.ThreadSafe;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * This encapsulates access to Room and Participant. This class must be threadsafe.
 */
@ThreadSafe
public class RoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger(RoomsManager.class, "bigbluebutton");
	
	private final Map <String, Room> rooms;

	//replaced with redis publisher
	//private IConferenceEventListener conferenceEventListener;

	RedisPublisher publisher;
	
	public RoomsManager() {
		rooms = new ConcurrentHashMap<String, Room>();
		
	}
	
	public void addRoom(Room room) {
		log.debug("Adding room {}", room.getName());
		room.addRoomListener(new ParticipantUpdatingRoomListener(room,publisher)); 	
		
		if (checkPublisher()) {
			//conferenceEventListener.started(room);
			//redis pubsub test
			publisher.publish("bigbluebutton:meeting:state", room.getName()+":started");
			
			log.debug("Notified event listener of conference start");
		}
		rooms.put(room.getName(), room);
	}
	
	public void removeRoom(String name) {
		log.debug("Remove room {}", name);
		Room room = rooms.remove(name);
		if (checkPublisher() && room != null) {
			room.endAndKickAll();
			//conferenceEventListener.ended(room);
			
			//redis pubsub test
			publisher.publish("bigbluebutton:meeting:state",room.getName()+":ended");
			
			log.debug("Notified event listener of conference end");
		}
	}

	public void destroyAllRooms() {
		for (Map.Entry<String,Room> entry : rooms.entrySet()) {
		    Room room = entry.getValue();
		    room.endAndKickAll();
		}
	}
	
	private boolean checkPublisher() {
		return publisher != null;
	}

		
	public boolean hasRoom(String name) {
		return rooms.containsKey(name);
	}
	
	public int numberOfRooms() {
		return rooms.size();
	}
	
	// this method is called by incoming JMS requests (Spring integration)
	public void endMeetingRequest(String roomname) {
		Room room = getRoom(roomname); // must do this because the room coming in is serialized (no transient values are present)
		log.debug("End meeting request for room: {} ", room.getName());
		room.endAndKickAll();
	}
	
	/**
	 * Keeping getRoom private so that all access to Room goes through here.
	 */
	//TODO: this method becomes public for ParticipantsApplication, ask if it's right? 
	public Room getRoom(String name) {
		log.debug("Get room {}", name);
		return rooms.get(name);
	}
	
	public Map getParticipants(String roomName) {
		Room r = getRoom(roomName);
		if (r != null) {
			return r.getParticipants();
		}
		log.warn("Getting participants from a non-existing room {}", roomName);
		return null;
	}
	
	public void addRoomListener(String roomName, IRoomListener listener) {
		Room r = getRoom(roomName);
		if (r != null) {
			r.addRoomListener(listener);
			return;
		}
		log.warn("Adding listener to a non-existing room {}", roomName);
	}
	
	// TODO: this must be broken, right?  where is roomName? (JRT: 9/25/2009)
//	public void removeRoomListener(IRoomListener listener) {
//		
//		Room r = getRoom(roomName);
//		if (r != null) {
//			r.removeRoomListener(listener)
//			return
//		}	
//		log.warn("Removing listener from a non-existing room ${roomName}")
//	}

	public void addParticipant(String roomName, Participant participant) {
		log.debug("Add participant {}", participant.getName());
		Room r = getRoom(roomName);
		if (r != null) {
			if (checkPublisher()) {
				//conferenceEventListener.participantsUpdated(r);
				//missing_method()
				if (r.getNumberOfParticipants() == 0) {
					//conferenceEventListener.started(r);
					log.debug("Notified event listener of conference start");
					//redis pubsub test
					publisher.publish("bigbluebutton:meeting:state", roomName+":started");
					
				}
			}
			r.addParticipant(participant);
			//redis pubsub test
			//publisher.publish("bigbluebutton:conference:join", r.getName()+":"+participant.getUserid()+":"+participant.getName()+":"+participant.getRole());
			
			return;
		}
		log.warn("Adding participant to a non-existing room {}", roomName);
	}
	
	public void removeParticipant(String roomName, Long userid) {
		log.debug("Remove participant {} from {}", userid, roomName);
		Room r = getRoom(roomName);
		if (r != null) {
			if (checkPublisher()) {
				//conferenceEventListener.participantsUpdated(r);
				//missing method()?
			}
			r.removeParticipant(userid);

			return;
		}
		log.warn("Removing listener from a non-existing room ${roomName}");
	}
	
	public void changeParticipantStatus(String roomName, Long userid, String status, Object value) {
		log.debug("Change participant status {} - {} [" + value + "]", userid, status);
		Room r = getRoom(roomName);
		if (r != null) {
			r.changeParticipantStatus(userid, status, value);
			return;
		}		
		log.warn("Changing participant status on a non-existing room {}", roomName);
	}

//	public void setConferenceEventListener(IConferenceEventListener conferenceEventListener) {
//		this.conferenceEventListener = conferenceEventListener;
//	}
//
//	public IConferenceEventListener getConferenceEventListener() {
//		return conferenceEventListener;
//	}

	public RedisPublisher getPublisher() {
		return publisher;
	}

	public void setPublisher(RedisPublisher publisher) {
		this.publisher = publisher;
	}
	
	
}
