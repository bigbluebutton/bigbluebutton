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

import java.beans.PropertyChangeListener;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeUser;
import org.bigbluebutton.conference.voice.IParticipant;
import org.bigbluebutton.conference.voice.IRoom;


public class MeetMeUserAdapter implements IParticipant {
	protected static Logger log = LoggerFactory.getLogger(MeetMeUserAdapter.class);

	private MeetMeUser user;
	
	public MeetMeUserAdapter(MeetMeUser user) {
		this.user = user;
	}
	
	public String getCallerIdName() {
		return user.getChannel().getCallerId().getName();
	}

	public String getCallerIdNumber() {
		return user.getChannel().getCallerId().getNumber();
	}

	public IRoom getRoom() {
		MeetMeRoomAdapter room = new MeetMeRoomAdapter(user.getRoom());
		return room;		
	}

	public Date getDateJoined() {
		return user.getDateJoined();
	}

	public Date getDateLeft() {
		return user.getDateLeft();
	}

	public Integer getParticipantId() {
		return user.getUserNumber();
	}
	
	public boolean isMuted() {
		return user.isMuted();
	}

	public boolean isTalking() {
		return user.isTalking();
	}

	public void kick() {
		try {
			user.kick();
		} catch (ManagerCommunicationException e) {
			log.error("Failed to kick participant: " + user.getUserNumber() + " due to '" + e.getMessage() + "'");
		}
	}

	public void mute() {
		try {
			user.mute();
		} catch (ManagerCommunicationException e) {
			log.error("Failed to mute participant: " + user.getUserNumber() + " due to '" + e.getMessage() + "'");
		}
	}

	public void unmute() {
		try {
			user.unmute();
		} catch (ManagerCommunicationException e) {
			log.error("Failed to unmute participant: " + user.getUserNumber() + " due to '" + e.getMessage() + "'");
		}
	}

	public void addPropertyChangeListener(PropertyChangeListener listener) {
		user.addPropertyChangeListener(listener);
	}

	public String getId() {
		return user.getUserNumber().toString();
	}
}
