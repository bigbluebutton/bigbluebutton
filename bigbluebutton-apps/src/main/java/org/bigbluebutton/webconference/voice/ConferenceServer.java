package org.bigbluebutton.webconference.voice;

import java.util.ArrayList;

import org.bigbluebutton.webconference.voice.events.ConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.bigbluebutton.webconference.voice.internal.RoomManager;

public class ConferenceServer implements ConferenceEventListener {

	private RoomManager roomMgr;
	private ConferenceApplication confApp;
	private ConferenceServerListener listener;
	
	public void startup() {
		roomMgr = new RoomManager();
		confApp.startup();
	}
	
	public void shutdown() {
		confApp.shutdown();
		roomMgr = null;
	}
	
	public void createConference(String room) {
		roomMgr.createRoom(room);
		confApp.populateRoom(room);
	}
	
	public void destroyConference(String room) {
		roomMgr.destroyRoom(room);
	}
	
	public void mute(Integer participant, String room, Boolean mute) {
		if (roomMgr.hasParticipant(room, participant))
			muteParticipant(participant, room, mute);
	}
	
	public void mute(String room, Boolean mute) {
		if (roomMgr.hasRoom(room)) {
			ArrayList<Participant> p = getParticipants(room);
			for (Participant o : p) {
				muteParticipant(o.getId(), room, mute);
			}
		}
	}
	
	private void muteParticipant(Integer participant, String room, Boolean mute) {
		confApp.mute(room, participant, mute);
	}
	
	public void eject(Integer participant, String room) {
		if (roomMgr.hasParticipant(room, participant))
			ejectParticipant(room, participant);
	}
	
	public void eject(String room) {
		if (roomMgr.hasRoom(room)) {
			ArrayList<Participant> p = getParticipants(room);
			for (Participant o : p) {
				ejectParticipant(room, o.getId());
			}
		}
	}
	
	private void ejectParticipant(String room, Integer participant) {
		confApp.eject(room, participant);
	}

	public ArrayList<Participant> getParticipants(String room) {
		return roomMgr.getParticipants(room);
	}
	
	public void handleConferenceEvent(ConferenceEvent event) {
		roomMgr.processConferenceEvent(event);
		
		if (event instanceof ParticipantJoinedEvent) {
			ParticipantJoinedEvent pje = (ParticipantJoinedEvent) event;
			listener.joined(pje.getRoom(), pje.getParticipantId(), pje.getCallerIdName(), pje.getMuted(), pje.getSpeaking());
		} else if (event instanceof ParticipantLeftEvent) {		
			listener.left(event.getRoom(), event.getParticipantId());		
		} else if (event instanceof ParticipantMutedEvent) {
			ParticipantMutedEvent pme = (ParticipantMutedEvent) event;
			listener.muted(pme.getRoom(), pme.getParticipantId(), pme.isMuted());
		} else if (event instanceof ParticipantTalkingEvent) {
			ParticipantTalkingEvent pte = (ParticipantTalkingEvent) event;
			listener.talking(pte.getRoom(), pte.getParticipantId(), pte.isTalking());
		}	
		
	}
	
	public void setConferenceServerListener(ConferenceServerListener listener) {
		this.listener = listener;
	}
}
