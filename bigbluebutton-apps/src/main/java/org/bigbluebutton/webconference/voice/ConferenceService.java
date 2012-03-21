/** 
* ===License Header===
*
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
* ===License Header===
*/
package org.bigbluebutton.webconference.voice;

import java.util.ArrayList;

import org.bigbluebutton.webconference.red5.voice.ClientManager;
import org.bigbluebutton.webconference.voice.events.ConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.ParticipantLockedEvent;
import org.bigbluebutton.webconference.voice.internal.RoomManager;

public class ConferenceService implements ConferenceEventListener {
	private RoomManager roomMgr;
	private ConferenceServiceProvider confProvider;
	private ClientManager clientManager;
	
	public boolean startup() {
		return confProvider.startup();
	}
	
	public void shutdown() {
		confProvider.shutdown();
		roomMgr = null;
	}
	
	public void createConference(String room, String meetingid, boolean record) {
		if (roomMgr.hasRoom(room)) return;
		roomMgr.createRoom(room, record, meetingid);
		confProvider.populateRoom(room);
		
	}
	
	public void destroyConference(String room) {
		roomMgr.destroyRoom(room);
	}
	
	public void lock(Integer participant, String room, Boolean lock) {
		if (roomMgr.hasParticipant(room, participant)) {
//			roomMgr.lockParticipant(participant, room, lock);
			ParticipantLockedEvent ple = new ParticipantLockedEvent(participant, room, lock);
			handleConferenceEvent(ple);
		}			
	}
	
	public void recordSession(String room, String meetingid){
		confProvider.record(room, meetingid);
	}
	
	public void mute(Integer participant, String room, Boolean mute) {
		if (roomMgr.hasParticipant(room, participant))
			muteParticipant(participant, room, mute);
	}
	
	public void mute(String room, Boolean mute) {
		if (roomMgr.hasRoom(room)) {
			roomMgr.mute(room, mute);
			ArrayList<Participant> p = getParticipants(room);
			for (Participant o : p) {
				if (! roomMgr.isParticipantMuteLocked(o.getId(), room)) {
					muteParticipant(o.getId(), room, mute);
				}				
			}
		}
	}
	
	public boolean isRoomMuted(String room){
		if (roomMgr.hasRoom(room)) {
			return roomMgr.isRoomMuted(room);
		}
		return false;
	}
	
	private void muteParticipant(Integer participant, String room, Boolean mute) {
		confProvider.mute(room, participant, mute);		
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
		confProvider.eject(room, participant);
	}

	public ArrayList<Participant> getParticipants(String room) {
		return roomMgr.getParticipants(room);
	}
	
	public void handleConferenceEvent(ConferenceEvent event) {
		roomMgr.processConferenceEvent(event);
		clientManager.handleConferenceEvent(event);
	}
	
	public void setClientManager(ClientManager c) {
		clientManager = c;
	}
		
	public void setConferenceServiceProvider(ConferenceServiceProvider c) {
		confProvider = c;
		confProvider.setConferenceEventListener(this);
	}
		
	public void setRoomManager(RoomManager roomManager) {
		this.roomMgr = roomManager;
		roomManager.setConferenceService(this);
	}
}
