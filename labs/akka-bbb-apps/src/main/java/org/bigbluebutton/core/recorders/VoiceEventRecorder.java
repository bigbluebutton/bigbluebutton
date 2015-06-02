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
package org.bigbluebutton.core.recorders;

import java.util.concurrent.TimeUnit;

import org.bigbluebutton.core.recorders.events.ParticipantJoinedVoiceRecordEvent;
import org.bigbluebutton.core.recorders.events.ParticipantLeftVoiceRecordEvent;
import org.bigbluebutton.core.recorders.events.ParticipantLockedVoiceRecordEvent;
import org.bigbluebutton.core.recorders.events.ParticipantMutedVoiceRecordEvent;
import org.bigbluebutton.core.recorders.events.ParticipantTalkingVoiceRecordEvent;
import org.bigbluebutton.core.recorders.events.StartRecordingVoiceRecordEvent;
import org.bigbluebutton.core.recorders.events.VoiceConferenceRecordEvent;
import org.bigbluebutton.core.recorders.events.VoiceStartRecordingRecordEvent;
import org.bigbluebutton.core.recorders.events.VoiceUserJoinedRecordEvent;
import org.bigbluebutton.core.recorders.events.VoiceUserLeftRecordEvent;
import org.bigbluebutton.core.recorders.events.VoiceUserLockedRecordEvent;
import org.bigbluebutton.core.recorders.events.VoiceUserMutedRecordEvent;
import org.bigbluebutton.core.recorders.events.VoiceUserTalkingRecordEvent;
import org.bigbluebutton.core.service.recorder.RecorderApplication;

public class VoiceEventRecorder {

	private RecorderApplication recorder;
	
  private Long genTimestamp() {
  	return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }
  
	public void recordConferenceEvent(VoiceConferenceRecordEvent event, String room) {
		if (event instanceof VoiceUserJoinedRecordEvent) {
			recordParticipantJoinedEvent(event, room);
		} else if (event instanceof VoiceUserLeftRecordEvent) {		
			recordParticipantLeftEvent(event, room);
		} else if (event instanceof VoiceUserMutedRecordEvent) {
			recordParticipantMutedEvent(event, room);
		} else if (event instanceof VoiceUserTalkingRecordEvent) {
			recordParticipantTalkingEvent(event, room);
		} else if (event instanceof VoiceUserLockedRecordEvent) {
			recordParticipantLockedEvent(event, room);
		} else if (event instanceof VoiceStartRecordingRecordEvent) {
			recordStartRecordingEvent(event, room);
		} else {
			System.out.println("Processing UnknownEvent " + event.getClass().getName() + " for room: " + event.getRoom() );
		}		
	}
	
	private void recordStartRecordingEvent(VoiceConferenceRecordEvent event, String room) {
		VoiceStartRecordingRecordEvent sre = (VoiceStartRecordingRecordEvent) event;
		StartRecordingVoiceRecordEvent evt = new StartRecordingVoiceRecordEvent(sre.startRecord());
		evt.setMeetingId(room);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setRecordingTimestamp(sre.getTimestamp());
		evt.setFilename(sre.getRecordingFilename());
		System.out.println("*** Recording voice " + sre.startRecord() + " timestamp: " + evt.toMap().get("recordingTimestamp") + " file: " + evt.toMap().get("filename"));
		recorder.record(room, evt);
	}
	
	private void recordParticipantJoinedEvent(VoiceConferenceRecordEvent event, String room) {
		VoiceUserJoinedRecordEvent pje = (VoiceUserJoinedRecordEvent) event;

		ParticipantJoinedVoiceRecordEvent evt = new ParticipantJoinedVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(pje.getUserId().toString());
		evt.setCallerName(pje.getCallerIdName());
		evt.setCallerNumber(pje.getCallerIdName());
		evt.setMuted(pje.getMuted());
		evt.setTalking(pje.getSpeaking());
		
		recorder.record(room, evt);
	}

	private void recordParticipantLeftEvent(VoiceConferenceRecordEvent event, String room) {
		
		ParticipantLeftVoiceRecordEvent evt = new ParticipantLeftVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		
		
		evt.setParticipant(((VoiceUserLeftRecordEvent)event).getUserId().toString());
		
		recorder.record(room, evt);
	}
	
	private void recordParticipantMutedEvent(VoiceConferenceRecordEvent event, String room) {
		VoiceUserMutedRecordEvent pme = (VoiceUserMutedRecordEvent) event;
		
		ParticipantMutedVoiceRecordEvent evt = new ParticipantMutedVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(((VoiceUserMutedRecordEvent)event).getUserId().toString());
		evt.setMuted(pme.isMuted());
		
		recorder.record(room, evt);
	}
	
	private void recordParticipantTalkingEvent(VoiceConferenceRecordEvent event, String room) {
		VoiceUserTalkingRecordEvent pte = (VoiceUserTalkingRecordEvent) event;
	
		ParticipantTalkingVoiceRecordEvent evt = new ParticipantTalkingVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(((VoiceUserTalkingRecordEvent)event).getUserId().toString());
		evt.setTalking(pte.isTalking());
		
		recorder.record(room, evt);
	}
	
	private void recordParticipantLockedEvent(VoiceConferenceRecordEvent event, String room) {
		VoiceUserLockedRecordEvent ple = (VoiceUserLockedRecordEvent) event;

		ParticipantLockedVoiceRecordEvent evt = new ParticipantLockedVoiceRecordEvent();
		evt.setMeetingId(room);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(((VoiceUserLockedRecordEvent)event).getUserId().toString());
		evt.setLocked(ple.isLocked());
		
		recorder.record(room, evt);
	}
	
	public void setRecorderApplication(RecorderApplication recorder) {
		this.recorder = recorder;
	}
}
