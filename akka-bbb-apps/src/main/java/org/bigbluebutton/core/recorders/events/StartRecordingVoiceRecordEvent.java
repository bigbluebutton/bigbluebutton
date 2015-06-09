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

public class StartRecordingVoiceRecordEvent extends AbstractVoiceRecordEvent {
	
	public StartRecordingVoiceRecordEvent(boolean record) {
		super();
		if (record)
			setEvent("StartRecordingEvent");
		else
			setEvent("StopRecordingEvent");
	}
	
	public void setRecordingTimestamp(String timestamp) {
		eventMap.put("recordingTimestamp", timestamp);
	}
		
	public void setFilename(String filename) {
		eventMap.put("filename", filename);
	}
}
