/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.conference.voice.asterisk;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeRoom;
import org.asteriskjava.live.MeetMeUser;
import org.bigbluebutton.conference.voice.AbstractRoom;
import org.bigbluebutton.conference.voice.IParticipant;
import org.bigbluebutton.conference.voice.IRoomEventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class MeetMeRoomAdapter extends AbstractRoom{
	protected static Logger logger = LoggerFactory.getLogger(MeetMeRoomAdapter.class);
	
	private Set<IRoomEventListener> roomEventListeners = new HashSet<IRoomEventListener>();
	
	private MeetMeRoom room;
	 
	// Temporary for now until we sort out how to get these
	// values from MeetMe.
	private boolean muted = false;
	private boolean locked = false;
	
	public MeetMeRoomAdapter(MeetMeRoom room) {
		this.room = room;
	}
	
	public String getName() {
		return room.getRoomNumber();
	}
	
	public void lock() {
		try {
			room.lock();
			locked = true;
		} catch (ManagerCommunicationException e) {
			logger.error("Failed to lock room {}", room.getRoomNumber());
		}
	}

	public void unlock() {
		try {
			room.unlock();
			locked = false;
		} catch (ManagerCommunicationException e) {
			logger.error("Failed to unlock room {}", room.getRoomNumber());
		}
	}
	
	public void mute() {
		muted = true;
	}
	
	public void unmute() {
		muted = false;
	}
	
	public Collection<IParticipant> getParticipants() {
		Collection<IParticipant> participants = new ArrayList<IParticipant>();
		
    	for (MeetMeUser user : room.getUsers())
    	{
    		MeetMeUserAdapter participant = new MeetMeUserAdapter(user);
    		participants.add(participant);
    	}

    	return participants;
	}

	public boolean isLocked() {
		return locked;
	}

	public boolean isMuted() {
		return muted;
	}
	
	public void addRoomEventListener(IRoomEventListener listener) {
		roomEventListeners.add(listener);
	}
	
	public void removeRoomEventListener(IRoomEventListener listener) {
		roomEventListeners.remove(listener);
	}
}
