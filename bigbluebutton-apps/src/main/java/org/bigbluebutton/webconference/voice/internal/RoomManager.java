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
package org.bigbluebutton.webconference.voice.internal;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;
<<<<<<< HEAD

import net.jcip.annotations.ThreadSafe;

import org.bigbluebutton.webconference.voice.ConferenceService;
import org.bigbluebutton.webconference.voice.Participant;
import org.bigbluebutton.webconference.voice.VoiceEventRecorder;
import org.bigbluebutton.webconference.voice.events.ConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.bigbluebutton.webconference.voice.events.StartRecordingEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
=======
import org.bigbluebutton.webconference.voice.Participant;
import org.bigbluebutton.webconference.voice.VoiceEventRecorder;
import org.bigbluebutton.webconference.voice.events.VoiceConferenceEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserJoinedEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserLeftEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserLockedEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserMutedEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserTalkingEvent;
import org.bigbluebutton.webconference.voice.events.VoiceStartRecordingEvent;
>>>>>>> refactor-voice-users

public class RoomManager {	
	private final ConcurrentHashMap<String, RoomImp> rooms;
	private VoiceEventRecorder recorder;
		
	public RoomManager() {
		rooms = new ConcurrentHashMap<String, RoomImp>();
	}
	
	public String getVoiceUserIDFromRoom(String room, String userID) {
		RoomImp rm = rooms.get(room);
		if (rm != null) {
			return rm.getUserWithID(userID);
		}
		
		return "";
	}
	
<<<<<<< HEAD
	public void createRoom(String name, boolean record, String meetingid, Boolean muted) {
		log.debug("Creating room: " + name);
		RoomImp r = new RoomImp(name, record, meetingid, muted);
=======
	public void createRoom(String name, boolean record, String meetingid) {
		RoomImp r = new RoomImp(name, record, meetingid);
>>>>>>> refactor-voice-users
		rooms.putIfAbsent(name, r);
	}
	
	public boolean hasRoom(String name) {
		return rooms.containsKey(name);
	}
	
	public boolean hasParticipant(String room, String participant) {
		RoomImp rm = rooms.get(room);
		if (rm == null) return false;
		return rm.hasParticipant(participant);
	}
	
	public void destroyRoom(String name) {
		RoomImp r = rooms.remove(name);
		if (r != null) r = null;
	}
	
	public void mute(String room, boolean mute) {
		RoomImp rm = rooms.get(room);
		if (rm != null) rm.mute(mute);
	}
	
	public boolean isRoomMuted(String room){
		RoomImp rm = rooms.get(room);
		if (rm != null) return rm.isMuted();
		else return false;
	}
	
	public ArrayList<Participant> getParticipants(String room) {
		RoomImp rm = rooms.get(room);		
		if (rm == null) {
			
		}
		return rm.getParticipants();
	}
<<<<<<< HEAD
=======
		
	public boolean isParticipantMuteLocked(String participant, String room) {
		RoomImp rm = rooms.get(room);
		if (rm != null) {
			Participant p = rm.getParticipant(participant);
			return p.isMuteLocked();
		}
		return false;
	}

	private void lockParticipant(String room, String participant, Boolean lock) {
		RoomImp rm = rooms.get(room);
		if (rm != null) {
			ParticipantImp p = (ParticipantImp) rm.getParticipant(participant);
			if (p != null)
				p.setLock(lock);
		}
	}
>>>>>>> refactor-voice-users
	
	/**
	 * Process the event from the voice conferencing server.
	 * @param event
	 */
	public void processConferenceEvent(VoiceConferenceEvent event) {
		
		RoomImp rm = rooms.get(event.getRoom());
		if (rm == null) {
			
			return;
		}
		
		if (event instanceof VoiceUserJoinedEvent) {
			handleParticipantJoinedEvent(event, rm);
		} else if (event instanceof VoiceUserLeftEvent) {		
			handleParticipantLeftEvent(event, rm);
		} else if (event instanceof VoiceUserMutedEvent) {
			handleParticipantMutedEvent(event, rm);
		} else if (event instanceof VoiceUserTalkingEvent) {
			handleParticipantTalkingEvent(event, rm);
<<<<<<< HEAD
		} else if (event instanceof StartRecordingEvent) {
=======
		} else if (event instanceof VoiceUserLockedEvent) {
			handleParticipantLockedEvent(event, rm);
		} else if (event instanceof VoiceStartRecordingEvent) {
>>>>>>> refactor-voice-users
			// do nothing but let it through.
			// later on we need to dispatch an event to the client that the voice recording has started.
		} else {
			
			return;
		}
		
		/**
		 * Record the event if the meeting is being recorded.
		 */
		recorder.recordConferenceEvent(event, rm.getMeeting());
	}

	private void handleParticipantJoinedEvent(VoiceConferenceEvent event, RoomImp rm) {
		
		VoiceUserJoinedEvent pje = (VoiceUserJoinedEvent) event;
		ParticipantImp p = new ParticipantImp(pje.getUserId(), pje.getCallerIdName());
		p.setMuted(pje.getMuted());
		p.setTalking(pje.getSpeaking());
		
		
		rm.add(p);
		
		if (rm.numParticipants() == 1) {
			if (rm.record() && !rm.isRecording()) {
				/**
				 * Start recording when the first user joins the voice conference.
				 * WARNING: Works only with FreeSWITCH for now. We need to come up with a generic way to
				 * trigger recording for both Asterisk and FreeSWITCH.
				 */
				rm.recording(true);
//				confService.recordSession(event.getRoom(), rm.getMeeting());
			}
			
			// Broadcast the audio
//			confService.broadcastSession(event.getRoom(), rm.getMeeting());
		}
		
		
		
		if (rm.isMuted() && !p.isMuted()) {
//			confService.mute(p.getId(), event.getRoom(), true);
		}		
	}
	
	private void handleParticipantLeftEvent(VoiceConferenceEvent event, RoomImp rm) {
	
//		rm.remove(event.getUserId());	
		
		if ((rm.numParticipants() == 0) && (rm.record())) {
			rm.recording(false);
		}			
	}
	
	private void handleParticipantMutedEvent(VoiceConferenceEvent event, RoomImp rm) {
		VoiceUserMutedEvent pme = (VoiceUserMutedEvent) event;
//		ParticipantImp p = (ParticipantImp) rm.getParticipant(event.getUserId());
//		if (p != null) p.setMuted(pme.isMuted());		
	}
	
	private void handleParticipantTalkingEvent(VoiceConferenceEvent event, RoomImp rm) {
		VoiceUserTalkingEvent pte = (VoiceUserTalkingEvent) event;
//		ParticipantImp p = (ParticipantImp) rm.getParticipant(event.getUserId());
//		if (p != null) p.setTalking(pte.isTalking());		
	}
	
<<<<<<< HEAD
=======
	private void handleParticipantLockedEvent(VoiceConferenceEvent event, RoomImp rm) {
		VoiceUserLockedEvent ple = (VoiceUserLockedEvent) event;
		lockParticipant(ple.getRoom(), ple.getUserId(), ple.isLocked());		
	}
	
>>>>>>> refactor-voice-users
	public void setVoiceEventRecorder(VoiceEventRecorder recorder) {
		this.recorder = recorder;
	}	
	
}
