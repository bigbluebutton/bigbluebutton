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

package org.bigbluebutton.red5;

public class BigBlueButtonSession {
	private final String username;
	private final String role;
	private final String room;
	private final String internalUserID;
	private final String voiceBridge;
	private final Boolean record;
	private final String externalUserID;
	private final Boolean startAsMuted;
	private final String sessionId;
	private final Boolean guest;
	private final String authToken;

	public BigBlueButtonSession(String room, String internalUserID, String username, 
				String role, String voiceBridge, Boolean record, 
				String externalUserID, Boolean startAsMuted, String sessionId, Boolean guest, String authToken) {
		this.internalUserID = internalUserID;
		this.username = username;
		this.role = role;
		this.room = room;
		this.voiceBridge = voiceBridge;
		this.record = record;
		this.externalUserID = externalUserID;
		this.startAsMuted = startAsMuted;
		this.sessionId = sessionId;
		this.guest = guest;
		this.authToken = authToken;
	}

	public String getUsername() {
		return username;
	}

	public String getRole() {
		return role;
	}

	public String getRoom() {
		return room;
	}

	public String getInternalUserID() {
		return internalUserID;
	}
	
	public String getVoiceBridge() {
		return voiceBridge;
	}

	public Boolean getRecord() {
		return record;
	}

	public String getExternUserID() {
		return externalUserID;
	}

	public Boolean getStartAsMuted() {
		return startAsMuted;
	}
	
	public String getSessionId() {
	  return sessionId;
	}

	public Boolean isGuest() {
		return guest;
	}

	public String getAuthToken() {
		return authToken;
	}
}
