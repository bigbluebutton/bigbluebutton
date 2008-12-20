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

package org.bigbluebuttonproject.conference;

import org.bigbluebuttonproject.conference.Role;
import java.util.Map;
import java.util.HashMap;

/**
 * Participant class is an entity class used to create instances that can keep details about each participant of conference rooms.
 * 
 * @author ritzalam
 */
public class Participant {

	/** The userid. */
	public Integer userid;
	
	/** The name. */
	public String name;
	
	/** The role. */
	public String role = Role.VIEWER.toString();
	
	/** The status. */
	public String status = "";
	
	/** The has stream. */
	public Boolean hasStream = new Boolean(false);
	
	public Boolean presenter = new Boolean(false);
	
	/** The stream name. */
	public String streamName = "";
	
	/**
	 * Constructor for participant class.
	 * 
	 * @param userid - client ID
	 * @param name - name of the participant
	 * @param role - Role in the conference room
	 */	
	public Participant(Integer userid, String name, String role) {
		this.userid = userid;
		this.name = name;
		this.role = role; 
	}
	
	/**
	 * Gets the userid.
	 * 
	 * @return the userid
	 */
	public Integer getUserid() {
		return userid;
	}
	
	/**
	 * Gets the name.
	 * 
	 * @return the name
	 */
	public String getName() {
		return name;
	}
	
	/**
	 * Gets the role.
	 * 
	 * @return the role
	 */
	public String getRole() {
		return role;
	}
}
