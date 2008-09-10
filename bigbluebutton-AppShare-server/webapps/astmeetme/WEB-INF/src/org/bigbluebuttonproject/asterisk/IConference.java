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
package org.bigbluebuttonproject.asterisk;

import java.util.Collection;

import org.bigbluebuttonproject.asterisk.IParticipant;


/**
 * The Interface IConference.
 */
public interface IConference {
	
	/**
	 * Lock.
	 */
	public void lock();
	
	/**
	 * Unlock.
	 */
	public void unlock();
	
	/**
	 * Mute.
	 */
	public void mute();
	
	/**
	 * Unmute.
	 */
	public void unmute();
	
	/**
	 * Checks if is muted.
	 * 
	 * @return true, if is muted
	 */
	public boolean isMuted();
	
	/**
	 * Checks if is locked.
	 * 
	 * @return true, if is locked
	 */
	public boolean isLocked();
	
	/**
	 * Gets the participants.
	 * 
	 * @return the participants
	 */
	public Collection<IParticipant> getParticipants();
}
