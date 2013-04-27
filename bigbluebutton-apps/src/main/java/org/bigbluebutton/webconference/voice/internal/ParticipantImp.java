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

import org.bigbluebutton.webconference.voice.Participant;

import net.jcip.annotations.ThreadSafe;

@ThreadSafe
class ParticipantImp implements Participant {
	private final int id;
	private final String name;
	private boolean muted = false;
	private boolean talking = false;
	private boolean locked = false;
	private boolean joinedToBreakoutRoomName = false;
	private String breakoutRoomName;
	private String breakoutRoomNumber;
	
	ParticipantImp(int id, String name) {
		this.id = id;
		this.name = name;
	}
	
	synchronized void setTalking(boolean talking) {
		this.talking = talking;
	}

	synchronized void setMuted(boolean muted) {
		this.muted = muted;
	}
	
	synchronized public boolean isMuted() {
		return muted;
	}

	synchronized public boolean isTalking() {
		return talking;
	}

	public int getId() {
		return id;
	}

	public boolean isMuteLocked() {
		return locked;
	}
	
	public void setLock(boolean lock) {
		locked = lock;
	}
	
	public String getName() {
		return name;
	}

	@Override
	synchronized public boolean joinedToBreakoutRoom() {
		return this.joinedToBreakoutRoomName;
	}
	
	synchronized public void setJoinedToBreakoutRoom(boolean jbr) {
		this.joinedToBreakoutRoomName = jbr;
	}

	@Override
	synchronized public String getBreakoutRoomName() {
		return this.breakoutRoomName;
	}
	
	synchronized public void setBreakoutRoomName(String brn) {
		this.breakoutRoomName = brn;
	}

	@Override
	synchronized public String getBreakoutRoomNumber() {
		return this.breakoutRoomNumber;
	}
	
	synchronized public void setBreakoutRoomNumber(String brn) {
		this.breakoutRoomNumber = brn;
	}
}
