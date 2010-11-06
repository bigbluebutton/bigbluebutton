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
package org.bigbluebutton.webconference.voice.events;

public class ParticipantJoinedEvent extends ConferenceEvent {

	private final String callerIdNum;
	private final String callerIdName;
	private final Boolean muted;
	private final Boolean speaking;
	private final Boolean locked = false;
	
	public ParticipantJoinedEvent(Integer participantId, String room, 
								String callerIdNum, String callerIdName,
								Boolean muted, Boolean speaking) {
		super(participantId, room);
		this.callerIdName = callerIdName;
		this.callerIdNum = callerIdNum;
		this.muted = muted;
		this.speaking = speaking;
	}

	public String getCallerIdNum() {
		return callerIdNum;
	}

	public String getCallerIdName() {
		return callerIdName;
	}

	public Boolean getMuted() {
		return muted;
	}

	public Boolean getSpeaking() {
		return speaking;
	}

	public Boolean isLocked() {
		return locked;
	}
}
