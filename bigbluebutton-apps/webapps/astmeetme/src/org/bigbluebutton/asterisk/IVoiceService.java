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
package org.bigbluebutton.asterisk;

import java.util.Collection;

import org.asteriskjava.live.AsteriskServerListener;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeUser;


/**
 * The Interface IVoiceService.
 */
public interface IVoiceService {
	
	/**
	 * Start.
	 */
	public void start();
	
	/**
	 * Stop.
	 */
	public void stop();
	
	/**
	 * Gets the conference.
	 * 
	 * @param id the id
	 * 
	 * @return the conference
	 */
	public IConference getConference(String id);
	
	/**
	 * Gets the users.
	 * 
	 * @param roomId the room id
	 * 
	 * @return the users
	 */
	public Collection<MeetMeUser> getUsers(String roomId);
	
	/**
	 * Adds the asterisk server listener.
	 * 
	 * @param listener the listener
	 * 
	 * @throws ManagerCommunicationException the manager communication exception
	 */
	public void addAsteriskServerListener(AsteriskServerListener listener) throws ManagerCommunicationException;
	
}