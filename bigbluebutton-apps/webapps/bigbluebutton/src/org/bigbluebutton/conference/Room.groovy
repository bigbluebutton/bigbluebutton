
package org.bigbluebutton.conference

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import net.jcip.annotations.ThreadSafeimport java.util.concurrent.ConcurrentHashMapimport java.util.concurrent.CopyOnWriteArrayListimport java.util.Collectionsimport java.util.Iterator
/**
 * Contains information about a Room and it's Participants. 
 * Encapsulates Participants and RoomListeners.
 */
@ThreadSafe
public class Room {
	private static Logger log = Red5LoggerFactory.getLogger(Room.class, "bigbluebutton")
	
	private final String name
	private final Map <Long, Participant> participants	
	private final Map <Long, Participant> unmodifiableMap
	private final Map<String, IRoomListener> listeners

	public Room(String name) {
		this.name = name
		participants = new ConcurrentHashMap<Long, Participant>()
		unmodifiableMap = Collections.unmodifiableMap(participants)
		listeners   = new ConcurrentHashMap<String, IRoomListener>()
	}
	
	public String getName() {
		return name
	}
	
	public void addRoomListener(IRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener")
			listeners.put(listener.getName(), listener)			
		}
	}
	
	public void removeRoomListener(IRoomListener listener) {
		log.debug("removing room listener")
		listeners.remove(listener)		
	}
	
	public void addParticipant(Participant participant) {
//		synchronized (this) {
			log.debug("adding participant ${participant.userid}")
			participants.put(participant.userid, participant)
//			unmodifiableMap = Collections.unmodifiableMap(participants)
//		}
		log.debug("addparticipant - informing roomlisteners ${listeners.size()}")
		for (Iterator it = listeners.values().iterator(); it.hasNext();) {
		//for (IRoomListener listener : listeners) {
			log.debug("calling participantJoined on listener")
			IRoomListener listener = (IRoomListener) it.next()
			log.debug("calling participantJoined on listener ${listener.getName()}")
			listener.participantJoined(participant)
		}
	}
	
	public void removeParticipant(Long userid) {
		def present = false
		synchronized (this) {
			present = participants.containsKey(userid)
			if (present) {
				log.debug("removing participant")
				participants.remove(userid)
			}
		}
		if (present) {
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				log.debug("calling participantLeft on listener")
				IRoomListener listener = (IRoomListener) it.next()
				log.debug("calling participantLeft on listener ${listener.getName()}")
				listener.participantLeft(userid)
			}
		}
	}
	
	public void changeParticipantStatus(Long userid, String status, Object value) {
		def present = false
		synchronized (this) {
			present = participants.containsKey(userid)
			if (present) {
				log.debug("change participant status")
				Participant p = participants.get(userid)
				p.setStatus(status, value)
				unmodifiableMap = Collections.unmodifiableMap(participants)
			}
		}
		if (present) {
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				log.debug("calling participantStatusChange on listener")
				IRoomListener listener = (IRoomListener) it.next()
				log.debug("calling participantStatusChange on listener ${listener.getName()}")
				listener.participantStatusChange(userid, status, value)
			}
		}		
	}
	
	public Map getParticipants() {
		return unmodifiableMap
	}	
	
	public int getNumberOfParticipants() {
		log.debug("Returning number of participants: " + participants.size())
		return participants.size()
	}
	
}
