/**
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
*/
package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class SendPrivateChatMessageEvent extends Event
	{
		public static const SEND_PRIVATE_CHAT_MESSAGE_EVENT:String = 'SEND_PRIVATE_CHAT_MESSAGE_EVENT';
		public var message:String;
		public var toUser:String;
		public var time:String;
		public var color:String;
		public var language:String;
	        public var reverse:Boolean;	

		public function SendPrivateChatMessageEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}