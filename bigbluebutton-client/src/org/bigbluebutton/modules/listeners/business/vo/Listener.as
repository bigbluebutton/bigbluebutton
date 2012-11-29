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
package org.bigbluebutton.modules.listeners.business.vo {
	[Bindable]
	public class Listener {
		public var room:String;
		public var callerName:String;
		public var callerNumber:String;
		public var dateJoined:Date;
		public var dateLeft:Date;
		public var userid:Number;
		public var muted:Boolean;
		public var talking:Boolean;		
		public var locked:Boolean;
		// Stores if the participant is moderator or not.
		// This is not the role of the joining listener
		// but of the participant running the client.
		public var moderator:Boolean = false;	
	}
}