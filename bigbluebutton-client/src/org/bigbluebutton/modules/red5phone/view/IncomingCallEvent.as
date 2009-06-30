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
	
	public class IncomingCallEvent extends Event{
	
		public static var INCOMING:String    = "incoming";
		public var source:String;
		public var sourceName:String;
		public var destination:String;
		public var destinationName:String;
		
		public function IncomingCallEvent(type:String, source:String, sourceName:String, destination:String, destinationName:String , bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.source          = source;
			this.sourceName      = sourceName;	
			this.destination     = destination;
			this.destinationName = destinationName;	
		}
		
		public override function clone():Event {
			return new IncomingCallEvent(type, source, sourceName, destination, destinationName, bubbles, cancelable);
		}

	}
}