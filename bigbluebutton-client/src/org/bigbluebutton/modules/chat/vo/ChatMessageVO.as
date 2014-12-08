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
package org.bigbluebutton.modules.chat.vo
{
	public class ChatMessageVO {
    // The type of chat (PUBLIC or PRIVATE)
    public var chatType:String;
    
    // The sender
    public var fromUserID:String;    
    public var fromUsername:String;
    public var fromColor:String;
    
    // Store the UTC time when the message was sent.
    public var fromTime:Number;    
    // Stores the timezone offset (in minutes) when the message was
    // sent. This is used by the receiver to convert to locale time.
    public var fromTimezoneOffset:Number;
    
    // The receiver. 
    public var toUserID:String = "public_chat_userid";
    public var toUsername:String = "public_chat_username";
    
		public var message:String;
		
    public function toObj():Object {
      var m:Object = new Object();
      m.chatType = chatType;
      m.fromUserID = fromUserID;
      m.fromUsername = fromUsername;
      m.fromColor = fromColor;
      m.fromTime = fromTime;
      m.fromTimezoneOffset = fromTimezoneOffset;
      m.message = message;
      m.toUserID = toUserID;
      m.toUsername = toUsername;
      
      return m;
    }

	}
}