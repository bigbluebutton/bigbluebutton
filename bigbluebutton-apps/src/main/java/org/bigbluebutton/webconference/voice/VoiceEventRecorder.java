package org.bigbluebutton.webconference.voice;

import java.util.HashMap;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.webconference.voice.events.ConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLockedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class VoiceEventRecorder {
	private static final Logger log = Red5LoggerFactory.getLogger(VoiceEventRecorder.class, "bigbluebutton");
	
	private RecorderApplication recorder;
	
	public void recordConferenceEvent(ConferenceEvent event, String room) {
		if (event instanceof ParticipantJoinedEvent) {
			recordParticipantJoinedEvent(event, room);
		} else if (event instanceof ParticipantLeftEvent) {		
			recordParticipantLeftEvent(event, room);
		} else if (event instanceof ParticipantMutedEvent) {
			recordParticipantMutedEvent(event, room);
		} else if (event instanceof ParticipantTalkingEvent) {
			recordParticipantTalkingEvent(event, room);
		} else if (event instanceof ParticipantLockedEvent) {
			recordParticipantLockedEvent(event, room);
		} else {
			log.debug("Processing UnknownEvent " + event.getClass().getName() + " for room: " + event.getRoom() );
		}		
	}
	
	private void recordParticipantJoinedEvent(ConferenceEvent event, String room) {
		ParticipantJoinedEvent pje = (ParticipantJoinedEvent) event;
		
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("meeting", room);
		map.put("bridge", event.getRoom());
		map.put("module", "voice");
		map.put("event", "userJoin");
		map.put("participant", pje.getParticipantId().toString());
		map.put("callername", pje.getCallerIdName());
		map.put("callernumber", pje.getCallerIdName());
		map.put("muted", pje.getMuted().toString());
		map.put("talking", pje.getSpeaking().toString());
		map.put("locked", pje.isLocked().toString());	
		
		recorder.record(room, map);
	}

	private void recordParticipantLeftEvent(ConferenceEvent event, String room) {
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("meeting", room);
		map.put("bridge", event.getRoom());
		map.put("module", "voice");
		map.put("event", "userLeft");
		map.put("participant", event.getParticipantId().toString());
			
		recorder.record(room, map);
	}
	
	private void recordParticipantMutedEvent(ConferenceEvent event, String room) {
		ParticipantMutedEvent pme = (ParticipantMutedEvent) event;
		
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("meeting", room);
		map.put("bridge", event.getRoom());
		map.put("module", "voice");
		map.put("event", "userMuted");
		map.put("participant", event.getParticipantId().toString());
		map.put("muted", Boolean.toString(pme.isMuted()));		
		
		recorder.record(room, map);
	}
	
	private void recordParticipantTalkingEvent(ConferenceEvent event, String room) {
		ParticipantTalkingEvent pte = (ParticipantTalkingEvent) event;
	
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("meeting", room);
		map.put("bridge", event.getRoom());
		map.put("module", "voice");
		map.put("event", "userTalking");
		map.put("participant", event.getParticipantId().toString());
		map.put("talking", Boolean.toString(pte.isTalking()));
		
		recorder.record(room, map);
	}
	
	private void recordParticipantLockedEvent(ConferenceEvent event, String room) {
		ParticipantLockedEvent ple = (ParticipantLockedEvent) event;

		HashMap<String,String> map = new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("meeting", room);
		map.put("bridge", event.getRoom());
		map.put("module", "voice");
		map.put("event", "userLocked");
		map.put("participant", event.getParticipantId().toString());
		map.put("locked", Boolean.toString(ple.isLocked()));
		
		recorder.record(room, map);
	}
	
	public void setRecorderApplication(RecorderApplication recorder) {
		this.recorder = recorder;
	}
}
