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

	private final RecorderApplication recorder;
	
	public VoiceEventRecorder(RecorderApplication recorder) {
		this.recorder = recorder;
	}
	
	private Long genTimestamp() {
		return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
	}
  
	public void recordConferenceEvent(VoiceConferenceRecordEvent event, String meetingId) {
		if (event instanceof VoiceUserJoinedRecordEvent) {
			recordUserJoinedVoiceConfEvent(event, meetingId);
		} else if (event instanceof VoiceUserLeftRecordEvent) {		
			recordUserLeftVoiceConfEvent(event, meetingId);
		} else if (event instanceof VoiceUserMutedRecordEvent) {
			recordUserMutedInVoiceConfEvent(event, meetingId);
		} else if (event instanceof VoiceUserTalkingRecordEvent) {
			recordUserTalkingInVoiceConfEvent(event, meetingId);
		} else if (event instanceof VoiceUserLockedRecordEvent) {
			recordUserLockedInVoiceConfEvent(event, meetingId);
		} else if (event instanceof VoiceStartRecordingRecordEvent) {
			recordVoiceConfRecordingStartedEvent(event, meetingId);
		} else {
			System.out.println("Processing UnknownEvent " + event.getClass().getName() + " for room: " + event.getRoom() );
		}		
	}
	
	private void recordVoiceConfRecordingStartedEvent(VoiceConferenceRecordEvent event, String meetingId) {
		VoiceStartRecordingRecordEvent sre = (VoiceStartRecordingRecordEvent) event;
		StartRecordingVoiceRecordEvent evt = new StartRecordingVoiceRecordEvent(sre.startRecord());
		evt.setMeetingId(meetingId);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setRecordingTimestamp(sre.getTimestamp());
		evt.setFilename(sre.getRecordingFilename());
		recorder.record(meetingId, evt);
	}
	
	private void recordUserJoinedVoiceConfEvent(VoiceConferenceRecordEvent event, String meetingId) {
		VoiceUserJoinedRecordEvent pje = (VoiceUserJoinedRecordEvent) event;

		ParticipantJoinedVoiceRecordEvent evt = new ParticipantJoinedVoiceRecordEvent();
		evt.setMeetingId(meetingId);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(pje.getUserId().toString());
		evt.setCallerName(pje.getCallerIdName());
		evt.setCallerNumber(pje.getCallerIdName());
		evt.setMuted(pje.getMuted());
		evt.setTalking(pje.getSpeaking());
		
		recorder.record(meetingId, evt);
	}

	private void recordUserLeftVoiceConfEvent(VoiceConferenceRecordEvent event, String meetingId) {
		
		ParticipantLeftVoiceRecordEvent evt = new ParticipantLeftVoiceRecordEvent();
		evt.setMeetingId(meetingId);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		
		
		evt.setParticipant(((VoiceUserLeftRecordEvent)event).getUserId().toString());
		
		recorder.record(meetingId, evt);
	}
	
	private void recordUserMutedInVoiceConfEvent(VoiceConferenceRecordEvent event, String meetingId) {
		VoiceUserMutedRecordEvent pme = (VoiceUserMutedRecordEvent) event;
		
		ParticipantMutedVoiceRecordEvent evt = new ParticipantMutedVoiceRecordEvent();
		evt.setMeetingId(meetingId);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(((VoiceUserMutedRecordEvent)event).getUserId().toString());
		evt.setMuted(pme.isMuted());
		
		recorder.record(meetingId, evt);
	}
	
	private void recordUserTalkingInVoiceConfEvent(VoiceConferenceRecordEvent event, String meetingId) {
		VoiceUserTalkingRecordEvent pte = (VoiceUserTalkingRecordEvent) event;
	
		ParticipantTalkingVoiceRecordEvent evt = new ParticipantTalkingVoiceRecordEvent();
		evt.setMeetingId(meetingId);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(((VoiceUserTalkingRecordEvent)event).getUserId().toString());
		evt.setTalking(pte.isTalking());
		
		recorder.record(meetingId, evt);
	}
	
	private void recordUserLockedInVoiceConfEvent(VoiceConferenceRecordEvent event, String meetingId) {
		VoiceUserLockedRecordEvent ple = (VoiceUserLockedRecordEvent) event;

		ParticipantLockedVoiceRecordEvent evt = new ParticipantLockedVoiceRecordEvent();
		evt.setMeetingId(meetingId);
		evt.setTimestamp(genTimestamp());
		evt.setBridge(event.getRoom());
		evt.setParticipant(((VoiceUserLockedRecordEvent)event).getUserId().toString());
		evt.setLocked(ple.isLocked());
		
		recorder.record(meetingId, evt);
	}
	
}
