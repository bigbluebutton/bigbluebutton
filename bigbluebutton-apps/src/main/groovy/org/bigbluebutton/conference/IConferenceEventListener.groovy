/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * $Id: $
 */
package org.bigbluebutton.conference;

import org.springframework.integration.annotation.Gateway;

/*
 * TODO: perhaps this should actually be merged with IRoomListener
 * in some way, but for now I am using it to test the Spring Integration / JMS
 * stuff.  (JRT - 09/26/2009)
 */
public interface IConferenceEventListener {

	@Gateway(requestChannel="conferenceStarted")
	void started(Room room);
	
	@Gateway(requestChannel="conferenceEnded")
	void ended(Room room);
	
	/*
	void participantJoined(Room room, Participant participant);
	
	void participantLeft(Room room, Participant participant);
	*/
}
