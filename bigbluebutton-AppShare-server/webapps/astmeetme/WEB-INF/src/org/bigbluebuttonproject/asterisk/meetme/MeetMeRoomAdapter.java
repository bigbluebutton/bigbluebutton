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
package org.bigbluebuttonproject.asterisk.meetme;

import java.util.ArrayList;
import java.util.Collection;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeRoom;
import org.asteriskjava.live.MeetMeUser;
import org.bigbluebuttonproject.asterisk.IConference;
import org.bigbluebuttonproject.asterisk.IParticipant; 



/**
 * The Class MeetMeRoomAdapter.
 */
public class MeetMeRoomAdapter implements IConference {
	
	/** The room. */
	MeetMeRoom room;
	 
	// Temporary for now until we sort out how to get these
	// values from MeetMe.
	/** The muted. */
	private boolean muted = false;
	
	/** The locked. */
	private boolean locked = false;
	
	/**
	 * Instantiates a new meet me room adapter.
	 * 
	 * @param room the room
	 */
	public MeetMeRoomAdapter(MeetMeRoom room) {
		this.room = room;
	}
	
	/**
	 * @see org.bigbluebuttonproject.asterisk.IConference#lock()
	 */
	public void lock() {
		try {
			room.lock();
			locked = true;
		} catch (ManagerCommunicationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * @see org.bigbluebuttonproject.asterisk.IConference#unlock()
	 */
	public void unlock() {
		try {
			room.unlock();
			locked = false;
		} catch (ManagerCommunicationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * @see org.bigbluebuttonproject.asterisk.IConference#mute()
	 */
	public void mute() {
		muted = true;
	}
	
	/**
	 * 
	 * @see org.bigbluebuttonproject.asterisk.IConference#unmute()
	 */
	public void unmute() {
		muted = false;
	}
	
	/**
	 * @see org.bigbluebuttonproject.asterisk.IConference#getParticipants()
	 */
	public Collection<IParticipant> getParticipants() {
		Collection<IParticipant> participants = new ArrayList<IParticipant>();
		
    	for (MeetMeUser user : room.getUsers())
    	{
    		IParticipant participant = new MeetMeUserAdapter(user);
    		participants.add(participant);
    	}

    	return participants;
	}

	/**
	 * @see org.bigbluebuttonproject.asterisk.IConference#isLocked()
	 */
	public boolean isLocked() {
		return locked;
	}

	/**
	 * @see org.bigbluebuttonproject.asterisk.IConference#isMuted()
	 */
	public boolean isMuted() {
		return muted;
	}
}
