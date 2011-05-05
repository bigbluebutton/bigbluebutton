package org.bigbluebutton.conference.service.participants;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ParticipantRoom {
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantRoom.class , "bigbluebutton" );
	
	private String name;
	private Map<String, IParticipantRoomListener> listeners;
	private Map<Long,Participant> participants;
	
	
	
	public ParticipantRoom(String name) {
		this.name = name;
		listeners = new HashMap<String, IParticipantRoomListener>();
		participants = new HashMap<Long,Participant>();
	}
	
	public String getName() {
		return name;
	}
	
	public void addRoomListener(IParticipantRoomListener listener){
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener");
			listeners.put(listener.getName(), listener);			
		}
	}
	
	public void removeRoomListener(IParticipantRoomListener listener){
		log.debug("removing room listener");
		listeners.remove(listener);
	}
	
	
	public void addParticipant(Participant participant) {
		log.debug("adding participant ${participant.userid}");
		participants.put(participant.getUserid(), participant);
		
		log.debug("addparticipant - informing roomlisteners ${listeners.size()}");
		for (Iterator it = listeners.values().iterator(); it.hasNext();) {
			log.debug("calling participantJoined on listener");
			IParticipantRoomListener listener = (IParticipantRoomListener) it.next();
			log.debug("calling participantJoined on listener ${listener.getName()}");
			listener.participantJoined(participant);
		}
	}

	public void removeParticipant(Long userid) {
		if (participants.containsKey(userid)) {
			log.debug("removing participant");
			Participant p=participants.remove(userid);
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				log.debug("calling participantLeft on listener");
				IParticipantRoomListener listener = (IParticipantRoomListener) it.next();
				log.debug("calling participantLeft on listener ${listener.getName()}");
				listener.participantLeft(p);
			}
		}
	}

	public void changeParticipantStatus(Long userid, String status, String newstatus) {
		if (participants.containsKey(userid)) {
			log.debug("change participant status");
			Participant p = participants.get(userid);
			p.setStatus(newstatus);
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				log.debug("calling participantStatusChange on listener");
				IParticipantRoomListener listener = (IParticipantRoomListener) it.next();
				log.debug("calling participantStatusChange on listener ${listener.getName()}");
				listener.participantStatusChange(p);
			}
		}	
	}
	
	public void endAndKickAll() {
		for (Iterator it = listeners.values().iterator(); it.hasNext();) {
			IParticipantRoomListener listener = (IParticipantRoomListener) it.next();
			log.debug("calling endAndKickAll on listener ${listener.getName()}");
			listener.endAndKickAll();
		}
	}
	
}
