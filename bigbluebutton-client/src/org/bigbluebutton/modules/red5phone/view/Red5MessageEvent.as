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
package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class Red5MessageEvent extends Event{
		
		public static var MESSAGE:String    = "message";
		public static var NETSTAUS:String   = "netstatus";
		public static var SIP_REGISTER:String 		= "sip_register";
		public static var CALLSTATE:String  = "callstate";
		public var msgType:String;
		public var message:String;
		
		public function Red5MessageEvent(type:String, msgType:String, message:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.msgType = msgType;
			this.message = message;	
		}
		
		public override function clone():Event {
			return new Red5MessageEvent(type, msgType, message, bubbles, cancelable);
		}
	}
}