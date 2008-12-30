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
package org.bigbluebutton.conference;


/**
 * Role class keeps enum values of the different roles that the user can take in the conference room.
 * 
 * @author ritzalam
 */

public enum Role {
	
	/** The VIEWER. */
	VIEWER (0, "VIEWER"),
	
	/** The MODERATOR. */
	MODERATOR (1, "MODERATOR"),
	
	/** The ADMINISTRATOR. */
	ADMINISTRATOR (2, "ADMINISTRATOR");
	
	/** The role. */
	private final String role;
	
	/** The value. */
	private final int value;
	
	/**
	 * Instantiates a new role.
	 * 
	 * @param value the value
	 * @param role the role
	 */
	Role(int value, String role) {
		this.value = value;
		this.role = role;
	}
	
	/**
	 * Returns the role string.
	 * @see java.lang.Enum#toString()
	 */
	public String toString() {
		return role;
	}
	
	/**
	 * Value.
	 * 
	 * @return the value assigned for role
	 */
	public int value() {
		return value;
	}
}
