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

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.lang.Boolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.AbstractAsteriskServerListener;
import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.live.MeetMeUserState;
import org.bigbluebutton.conference.voice.IParticipant;
import org.bigbluebutton.conference.voice.IRoomEventListener;
import org.red5.server.api.so.ISharedObject;

public class AsteriskServerListener extends AbstractAsteriskServerListener {
	
	protected static Logger log = LoggerFactory.getLogger(AsteriskServerListener.class);
	
	private Set<IRoomEventListener> roomEventListeners = new HashSet<IRoomEventListener>(); 
	
	public void addRoomEventListener(IRoomEventListener listener) {
		roomEventListeners.add(listener);
	}
	
	public void removeRoomEventListener(IRoomEventListener listener) {
		roomEventListeners.remove(listener);
	}
	
    public void onNewMeetMeUser(MeetMeUser user)
    {
		log.info("New user joined meetme room: " + user.getRoom() + 
				" " + user.getChannel().getCallerId().getName());
		
		IParticipant p = new MeetMeUserAdapter(user);

		for (IRoomEventListener listener : roomEventListeners) {
			listener.participantJoined(p);
		}
    }
            
	private class ParticipantPropertyChangeListener implements PropertyChangeListener {
		
		public void propertyChange(PropertyChangeEvent evt) {
			MeetMeUser changedUser = (MeetMeUser) evt.getSource();
			
			IParticipant p = new MeetMeUserAdapter(changedUser);
			
			for (IRoomEventListener listener : roomEventListeners) {
				if ("muted".equals(evt.getPropertyName())) {
					listener.participantMuted(p);
				} else if ("talking".equals(evt.getPropertyName())) {
					listener.participantTalking(p);
				} else if ("state".equals(evt.getPropertyName())) {
					listener.participantLeft(p);
				}
			}			
		}    
	}
}
