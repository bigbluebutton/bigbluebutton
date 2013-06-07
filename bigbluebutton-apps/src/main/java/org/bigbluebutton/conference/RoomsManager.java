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
package org.bigbluebutton.conference;

import org.slf4j.Logger;
import org.bigbluebutton.conference.meeting.messaging.MessagePublisher;
import org.bigbluebutton.conference.service.messaging.MessagingService;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.conference.service.poll.PollApplication;
import org.bigbluebutton.conference.service.presentation.ConversionUpdatesMessageListener;
import org.red5.logging.Red5LoggerFactory;
import com.google.gson.Gson;
import net.jcip.annotations.ThreadSafe;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RoomsManager {
	private static Logger log = Red5LoggerFactory.getLogger(RoomsManager.class, "bigbluebutton");
	
	private final Map <String, Room> rooms;

	private MessagePublisher publisher;
	
	public RoomsManager() {
		rooms = new ConcurrentHashMap<String, Room>();		
	}
	
	public void addRoom(Room room) {
		room.addRoomListener(new ParticipantUpdatingRoomListener(room, messagingService)); 	
		
		publisher.meetingStarted(room.getName());
		
		rooms.put(room.getName(), room);
	}
	
	public void removeRoom(String name) {
		log.debug("Remove room " + name);
		Room room = rooms.remove(name);
		if (room != null) {
			room.endAndKickAll();
			publisher.meetingEnded(name);
		}
	}

	public void destroyAllRooms() {
		for (Map.Entry<String, Room> entry : rooms.entrySet()) {
		    Room room = entry.getValue();
		    room.endAndKickAll();
		}
	}
			
	public boolean hasRoom(String name) {
		return rooms.containsKey(name);
	}
	
	public int numberOfRooms() {
		return rooms.size();
	}
	
	/**
	 * Keeping getRoom private so that all access to Room goes through here.
	 */
	//TODO: this method becomes public for ParticipantsApplication, ask if it's right? 
	public Room getRoom(String name) {
		log.debug("Get room " + name);
		return rooms.get(name);
	}
	
	public Map getParticipants(String roomName) {
		Room r = getRoom(roomName);
		if (r != null) {
			return r.getParticipants();
		}
		log.warn("Getting participants from a non-existing room " + roomName);
		return null;
	}
	
	public void addRoomListener(String roomName, IRoomListener listener) {
		Room r = getRoom(roomName);
		if (r != null) {
			r.addRoomListener(listener);
			return;
		}
		log.warn("Adding listener to a non-existing room " + roomName);
	}
	
	public void addParticipant(String roomName, User participant) {
		log.debug("Add participant " + participant.getName());
		Room r = getRoom(roomName);
		if (r != null) {
			r.addParticipant(participant);
			return;
		}
	}
	
	public void removeParticipant(String roomName, String userid) {
		log.debug("Remove participant " + userid + " from " + roomName);
		Room r = getRoom(roomName);
		if (r != null) {
			if (checkPublisher()) {
				//conferenceEventListener.participantsUpdated(r);
				//missing method()?
			}
			r.removeParticipant(userid);

			return;
		}
		log.warn("Removing listener from a non-existing room " + roomName);
	}
	
	public void changeParticipantStatus(String roomName, String userid, String status, Object value) {
		Room r = getRoom(roomName);
		if (r != null) {
			r.changeParticipantStatus(userid, status, value);
			return;
		}		
	}
	
	public ArrayList<String> getCurrentPresenter( String room){
		Room r = getRoom(room);
		if (r != null) {
			return r.getCurrentPresenter();		
		}	
		
		return null;
	}
	
	public void assignPresenter(String room, ArrayList<String> presenter){
		Room r = getRoom(room);
		if (r != null) {
			r.assignPresenter(presenter);
			return;
		}	
	}
	
	public void endMeeting(String meetingID) {
		Room room = getRoom(meetingID); 
		if (room != null) {
			room.endAndKickAll();
		} 		
	}	
	
	public void setPublisher(MessagePublisher publisher) {
		this.publisher = publisher;
	}
}
