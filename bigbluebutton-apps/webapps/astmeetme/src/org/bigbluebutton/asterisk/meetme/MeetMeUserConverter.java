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
package org.bigbluebutton.asterisk.meetme;

import java.beans.PropertyChangeListener;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeUser;
import org.bigbluebutton.asterisk.IConference;
import org.bigbluebutton.asterisk.IParticipant;



/**
 * The Class MeetMeUserConverter.
 */
public class MeetMeUserConverter implements IParticipant {
	
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(MeetMeUserConverter.class);
	
	/** The user. */
	private MeetMeUser user;
	
	/**
	 * Instantiates a new meet me user converter.
	 * 
	 * @param user the user
	 */
	public MeetMeUserConverter(MeetMeUser user) {
		this.user = user;
	}
	
	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#getCallerIdName()
	 */
	public String getCallerIdName() {
		return user.getChannel().getCallerId().getName();
	}
 
	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#getCallerIdNumber()
	 */
	public String getCallerIdNumber() {
		return user.getChannel().getCallerId().getNumber();
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#getConference()
	 */
	public IConference getConference() {
		return new MeetMeRoomAdapter(user.getRoom());
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#getDateJoined()
	 */
	public Date getDateJoined() {
		return user.getDateJoined();
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#getDateLeft()
	 */
	public Date getDateLeft() {
		return user.getDateLeft();
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#getParticipantId()
	 */
	public Integer getParticipantId() {
		return user.getUserNumber();
	}
	
	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#isMuted()
	 */
	public boolean isMuted() {
		return user.isMuted();
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#isTalking()
	 */
	public boolean isTalking() {
		return user.isTalking();
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#kick()
	 */
	public void kick() {
		try {
			user.kick();
		} catch (ManagerCommunicationException e) {
			log.error("Failed to kick participant: " + user.getUserNumber() + " due to '" + e.getMessage() + "'");
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#mute()
	 */
	public void mute() {
		try {
			user.mute();
		} catch (ManagerCommunicationException e) {
			log.error("Failed to mute participant: " + user.getUserNumber() + " due to '" + e.getMessage() + "'");
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#unmute()
	 */
	public void unmute() {
		try {
			user.unmute();
		} catch (ManagerCommunicationException e) {
			log.error("Failed to unmute participant: " + user.getUserNumber() + " due to '" + e.getMessage() + "'");
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * @see org.bigbluebutton.asterisk.IParticipant#addPropertyChangeListener(java.beans.PropertyChangeListener)
	 */
	public void addPropertyChangeListener(PropertyChangeListener listener) {
		user.addPropertyChangeListener(listener);
	}
}
