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
package org.bigbluebutton.freeswitch.voice.events;

public class VoiceUserJoinedEvent extends VoiceConferenceEvent {

	private final String voiceUserId;
	private final String callerIdNum;
	private final String callerIdName;
	private final Boolean muted;
	private final Boolean speaking;
	private final Boolean locked = false;
	private final String userId;
	private final String callingWith;
	
	public VoiceUserJoinedEvent(String userId, String voiceUserId, String room, 
								String callerIdNum, String callerIdName,
								Boolean muted, Boolean speaking, String callingWith) {
		super(room);
		this.userId = userId;
		this.voiceUserId = voiceUserId;
		this.callerIdName = callerIdName;
		this.callerIdNum = callerIdNum;
		this.muted = muted;
		this.speaking = speaking;
		this.callingWith = callingWith;
	}

	public String getUserId() {
		return userId;
	}
	
	public String getVoiceUserId() {
		return voiceUserId;
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

	public String getCallingWith() {
		return callingWith;
	}
}
