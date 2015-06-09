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

public class ParticipantJoinedVoiceRecordEvent extends AbstractVoiceRecordEvent {
	
	public ParticipantJoinedVoiceRecordEvent() {
		super();
		setEvent("ParticipantJoinedEvent");
	}

	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
	
	public void setCallerName(String name) {
		eventMap.put("callername", name);
	}
	
	public void setCallerNumber(String name) {
		eventMap.put("callernumber", name);
	}	
	
	public void setMuted(boolean muted) {
		eventMap.put("muted", Boolean.toString(muted));
	}
	
	public void setTalking(boolean talking) {
		eventMap.put("talking", Boolean.toString(talking));
	}
	
	public void setLocked(boolean locked) {
		eventMap.put("locked", Boolean.toString(locked));
	}
}
