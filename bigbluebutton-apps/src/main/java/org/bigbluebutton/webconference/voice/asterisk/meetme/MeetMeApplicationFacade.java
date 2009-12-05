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
 * Author: Richard Alam <ritzalam@gmail.com>
 * 
 * $Id: $
 */
package org.bigbluebutton.webconference.voice.asterisk.meetme;

import org.bigbluebutton.webconference.voice.ConferenceApplication;

public class MeetMeApplicationFacade implements ConferenceApplication {

	private MeetMeApplication meetme;
	
	@Override
	public void eject(String room, Integer participant) {
		meetme.kick(participant, room);
	}

	@Override
	public void mute(String room, Integer participant, Boolean mute) {
		meetme.mute(participant, room, mute);
	}

	@Override
	public void populateRoom(String room) {
		meetme.initializeRoom(room);
	}

	@Override
	public void shutdown() {
		meetme.shutdown();
	}

	@Override
	public void startup() {
		meetme.startup();
	}

	public void setMeetMeApplication(MeetMeApplication meetme) {
		this.meetme = meetme;
	}
}
