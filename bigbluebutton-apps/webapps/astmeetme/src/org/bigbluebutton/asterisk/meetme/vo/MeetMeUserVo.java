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
package org.bigbluebutton.asterisk.meetme.vo;

import java.util.Date;

import org.asteriskjava.live.MeetMeUser;


/**
 * The Class MeetMeUserVo.
 */
public class MeetMeUserVo {

	/** The room number. */
	private String roomNumber;
	
	/** The caller id name. */
	private String callerIdName;
	
	/** The caller id number. */
	private String callerIdNumber;
	
	/** The date joined. */
	private Date dateJoined;
	
	/** The date left. */
	private Date dateLeft;
	
	/** The user number. */
	private Integer userNumber;
	
	/** The muted. */
	private Boolean muted;
	
	/** The talking. */
	private Boolean talking;
	
	/**
	 * Instantiates a new meet me user vo.
	 * 
	 * @param user the user
	 */
	public MeetMeUserVo(MeetMeUser user) {
		copy(user);
	}

	/**
	 * Gets the caller id name.
	 * 
	 * @return the caller id name
	 */
	public String getCallerIdName() {
		return callerIdName;
	}

	/**
	 * Gets the caller id number.
	 * 
	 * @return the caller id number
	 */
	public String getCallerIdNumber() {
		return callerIdNumber;
	}

	/**
	 * Gets the date joined.
	 * 
	 * @return the date joined
	 */
	public Date getDateJoined() {
		return dateJoined;
	}

	/**
	 * Gets the date left.
	 * 
	 * @return the date left
	 */
	public Date getDateLeft() {
		return dateLeft;
	}

	/**
	 * Gets the muted.
	 * 
	 * @return the muted
	 */
	public Boolean getMuted() {
		return muted;
	}

	/**
	 * Gets the room number.
	 * 
	 * @return the room number
	 */
	public String getRoomNumber() {
		return roomNumber;
	}

	/**
	 * Gets the talking.
	 * 
	 * @return the talking
	 */
	public Boolean getTalking() {
		return talking;
	}

	/**
	 * Gets the user number.
	 * 
	 * @return the user number
	 */
	public Integer getUserNumber() {
		return userNumber;
	}	
	
	/**
	 * Copy.
	 * 
	 * @param userToCopy the user to copy
	 */
	private void copy(MeetMeUser userToCopy) {
		callerIdName = userToCopy.getChannel().getCallerId().getName();;
		callerIdNumber = userToCopy.getChannel().getCallerId().getNumber();
		roomNumber = userToCopy.getRoom().getRoomNumber();
		dateJoined = userToCopy.getDateJoined();
		dateLeft = userToCopy.getDateLeft();
		userNumber = userToCopy.getUserNumber();
		muted = userToCopy.isMuted();
		talking = userToCopy.isTalking();
	}	
}
