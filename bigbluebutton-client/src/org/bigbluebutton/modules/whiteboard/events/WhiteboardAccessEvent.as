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
package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	public class WhiteboardAccessEvent extends Event
	{
		public static const MODIFY_WHITEBOARD_ACCESS:String = "MODIFY_WHITEBOARD_ACCESS_EVENT";
		public static const MODIFIED_WHITEBOARD_ACCESS:String = "MODIFIED_WHITEBOARD_ACCESS_EVENT";
		
		public var multiUser:Boolean;
		public var whiteboardId:String;
		
		public function WhiteboardAccessEvent(type:String)
		{
			super(type, false, false);
		}

	}
}