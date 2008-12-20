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

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.lang.Boolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.AbstractAsteriskServerListener;
import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.live.MeetMeUserState;
import org.bigbluebuttonproject.asterisk.AsteriskVoiceService;
import org.red5.server.api.so.ISharedObject;


/**
 * The listener interface for receiving conferenceRoom events.
 * The class that is interested in processing a conferenceRoom
 * event implements this interface, and the object created
 * with that class is registered with a component using the
 * component's <code>addConferenceRoomListener<code> method. When
 * the conferenceRoom event occurs, that object's appropriate
 * method is invoked.
 * 
 * @see ConferenceRoomEvent
 */
public class ConferenceRoomListener extends AbstractAsteriskServerListener {
	
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(ConferenceRoomListener.class);
	
	/** The voice service. */
	private AsteriskVoiceService voiceService;

	
	/** The meet me s os. */
	private static Map<String, ISharedObject> meetMeSOs = new HashMap<String, ISharedObject>();
	
	/**
	 * Instantiates a new conference room listener.
	 */
	public ConferenceRoomListener() {
		log.debug("RoomListener started...");
	}

    private void initialize() 
    {	
    	try {
			voiceService.addAsteriskServerListener(this);
		} catch (ManagerCommunicationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
    }
    
    /**
     * @see org.asteriskjava.live.AbstractAsteriskServerListener#onNewMeetMeUser(org.asteriskjava.live.MeetMeUser)
     */
    public void onNewMeetMeUser(MeetMeUser user)
    {
		log.info("New user joined meetme room: " + user.getRoom() + 
				" " + user.getChannel().getCallerId().getName());
		
		String roomNumber = user.getRoom().getRoomNumber();
		
		if (meetMeSOs.containsKey(roomNumber)) {
			ISharedObject so = meetMeSOs.get(roomNumber);
			user.addPropertyChangeListener(new ParticipantPropertyChangeListener(so));

			List <Object>args = new ArrayList<Object>();
			args.add(user.getUserNumber());
			args.add(user.getChannel().getCallerId().getName());
			args.add(user.getChannel().getCallerId().getNumber());
			args.add(new Boolean(user.isMuted()));
			args.add(new Boolean(user.isTalking()));
			
			so.sendMessage("userJoin", args);
		}
    }
    
    /**
     * Adds the room.
     * 
     * @param room the room
     * @param so the so
     */
    public void addRoom(String room, ISharedObject so) {
    	meetMeSOs.put(room, so);
    	
    	getCurrentUsers(room);
    }
    
    /**
     * Gets the user.
     * 
     * @param userId the user id
     * @param room the room
     * 
     * @return the user
     */
    public MeetMeUser getUser(Integer userId, String room) {
    	if (meetMeSOs.containsKey(room)) {
    		// Get the users in the room
    		Collection<MeetMeUser> currentUsers = voiceService.getUsers(room);

    		log.info("MeetMe::roomListener - There are [" + currentUsers.size() 
    				+ "] in room = [" + room + "]");    		
    		
    		for (Iterator it = currentUsers.iterator(); it.hasNext();) {
    			MeetMeUser oneUser = (MeetMeUser) it.next();
    			
    			log.info("MeetMe::roomListener - Looking at userid = [" + oneUser.getUserNumber() 
	    				+ "] in room = [" + oneUser.getRoom().getRoomNumber() + "]");
    			
    			if (oneUser.getUserNumber().intValue() == userId.intValue()) {
    	    		log.info("MeetMe::roomListener - Found userid = [" + userId 
    	    				+ "] in room = [" + room + "]");
    				return oneUser;
    			}
    		}    
    	}    	
    	return null;    	
    }

    public void initializeConferenceUsers(String room) {
    	if (meetMeSOs.containsKey(room)) {
    		ISharedObject so = (ISharedObject) meetMeSOs.get(room);
    	
    		// Get the users in the room
    		Collection<MeetMeUser> currentUsers = voiceService.getUsers(room);
		
    		log.info("initializeConferenceUsers - There are " + currentUsers.size() 
    				+ " current users in room [" + room + "]");
		
    		for (Iterator it = currentUsers.iterator(); it.hasNext();) {
    			MeetMeUser oneUser = (MeetMeUser) it.next();
    			oneUser.addPropertyChangeListener(new ParticipantPropertyChangeListener(so));
    		}    
    	}
    }    
    
    /**
     * Gets the current users.
     * 
     * @param room the room
     * 
     * @return the current users
     */
    public Collection<MeetMeUser> getCurrentUsers(String room) {
    	if (meetMeSOs.containsKey(room)) {
    		ISharedObject so = (ISharedObject) meetMeSOs.get(room);
    	
    		// Get the users in the room
    		Collection<MeetMeUser> currentUsers = voiceService.getUsers(room);
		
    		log.info("MeetMe::roomListener - There are " + currentUsers.size() 
    				+ " current users in room [" + room + "]");
		
    		for (Iterator it = currentUsers.iterator(); it.hasNext();) {
    			MeetMeUser oneUser = (MeetMeUser) it.next();
    			//oneUser.addPropertyChangeListener(new ParticipantPropertyChangeListener(so));
    		}    
    		
    		return currentUsers;
    	}
    	
    	return null;
    }
    
    /**
     * Gets the shared object.
     * 
     * @param room the room
     * 
     * @return the shared object
     */
    public static ISharedObject getSharedObject(String room) {
    	if (meetMeSOs.containsKey(room)) {
    		return (ISharedObject) meetMeSOs.get(room);
    	}
    	
    	return null;
    }
    
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
	private class ParticipantPropertyChangeListener implements PropertyChangeListener {
		
		private Boolean talking = null;
		private Boolean muted = null;
		
		/** The so. */
		private ISharedObject so;
		
		/**
		 * Instantiates a new participant property change listener.
		 * 
		 * @param so the so
		 */
		public ParticipantPropertyChangeListener(ISharedObject so) {
			this.so = so;
		}
		
		/* (non-Javadoc)
		 * @see java.beans.PropertyChangeListener#propertyChange(java.beans.PropertyChangeEvent)
		 */
		public void propertyChange(PropertyChangeEvent evt) {
			MeetMeUser changedUser = (MeetMeUser) evt.getSource();
		
			log.info("Received property changed event for " + evt.getPropertyName() +
					" old = '" + evt.getOldValue() + "' new = '" + evt.getNewValue() +
					"' room = '" + ((MeetMeUser) evt.getSource()).getRoom() + "'");	
			
			if (evt.getPropertyName().equals("muted")) {				
				if ((muted == null) || (muted.booleanValue() != changedUser.isMuted())) {	
					List <Object>args = new ArrayList<Object>();
					args.add(changedUser.getUserNumber());
					log.info("User mute changed: [" + changedUser.getUserNumber() 
							+ ",old=" + muted + ",new=" + changedUser.isMuted() + "]");
					muted = changedUser.isMuted();
					args.add(muted);
					so.sendMessage("userMute", args);
				} else {				
					log.info("User mute same: [" + changedUser.getUserNumber() 
						+ "," + changedUser.isMuted() + "]");
				}
			} else if (evt.getPropertyName().equals("talking")) {
				List <Object>args = new ArrayList<Object>();
				args.add(changedUser.getUserNumber());
				if ((talking == null) || (talking.booleanValue() != changedUser.isTalking())) {					
					log.info("User talk changed: [" + changedUser.getUserNumber() 
							+ ",old=" + talking + ",new="+ changedUser.isTalking() + "]");
					talking = changedUser.isTalking();
					args.add(talking);
					so.sendMessage("userTalk", args);
				} else {				
					log.info("User talk same: [" + changedUser.getUserNumber() 
						+ "," + changedUser.isTalking() + "]");
				}
			} else if ("state".equals(evt.getPropertyName())) {
				log.info("User [" + changedUser.getUserNumber() + "," + evt.getNewValue() + "]");
				
				List <Object>args = new ArrayList<Object>();
				args.add(changedUser.getUserNumber());
				if (MeetMeUserState.LEFT == (MeetMeUserState) evt.getNewValue()) {
					so.sendMessage("userLeft", args);
				}
			}			
		}    
	}

	/**
	 * Sets the voice service.
	 * 
	 * @param voiceService the new voice service
	 */
	public void setVoiceService(AsteriskVoiceService voiceService) {
		this.voiceService = voiceService;
	}
}
