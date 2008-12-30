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

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.live.MeetMeUserState;


/**
 * The listener interface for receiving participantPropertyChange events.
 * The class that is interested in processing a participantPropertyChange
 * event implements this interface, and the object created
 * with that class is registered with a component using the
 * component's <code>addParticipantPropertyChangeListener<code> method. When
 * the participantPropertyChange event occurs, that object's appropriate
 * method is invoked.
 * 
 * @see ParticipantPropertyChangeEvent
 */
public class ParticipantPropertyChangeListener implements PropertyChangeListener {
	
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(ParticipantPropertyChangeListener.class);
	
	/** The room number. */
	private String roomNumber;
	
	/** The user. */
	private MeetMeUserAdapter user;
	
	/**
	 * Instantiates a new participant property change listener.
	 * 
	 * @param roomNumber the room number
	 * @param user the user
	 */
	public ParticipantPropertyChangeListener(String roomNumber, MeetMeUserAdapter user) {
		this.roomNumber = roomNumber;
		this.user = user;
	}
	
	/**
	 * @see java.beans.PropertyChangeListener#propertyChange(java.beans.PropertyChangeEvent)
	 */
	public void propertyChange(PropertyChangeEvent evt) {
		MeetMeUser changedUser = (MeetMeUser) evt.getSource();
		String room = changedUser.getRoom().getRoomNumber();
		
		log.info("Received property changed event for " + evt.getPropertyName() +
				" old = " + evt.getOldValue() + " new = " + evt.getNewValue() +
				" room = " + ((MeetMeUser) evt.getSource()).getRoom());	
		
		
		if (roomNumber.equals(room)) {		
/*			if ("state".equals(evt.getPropertyName()) && 
					(evt.getNewValue().equals(MeetMeUserState.JOINED))) {
				if (user == changedUser) {
					log.info("User left the conference...");
					changedUser.removePropertyChangeListener(this);
				}
			}
*/	
		}
	}

}
