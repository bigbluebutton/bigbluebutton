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
package org.bigbluebutton.conference;

import java.util.Map;

public class ClientMessage {
	public static final String BROADCAST = "broadcast";
	public static final String DIRECT = "direct";
	public static final String SHAREDOBJECT = "sharedobject";
	
	private String type;
	private String dest;
	private Map<String, Object> message;
	private String messageName;
	
	public ClientMessage(String type, String dest, String messageName, Map<String, Object> message) {
		this.type = type;
		this.dest = dest;
		this.message = message;
		this.messageName = messageName;
	}
	
	public String getType() {
		return type;
	}
	
	public String getDest() {
		return dest;
	}
	
	public String getMessageName() {
		return messageName;
	}
	
	public Map<String, Object> getMessage() {
		return message;
	}
}
