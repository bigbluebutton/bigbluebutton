/** 
*
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
**/
package org.bigbluebutton.screenshare.client.net;

public enum CaptureEvents {
	/**
	 * WARNING: Must match corresponding values with deskshare-app on the server.
	 * org.bigbluebutton.deskshare.CaptureEvents
	 */
	CAPTURE_START(0), CAPTURE_UPDATE(1), CAPTURE_END(2), MOUSE_LOCATION_EVENT(3);
	
	private final int event;
	
	CaptureEvents(int event) {
		this.event = event;
	}
	
	public int getEvent() {
		return event;
	}
	
	@Override
	public String toString() {
		switch (event) {
		case 0:
			return "Capture Start Event";
		case 1:
			return "Capture Update Event";
		case 2: 
			return "Capture End Event";
		}
		
		return "Unknown Capture Event";
	}
}
