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
package org.bigbluebutton.red5.client.messaging;

import java.util.ArrayList;

public class SharedObjectClientMessage implements ClientMessage {
	public static final String BROADCAST = "broadcast";
	public static final String DIRECT = "direct";
	public static final String SHAREDOBJECT = "sharedobject";
	
	private String meetingID;
	private String sharedObjectName;
	private ArrayList<Object> message;
	private String messageName;
	
	public SharedObjectClientMessage(String meetingID, String sharedObjectName, String messageName, ArrayList<Object> message) {
		this.meetingID = meetingID;
		this.message = message;
		this.sharedObjectName = sharedObjectName;
		this.messageName = messageName;
	}
	
	public void setSharedObjectName(String name) {
		sharedObjectName = name;
	}
	
	public String getSharedObjectName() {
		return sharedObjectName;
	}
	
	public String getMeetingID() {
		return meetingID;
	}
		
	public String getMessageName() {
		return messageName;
	}
	
	public ArrayList<Object> getMessage() {
		return message;
	}
}
