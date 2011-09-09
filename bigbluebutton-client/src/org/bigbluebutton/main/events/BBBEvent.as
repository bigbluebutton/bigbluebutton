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
package org.bigbluebutton.main.events {
	import flash.events.Event;

	public class BBBEvent extends Event {
		public static const END_MEETING_EVENT:String = 'END_MEETING_EVENT';
		public static const LOGIN_EVENT:String = 'loginEvent';
		public static const RECEIVED_PUBLIC_CHAT_MESSAGE_EVENT:String = 'RECEIVED_PUBLIC_CHAT_MESSAGE_EVENT';
		public static const SEND_PUBLIC_CHAT_MESSAGE_EVENT:String = 'SEND_PUBLIC_CHAT_MESSAGE_EVENT';
		public static const JOIN_VOICE_CONFERENCE:String = 'BBB_JOIN_VOICE_CONFERENCE';
		public static const ADDED_LISTENER:String = 'BBB_ADDED_LISTENER';
		public static const PRESENTATION_CONVERTED:String = 'BBB_PRESENTATION_CONVERTED';
		public static const START_VIDEO_CONNECTION:String = 'BBB_START_VIDEO_CONNECTION';
		public static const START_VIDEO_STREAM:String = 'BBB_START_VIDEO_STREAM';
		public static const VIDEO_STARTED:String = 'BBB_VIDEO_STARTED';
		public static const START_DESKSHARE:String = 'BBB_START_DESKSHARE';
		public static const DESKSHARE_STARTED:String = 'BBB_DESKSHARE_STARTED';
		
		public var message:String;
		public var payload:Object = new Object();
		
		public function BBBEvent(type:String, message:String = "", bubbles:Boolean=true, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
			this.message = message;
		}		
	}
}