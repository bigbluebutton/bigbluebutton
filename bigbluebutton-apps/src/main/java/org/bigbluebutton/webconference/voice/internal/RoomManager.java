package org.bigbluebutton.webconference.voice.internal;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

import org.bigbluebutton.webconference.voice.Participant;
import org.bigbluebutton.webconference.voice.events.ConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import net.jcip.annotations.ThreadSafe;

@ThreadSafe
public class RoomManager {
	private static final Logger log = Red5LoggerFactory.getLogger(RoomManager.class, "bigbluebutton");
	
	private final ConcurrentHashMap<String, RoomImp> rooms;
	
	public RoomManager() {
		rooms = new ConcurrentHashMap<String, RoomImp>();
	}
	
	public void createRoom(String name) {
		log.debug("Creating room: " + name);
		RoomImp r = new RoomImp(name);
		rooms.putIfAbsent(name, r);
	}
	
	public boolean hasRoom(String name) {
		return rooms.containsKey(name);
	}
	
	public boolean hasParticipant(String room, Integer participant) {
		RoomImp rm = rooms.get(room);
		if (rm == null) return false;
		return rm.hasParticipant(participant);
	}
	
	public void destroyRoom(String name) {
		log.debug("Destorying room: + name");
		RoomImp r = rooms.remove(name);
		if (r != null) r = null;
	}
	
	public ArrayList<Participant> getParticipants(String room) {
		log.debug("Getting participants for room: " + room);
		RoomImp rm = rooms.get(room);		
		if (rm == null) {
			log.info("Getting participants for non-existing room: " + room);
		}
		return rm.getParticipants();
	}
	
	public void processConferenceEvent(ConferenceEvent event) {
		log.debug("Processing event for room: " + event.getRoom());
		RoomImp rm = rooms.get(event.getRoom());
		if (rm == null) {
			log.info("Processing event for non-existing room: " + event.getRoom());
			return;
		}
		
		if (event instanceof ParticipantJoinedEvent) {
			ParticipantJoinedEvent pje = (ParticipantJoinedEvent) event;
			ParticipantImp p = new ParticipantImp(pje.getParticipantId(), pje.getCallerIdName());
			rm.add(p);
		} else if (event instanceof ParticipantLeftEvent) {		
			rm.remove(event.getParticipantId());		
		} else if (event instanceof ParticipantMutedEvent) {
			ParticipantMutedEvent pme = (ParticipantMutedEvent) event;
			ParticipantImp p = (ParticipantImp) rm.getParticipant(event.getParticipantId());
			if (p != null) p.setMuted(pme.isMuted());
		} else if (event instanceof ParticipantTalkingEvent) {
			ParticipantTalkingEvent pte = (ParticipantTalkingEvent) event;
			ParticipantImp p = (ParticipantImp) rm.getParticipant(event.getParticipantId());
			if (p != null) p.setMuted(pte.isTalking());
		}	
	}
}
