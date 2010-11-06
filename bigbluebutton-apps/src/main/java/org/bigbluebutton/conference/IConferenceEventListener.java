/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
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

	@Gateway(requestChannel="participantsUpdated")
	void participantsUpdated(Room room);	
}
