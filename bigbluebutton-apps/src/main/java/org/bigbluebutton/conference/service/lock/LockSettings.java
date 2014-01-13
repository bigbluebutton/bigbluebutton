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
package org.bigbluebutton.conference.service.lock;

import java.util.HashMap;
import java.util.Map;

public class LockSettings {
	private Boolean allowModeratorLocking;
	private Boolean disableCam;
	private Boolean disableMic;
	private Boolean disablePrivateChat;
	private Boolean disablePublicChat;
	
	/**
	 * Read a map object received from client 
	 * */
	public LockSettings(Map<String, Boolean> lsMap) {
		if(lsMap.containsKey("allowModeratorLocking"))
			allowModeratorLocking = lsMap.get("allowModeratorLocking");
		else
			allowModeratorLocking = true;
		
		if(lsMap.containsKey("disableCam"))
			disableCam = lsMap.get("disableCam");
		else
			disableCam = true;
			
		if(lsMap.containsKey("disableMic"))
			disableMic = lsMap.get("disableMic");
		else
			disableMic = true;
			
		if(lsMap.containsKey("disablePrivateChat"))
			disablePrivateChat = lsMap.get("disablePrivateChat");
		else
			disablePrivateChat = true;
			
		if(lsMap.containsKey("disablePublicChat"))
			disablePublicChat = lsMap.get("disablePublicChat");
		else
			disablePublicChat = true;
	}
	
	/**
	 * Create a map object to be sent to client 
	 * */
	public Map<String, Boolean> toMap() {
		HashMap<String, Boolean> lsMap = new HashMap<String, Boolean>();
		lsMap.put("allowModeratorLocking", allowModeratorLocking);
		lsMap.put("disableCam", disableCam);
		lsMap.put("disableMic", disableMic);
		lsMap.put("disablePrivateChat", disablePrivateChat);
		lsMap.put("disablePublicChat", disablePublicChat);
		
		return lsMap;
	}
	
	public Boolean getDisableMic() {
		return disableMic;
	}

	public void setDisableMic(Boolean disableMic) {
		this.disableMic = disableMic;
	}

	public Boolean getDisableCam() {
		return disableCam;
	}

	public void setDisableCam(Boolean disableCam) {
		this.disableCam = disableCam;
	}

	public Boolean getDisablePublicChat() {
		return disablePublicChat;
	}

	public void setDisablePublicChat(Boolean disablePublicChat) {
		this.disablePublicChat = disablePublicChat;
	}

	public Boolean getDisablePrivateChat() {
		return disablePrivateChat;
	}

	public void setDisablePrivateChat(Boolean disablePrivateChat) {
		this.disablePrivateChat = disablePrivateChat;
	}

	public Boolean getAllowModeratorLocking() {
		return allowModeratorLocking;
	}

	public void setAllowModeratorLocking(Boolean allowModeratorLocking) {
		this.allowModeratorLocking = allowModeratorLocking;
	}
}
