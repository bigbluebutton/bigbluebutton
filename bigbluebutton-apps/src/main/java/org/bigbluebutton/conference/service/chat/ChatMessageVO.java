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
package org.bigbluebutton.conference.service.chat;

import java.util.HashMap;
import java.util.Map;

public class ChatMessageVO {
    // The type of chat (PUBLIC or PRIVATE)
    public String chatType;
    
    // The sender
    public String fromUserID;    
    public String fromUsername;
    public String fromColor;
    
    // Stores the UTC time (milliseconds) when the message was sent.
    public Double fromTime;   
    // Stores the timezone offset (minutes) when the message was sent.
    // This will be used by receiver to convert to locale time.
    public Long fromTimezoneOffset;
    
    public String fromLang; 
    
    // The receiver. For PUBLIC chat this is empty
    public String toUserID = "";
    public String toUsername = "";
    
	public String message;

			
	public Map<String, Object> toMap() {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("fromUserID", fromUserID);
		msg.put("fromUsername", fromUsername);
		msg.put("fromColor", fromColor);
		msg.put("fromTime", fromTime);
		msg.put("fromLang", fromLang);
		msg.put("fromTime", fromTime);
		msg.put("fromTimezoneOffset", fromTimezoneOffset);
		msg.put("chatType", chatType);
		msg.put("message", message);
		msg.put("toUserID", toUserID);
		msg.put("toUsername", toUsername);
		
		return msg;
	}
}
