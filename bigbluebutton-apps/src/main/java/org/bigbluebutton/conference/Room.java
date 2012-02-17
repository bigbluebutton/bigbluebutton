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
import org.red5.logging.Red5LoggerFactory;
import net.jcip.annotations.ThreadSafe;
import java.io.Serializable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
/**
 * Contains information about a Room and it's Participants. 
 * Encapsulates Participants and RoomListeners.
 */
@ThreadSafe
public class Room implements Serializable {
	private static Logger log = Red5LoggerFactory.getLogger( Room.class, "bigbluebutton" );	
	ArrayList<String> currentPresenter = null;
	private String name;
	private Map <Long, Participant> participants;

	// these should stay transient so they're not serialized in ActiveMQ messages:	
	//private transient Map <Long, Participant> unmodifiableMap;
	private transient final Map<String, IRoomListener> listeners;

	public Room(String name) {
		this.name = name;
		participants = new ConcurrentHashMap<Long, Participant>();
		//unmodifiableMap = Collections.unmodifiableMap(participants);
		listeners   = new ConcurrentHashMap<String, IRoomListener>();
	}

	public String getName() {
		return name;
	}

	public void addRoomListener(IRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener");
			listeners.put(listener.getName(), listener);			
		}
	}

	public void removeRoomListener(IRoomListener listener) {
		log.debug("removing room listener");
		listeners.remove(listener);		
	}

	public void addParticipant(Participant participant) {
		synchronized (this) {
			log.debug("adding participant " + participant.getInternalUserID());
			participants.put(participant.getInternalUserID(), participant);
//			unmodifiableMap = Collections.unmodifiableMap(participants)
		}
		log.debug("Informing roomlisteners " + listeners.size());
		for (Iterator it = listeners.values().iterator(); it.hasNext();) {
			IRoomListener listener = (IRoomListener) it.next();
			log.debug("calling participantJoined on listener " + listener.getName());
			listener.participantJoined(participant);
		}
	}

	public void removeParticipant(Long userid) {
		boolean present = false;
		Participant p = null;
		synchronized (this) {
			present = participants.containsKey(userid);
			if (present) {
				log.debug("removing participant");
				p = participants.remove(userid);
			}
		}
		if (present) {
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				IRoomListener listener = (IRoomListener) it.next();
				log.debug("calling participantLeft on listener " + listener.getName());
				listener.participantLeft(p);
			}
		}
	}

	public void changeParticipantStatus(Long userid, String status, Object value) {
		boolean present = false;
		Participant p = null;
		synchronized (this) {
			present = participants.containsKey(userid);
			if (present) {
				log.debug("change participant status");
				p = participants.get(userid);
				p.setStatus(status, value);
				//participants.put(userid, p);
				//unmodifiableMap = Collections.unmodifiableMap(participants);
			}
		}
		if (present) {
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				IRoomListener listener = (IRoomListener) it.next();
				log.debug("calling participantStatusChange on listener " + listener.getName());
				listener.participantStatusChange(p, status, value);
			}
		}		
	}

	public void endAndKickAll() {
		for (Iterator it = listeners.values().iterator(); it.hasNext();) {
			IRoomListener listener = (IRoomListener) it.next();
			log.debug("calling endAndKickAll on listener " + listener.getName());
			listener.endAndKickAll();
		}
	}

	public Map getParticipants() {
		return participants;//unmodifiableMap;
	}	

	public Collection<Participant> getParticipantCollection() {
		return participants.values();
	}

	public int getNumberOfParticipants() {
		log.debug("Returning number of participants: " + participants.size());
		return participants.size();
	}

	public int getNumberOfModerators() {
		int sum = 0;
		for (Iterator<Participant> it = participants.values().iterator(); it.hasNext(); ) {
			Participant part = it.next();
			if (part.isModerator()) {
				sum++;
			}
		} 
		log.debug("Returning number of moderators: " + sum);
		return sum;
	}

	public ArrayList<String> getCurrentPresenter() {
		return currentPresenter;
	}
	
	public void assignPresenter(ArrayList<String> presenter){
		currentPresenter = presenter;
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			IRoomListener listener = (IRoomListener) iter.next();
			log.debug("calling sendUpdateMessage on listener " + listener.getName());
			listener.assignPresenter(presenter);
		}	
	}
}