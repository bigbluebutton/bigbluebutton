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
package org.bigbluebutton.conference.vo;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bigbluebutton.conference.Participant;


/**
 * Room class is an entity class used to create instances that can keep details about a conference room.
 * 
 * @author ritzalam
 */
public class Room {
	
	/** The Constant log. */
	private static final Log log = LogFactory.getLog( Room.class );
	
	/** Conference room name. */
	private String room;
	
	/** The moderator password. */
	private String moderatorPassword;
	
	/** The viewer password. */
	private String viewerPassword;
	
	/** List of participants of the conference room. */ 
	private Map <Integer, Participant> participants = new HashMap<Integer, Participant>();
	
	/**
	 * Constructor.
	 * 
	 * @param room conference room ID
	 * @param modPass moderator password
	 * @param viewPass viewer password
	 */
	public Room(String room, String modPass, String viewPass)
	{
		this.room = room;
		this.moderatorPassword = modPass;
		this.viewerPassword = viewPass;
	}

	/**
	 * Gets the moderator password.
	 * 
	 * @return the moderator password
	 */
	public String getModeratorPassword() {
		return moderatorPassword;
	}

	/**
	 * Gets the room.
	 * 
	 * @return the room
	 */
	public String getRoom() {
		return room;
	}

	/**
	 * Gets the viewer password.
	 * 
	 * @return the viewer password
	 */
	public String getViewerPassword() {
		return viewerPassword;
	}
	
	/**
	 * This method adds new participants to the list of participants of the conference room.
	 * 
	 * @param participant the participant
	 */
	public void addParticipant(Participant participant) {
		participants.put(participant.userid, participant);
		log.debug("Added participant[" + participant.userid + "," + 
				participants.size() + "]");
	}
	
	/**
	 * Removes the participant.
	 * 
	 * @param userid the userid
	 */
	public void removeParticipant(Integer userid) {
		participants.remove(userid);
	}
	
	/**
	 * Gets the participants.
	 * 
	 * @return the participants
	 */
	public ArrayList<Participant> getParticipants() {
		return new ArrayList<Participant>(participants.values());
	}	
}
