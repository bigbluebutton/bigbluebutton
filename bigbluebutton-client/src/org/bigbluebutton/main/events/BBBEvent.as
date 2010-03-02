/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class BBBEvent extends Event
	{
		public static const LOGIN_EVENT:String = 'loginEvent';
		public static const RECEIVED_PUBLIC_CHAT_MESSAGE_EVENT:String = 'RECEIVED_PUBLIC_CHAT_MESSAGE_EVENT';
		public static const SEND_PUBLIC_CHAT_MESSAGE_EVENT:String = 'SEND_PUBLIC_CHAT_MESSAGE_EVENT';
		public static const JOIN_VOICE_CONFERENCE:String = 'BBB_JOIN_VOICE_CONFERENCE';
		public static const ADDED_LISTENER:String = 'BBB_ADDED_LISTENER';
		
		public var message:String;
		
		public function BBBEvent(type:String, message:String = "", bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			this.message = message;
		}
		
	}
}