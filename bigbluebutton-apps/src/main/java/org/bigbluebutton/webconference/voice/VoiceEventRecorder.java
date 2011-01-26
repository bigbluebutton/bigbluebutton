package org.bigbluebutton.webconference.voice;

import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.webconference.voice.events.ConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLockedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.bigbluebutton.webconference.voice.events.StartRecordingEvent;
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
		} else if (event instanceof StartRecordingEvent) {
			recordStartRecordingEvent(event, room);
		} else {
			log.debug("Processing UnknownEvent " + event.getClass().getName() + " for room: " + event.getRoom() );
		}		
	}
	
	private void recordStartRecordingEvent(ConferenceEvent event, String room) {
		StartRecordingEvent sre = (StartRecordingEvent) event;
		StartRecordingVoiceRecordEvent evt = new StartRecordingVoiceRecordEvent(sre.startRecord());
		evt.setMeetingId(room);
		evt.setTimestamp(System.currentTimeMillis());
		evt.setBridge(event.getRoom());
		evt.setRecordingTimestamp(sre.getTimestamp());
		evt.setFilename(sre.getRecordingFilename());
		System.out.println("*** Recording voice " + sre.startRecord() + " timestamp: " + evt.toMap().get("recordingTimestamp") + " file: " + evt.toMap().get("filename"));
		recorder.record(room, evt);
	}
	
	private void recordParticipantJoinedEvent(ConferenceEvent event, String room) {
		ParticipantJoinedEvent pje = (ParticipantJoinedEvent) event;

		ParticipantJoinedVoiceRecordEvent evt = new ParticipantJoinedVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(System.currentTimeMillis());
		evt.setBridge(event.getRoom());
		evt.setParticipant(pje.getParticipantId().toString());
		evt.setCallerName(pje.getCallerIdName());
		evt.setCallerNumber(pje.getCallerIdName());
		evt.setMuted(pje.getMuted());
		evt.setTalking(pje.getSpeaking());
		evt.setLocked(pje.isLocked());
		
		recorder.record(room, evt);
	}

	private void recordParticipantLeftEvent(ConferenceEvent event, String room) {
		ParticipantLeftVoiceRecordEvent evt = new ParticipantLeftVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(System.currentTimeMillis());
		evt.setBridge(event.getRoom());
		evt.setParticipant(event.getParticipantId().toString());
		
		recorder.record(room, evt);
	}
	
	private void recordParticipantMutedEvent(ConferenceEvent event, String room) {
		ParticipantMutedEvent pme = (ParticipantMutedEvent) event;
		
		ParticipantMutedVoiceRecordEvent evt = new ParticipantMutedVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(System.currentTimeMillis());
		evt.setBridge(event.getRoom());
		evt.setParticipant(event.getParticipantId().toString());
		evt.setMuted(pme.isMuted());
		
		recorder.record(room, evt);
	}
	
	private void recordParticipantTalkingEvent(ConferenceEvent event, String room) {
		ParticipantTalkingEvent pte = (ParticipantTalkingEvent) event;
	
		ParticipantTalkingVoiceRecordEvent evt = new ParticipantTalkingVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(System.currentTimeMillis());
		evt.setBridge(event.getRoom());
		evt.setParticipant(event.getParticipantId().toString());
		evt.setTalking(pte.isTalking());
		
		recorder.record(room, evt);
	}
	
	private void recordParticipantLockedEvent(ConferenceEvent event, String room) {
		ParticipantLockedEvent ple = (ParticipantLockedEvent) event;

		ParticipantLockedVoiceRecordEvent evt = new ParticipantLockedVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(System.currentTimeMillis());
		evt.setBridge(event.getRoom());
		evt.setParticipant(event.getParticipantId().toString());
		evt.setLocked(ple.isLocked());
		
		recorder.record(room, evt);
	}
	
	public void setRecorderApplication(RecorderApplication recorder) {
		this.recorder = recorder;
	}
}
