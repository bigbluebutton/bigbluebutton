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
	private String internalID;
	private String externalID;
	private String name;
	private String role;
	private Map<String,String> customData;
	
	private Map<String,String> status;
	
	public User(String internalID, String externalID, String name, String role) {
		this.internalID = internalID;
		this.externalID = externalID;
		this.name = name;
		this.role = role;
		this.status = new ConcurrentHashMap<String, String>();
	}
	
	public String getInternalID() {
		return this.internalID;
	}
	public void setInternalID(String internalID) {
		this.internalID = internalID;
	}
	
	public String getExternalID(){
		return this.externalID;
	}
	
	public void setExternalID(String externalID){
		this.externalID = externalID;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
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
}
