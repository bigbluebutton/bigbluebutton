/** 
* ===License Header===
*
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
* ===License Header===
*/
package org.bigbluebutton.webconference.voice.asterisk.meetme;

import org.bigbluebutton.webconference.voice.ConferenceServiceProvider;

public class MeetMeApplication implements ConferenceServiceProvider {

	private MeetMeApplicationAdapter meetme;
	
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

	public void setMeetMeApplicationAdapter(MeetMeApplicationAdapter meetme) {
		this.meetme = meetme;
	}
}
