/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
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
package org.bigbluebutton.freeswitch.voice.commands;

public class MuteUserCommand extends ConferenceCommand {

	private final Integer participantId;
	private final boolean mute;
	
	public MuteUserCommand(String room, Integer requesterId, Integer participantId, boolean mute) {
		super(room, requesterId);
		this.participantId = participantId;
		this.mute = mute;
	}

	public Integer getParticipantId() {
		return participantId;
	}

	public boolean isMute() {
		return mute;
	}

}
