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
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeUser;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;


/**
 * The Class MeetMeService.
 */
public class MeetMeService extends ApplicationAdapter {
	
	/** The logger. */
	protected static Logger logger = LoggerFactory.getLogger(MeetMeService.class);
	
	/** The room listener. */
	private ConferenceRoomListener roomListener;
	
	/**
	 * Gets the meet me users.
	 * 
	 * @return the meet me users
	 */
	public Map<String, List> getMeetMeUsers() {
		// get the current scope that the current connection is associated with...
    	IScope scope = Red5.getConnectionLocal().getScope();	
    	
    	logger.debug("GetMeetmeUsers request for room[" + scope.getName() + "]");
    	
    	Map<String, List> usersMap = new HashMap<String, List>();;

	   	if (hasSharedObject(scope, "meetMeUsersSO")) {
	   		logger.info("MeetMe::service - Getting current users for room " + scope.getName());
    		
    		// Get the users in the room
    		Collection<MeetMeUser> currentUsers = roomListener.getCurrentUsers(scope.getName());
    		
    		logger.info("MeetMe::service - There are " + currentUsers.size() + " current users...");
    		
    		for (Iterator it = currentUsers.iterator(); it.hasNext();) {
    			MeetMeUser oneUser = (MeetMeUser) it.next();
    			
    			List <Object>aUser = new ArrayList<Object>();
    			aUser.add(oneUser.getUserNumber());
    			aUser.add(oneUser.getChannel().getCallerId().getName());
    			aUser.add(oneUser.getChannel().getCallerId().getNumber());
    			aUser.add(new Boolean(oneUser.isMuted()));
    			aUser.add(new Boolean(oneUser.isTalking()));   
    			
    			usersMap.put(oneUser.getUserNumber().toString(), aUser);

    		}  
    	} 
	   	
	   	logger.info("MeetMe::service - Sending " + usersMap.size() + " current users...");
	   	return usersMap;
	}
	
	/**
	 * Mute all users.
	 * 
	 * @param mute the mute
	 */
	public void muteAllUsers(Boolean mute) {
		// get the current scope that the current connection is associated with...
    	IScope scope = Red5.getConnectionLocal().getScope();	
    	
    	logger.debug("MuteUnmuteAll request for room[" + scope.getName() + "]");
	   	
    	if (hasSharedObject(scope, "meetMeUsersSO")) {
	   		logger.info("MeetMe::service - Getting current users for room " + scope.getName());
    		
    		// Get the users in the room
    		Collection<MeetMeUser> currentUsers = roomListener.getCurrentUsers(scope.getName());
    		
    		logger.info("MeetMe::service - There are " + currentUsers.size() + " current users...");
    		
    		for (Iterator it = currentUsers.iterator(); it.hasNext();) {
    			MeetMeUser oneUser = (MeetMeUser) it.next();
    			if (mute) {
    				if (! oneUser.isMuted()) {
    					try {
    						oneUser.mute();
    					} catch (ManagerCommunicationException e) {
    						// TODO Auto-generated catch block
    						e.printStackTrace();
    					}
    				}
    			} else {
    				if (oneUser.isMuted()) {
    					try {
    						oneUser.unmute();
    					} catch (ManagerCommunicationException e) {
    						// TODO Auto-generated catch block
    						e.printStackTrace();
    					}  
    				}
    			}
    		}  
    	} 
	}	
	
	/**
	 * Mute unmute user.
	 * 
	 * @param userId the user id
	 * @param muteUser the mute user
	 */
	public void muteUnmuteUser(Integer userId, Boolean muteUser) {
		// get the current scope that the current connection is associated with...
    	IScope scope = Red5.getConnectionLocal().getScope();
    	
    	logger.debug("MuteUnmute request for user [" + userId + "] in room[" + scope.getName() + "]");		
		
    	if (hasSharedObject(scope, "meetMeUsersSO")) {
			MeetMeUser theUser = roomListener.getUser(userId, scope.getName());
			
			if (theUser == null) {
				logger.warn("Cannot find user[" + userId + "] in room[" + scope.getName() + "]");
				return;
			}
			
			if (muteUser) {
				try {
					logger.debug("Muted user[" + userId + "] in room[" + scope.getName() + "]");
					theUser.mute();
				} catch (ManagerCommunicationException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			} else {
				try {
					theUser.unmute();
					logger.debug("Unmuted user[" + userId + "] in room[" + scope.getName() + "]");
				} catch (ManagerCommunicationException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
	}

	/**
	 * Eject user.
	 * 
	 * @param userId the user id
	 */
	public void ejectUser(Integer userId) {
		// get the current scope that the current connection is associated with...
    	IScope scope = Red5.getConnectionLocal().getScope();
    	
    	logger.debug("ejectUser " + userId + " request for room[" + scope.getName() + "]");		
		
    	if (hasSharedObject(scope, "meetMeUsersSO")) {
			MeetMeUser theUser = roomListener.getUser(userId, scope.getName());
			
			if (theUser == null) {
				logger.warn("Cannot find user[" + userId + "] in room[" + scope.getName() + "]");
				return;
			}
						
			try {
				theUser.kick();
				logger.debug("Kicked user[" + userId + "] in room[" + scope.getName() + "]");
			} catch (ManagerCommunicationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
		}
	}	
	
	/**
	 * Sets the room listener.
	 * 
	 * @param roomListener the new room listener
	 */
	public void setRoomListener(ConferenceRoomListener roomListener) {
		this.roomListener = roomListener;
	}	
}
