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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class User {
	private String internalUserId;
	private String externalUserId;
	private String fullname;
	private String role;
	private Map<String,String> status;
	
	public User(String internalUserId, String externalUserId, String fullname, String role) {
		this.internalUserId = internalUserId;
		this.externalUserId = externalUserId;
		this.fullname = fullname;
		this.role = role;
		this.status = new ConcurrentHashMap<String, String>();
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

	public boolean isModerator() {
		return this.role.equalsIgnoreCase("MODERATOR");
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
			return isPresenter.equalsIgnoreCase("true");
		}
		return false;
	}

	public boolean hasStream() {
		String hasStream = this.status.get("hasStream");
		if (hasStream != null) {
			// hasStream example: "false,stream=320x24038-1328716010847"
			String[] a = hasStream.split(",");
			return (a.length > 0) && (a[0].equalsIgnoreCase("true"));
		}
		return false;
	}

	public String getStreamName() {
		if (this.hasStream()) {
			// hasStream example: "true,stream=320x24038-1328716010847"
			String str = this.status.get("hasStream");
			int pos = str.indexOf("stream=");
			return str.substring(pos + 7, str.length());
		}
		return "";
	}
}
