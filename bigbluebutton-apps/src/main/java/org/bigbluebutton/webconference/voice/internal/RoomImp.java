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
package org.bigbluebutton.webconference.voice.internal;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.bigbluebutton.webconference.voice.Participant;
import org.bigbluebutton.webconference.voice.Room;

import net.jcip.annotations.ThreadSafe;

@ThreadSafe
public class RoomImp implements Room {
	private static Logger log = Red5LoggerFactory.getLogger( RoomImp.class, "bigbluebutton" );
	private final String name;
	
	private final ConcurrentMap<Integer, Participant> participants;
	
	private boolean muted = false;
	private boolean record = false;
	private String meetingid;
	private boolean recording = false;

	private transient final Map<String, IRoomListener> listeners;
	
	public RoomImp(String name,boolean record, String meetingid) {
		this.name = name;
		this.record = record;
		this.meetingid = meetingid;
		participants = new ConcurrentHashMap<Integer, Participant>();
		listeners = new ConcurrentHashMap<String, IRoomListener>();
	}
	
	public String getName() {
		return name;
	}

	public void addRoomListener(IRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener");
			listeners.put(listener.getName(), listener);
		}
	}

	public void removeRoomListener(IRoomListener listener) {
		log.debug("removing room listener");
		listeners.remove(listener);
	}

	public int numParticipants() {
		return participants.size();
	}
	
	public Participant getParticipant(Integer id) {
		return participants.get(id);
	}
	
	public Participant add(Participant p) {
		int key = p.getId();
		if (!participants.containsKey(key)) {
			participants.put(key, p);

			log.debug("Informing roomlisteners " + listeners.size());
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				IRoomListener listener = (IRoomListener) it.next();
				log.debug("calling participantJoined on listener " + listener.getName());
				listener.participantJoined(p);
			}

			return p;
		} else {
			return participants.get(key);
		}
 	}
	
	public boolean hasParticipant(Integer id) {
		return participants.containsKey(id);
	}
	
	public void remove(Integer id) {
		Participant p = participants.remove(id);
		if (p != null) {
			for (Iterator it = listeners.values().iterator(); it.hasNext();) {
				IRoomListener listener = (IRoomListener) it.next();
				log.debug("calling participantLeft on listener " + listener.getName());
				listener.participantLeft(p);
			}
			p = null;
		}
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
	
	public String getMeetingId() {
		return meetingid;
	}

	public void setMeetingId(String meetingid) {
		this.meetingid = meetingid;
	}
	
	
	public ArrayList<Participant> getParticipants() {
		Map<Integer, Participant> p = Collections.unmodifiableMap(participants);
		ArrayList<Participant> pa = new ArrayList<Participant>();
		pa.addAll(p.values());
		return pa;
	}
}
