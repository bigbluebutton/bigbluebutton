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

public class BigBlueButtonSession {
	private final String username;
	private final String role;
	private final String conference;
	private final String room;
	private final String internalUserID;
	private final long clientID;
	private final String sessionName;
	private final String voiceBridge;
	private final Boolean record;
	private final String externalUserID;
	
	public BigBlueButtonSession(String sessionName, long clientID, String internalUserID, String username, 
				String role, String conference, String room, String voiceBridge, Boolean record, 
				String externalUserID){
		this.internalUserID = internalUserID;
		this.sessionName = sessionName;
		this.username = username;
		this.role = role;
		this.conference = conference;
		this.room = room;
		this.clientID = clientID;
		this.voiceBridge = voiceBridge;
		this.record = record;
		this.externalUserID = externalUserID;
	}

	public String getUsername() {
		return username;
	}

	public String getRole() {
		return role;
	}

	public String getConference() {
		return conference;
	}

	public String getRoom() {
		return room;
	}

	public String getInternalUserID() {
		return internalUserID;
	}
	
	public long getClientID() {
		return clientID;
	}

	public String getSessionName() {
		return sessionName;
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
}
