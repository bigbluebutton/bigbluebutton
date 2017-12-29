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

package org.bigbluebutton.api.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class User {
	private String internalUserId;
	private String externalUserId;
	private String fullname;
	private String role;
	private String avatarURL;
	private Map<String,String> status;
	private Boolean guest;
	private String  guestStatus;
	private Boolean listeningOnly = false;
	private Boolean voiceJoined = false;
	private List<String> streams;
	
	public User(String internalUserId,
				String externalUserId, String fullname,
				String role, String avatarURL,
				Boolean guest, String  guestStatus) {
		this.internalUserId = internalUserId;
		this.externalUserId = externalUserId;
		this.fullname = fullname;
		this.role = role;
		this.avatarURL = avatarURL;
		this.guest = guest;
		this.guestStatus = guestStatus;
		this.status = new ConcurrentHashMap<>();
		this.streams = Collections.synchronizedList(new ArrayList<String>());
	}

	public String getInternalUserId() {
		return this.internalUserId;
	}
	public void setInternalUserId(String internalUserId) {
		this.internalUserId = internalUserId;
	}
	
	public String getExternalUserId(){
		return this.externalUserId;
	}
	
	public void setExternalUserId(String externalUserId){
		this.externalUserId = externalUserId;
	}

	public void setGuest(Boolean guest) {
		this.guest = guest;
	}

	public Boolean isGuest() {
		return this.guest;
	}

	public void setGuestStatus(String guestStatus) {
		this.guestStatus = guestStatus;
	}

	public String getGuestStatus() {
		return this.guestStatus;
	}
	
	public String getFullname() {
		return fullname;
	}
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}

	public String getAvatarUrl() {
		return avatarURL;
	}

	public void setAvatarUrl(String avatarURL) {
		this.avatarURL = avatarURL;
	}

	public boolean isModerator() {
		return "MODERATOR".equalsIgnoreCase(this.role);
	}
	
	public void setStatus(String key, String value){
		this.status.put(key, value);
	}
	public void removeStatus(String key){
		this.status.remove(key);
	}
	public Map<String,String> getStatus(){
		return this.status;
	}

	public boolean isPresenter() {
		String isPresenter = this.status.get("presenter");
		if (isPresenter != null) {
			return "true".equalsIgnoreCase(isPresenter);
		}
		return false;
	}
	
	public void addStream(String stream) {
		streams.add(stream);
	}
	
	public void removeStream(String stream) {
		streams.remove(stream);
	}
	
	public List<String> getStreams() {
		return streams;
	}

    public Boolean hasVideo() {
        return !this.getStreams().isEmpty();
    }

	public Boolean isListeningOnly() {
		return listeningOnly;
	}

	public void setListeningOnly(Boolean listeningOnly) {
		this.listeningOnly = listeningOnly;
	}

	public Boolean isVoiceJoined() {
		return voiceJoined;
	}

	public void setVoiceJoined(Boolean voiceJoined) {
		this.voiceJoined = voiceJoined;
	}
}
