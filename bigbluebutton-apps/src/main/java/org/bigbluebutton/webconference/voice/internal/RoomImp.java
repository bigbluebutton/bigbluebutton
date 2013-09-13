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
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.bigbluebutton.webconference.voice.Participant;
import org.bigbluebutton.webconference.voice.Room;

import net.jcip.annotations.ThreadSafe;

@ThreadSafe
public class RoomImp implements Room {
	private final String name;
	
	private final ConcurrentMap<Integer, Participant> participants;
	
	private boolean muted = false;
	private boolean record = false;
	private String meetingid;
	private boolean recording = false;
	
	public RoomImp(String name, boolean record, String meetingid) {
		this.name = name;
		this.record = record;
		this.meetingid = meetingid;
		participants = new ConcurrentHashMap<Integer, Participant>();
	}
	
	public String getName() {
		return name;
	}
	
	public int numParticipants() {
		return participants.size();
	}
	
	public Participant getParticipant(Integer id) {
		return participants.get(id);
	}
	
	public Participant add(Participant p) {
		return participants.putIfAbsent(p.getId(), p);
	}
	
	public boolean hasParticipant(Integer id) {
		return participants.containsKey(id);
	}
	
	public int getUserWithID(String userID) {
		for (Map.Entry<Integer, Participant> entry : participants.entrySet()) {
		    Participant u = entry.getValue();
		    if (userID.equals(u.getUserID())) {
		    	return u.getId();
		    }
		}
		
		return -1;
	}
	
	public void remove(Integer id) {
		Participant p = participants.remove(id);
		if (p != null) p = null;
	}
	
	public void mute(boolean mute) {
		muted = mute;
	}
	
	public boolean isMuted() {
		return muted;
	}
	
	public void record(boolean record){
		this.record = record;
	}
	
	public boolean record() {
		return record;
	}
	
	public void recording(boolean rec) {
		recording = rec;
	}
	
	public boolean isRecording(){
		return recording;
	}
	
	public String getMeeting() {
		return meetingid;
	}

	public void setMeeting(String meetingid) {
		this.meetingid = meetingid;
	}
	
	
	public ArrayList<Participant> getParticipants() {
		Map<Integer, Participant> p = Collections.unmodifiableMap(participants);
		ArrayList<Participant> pa = new ArrayList<Participant>();
		pa.addAll(p.values());
		return pa;
	}
}
