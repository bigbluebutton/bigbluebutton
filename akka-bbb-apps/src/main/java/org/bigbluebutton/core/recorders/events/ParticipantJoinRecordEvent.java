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
package org.bigbluebutton.core.recorders.events;

public class ParticipantJoinRecordEvent extends AbstractParticipantRecordEvent {

	public ParticipantJoinRecordEvent() {
		super();
		setEvent("ParticipantJoinEvent");
	}
		
	public void setUserId(String userId) {
		eventMap.put("userId", userId);
	}

	public void setExternalUserId(String externalUserId) {
		eventMap.put("externalUserId", externalUserId);
	}
	
	public void setName(String name){
		eventMap.put("name",name);
	}
	
	/**
	 * Sets the role of the user as MODERATOR or VIEWER
	 * @param role
	 */
	public void setRole(String role) {
		eventMap.put("role", role);
	}
	
	public void setStatus(String status) {
		eventMap.put("status", status);
	}
}
