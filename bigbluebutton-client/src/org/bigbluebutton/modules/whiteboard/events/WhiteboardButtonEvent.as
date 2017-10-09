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
	
	public class WhiteboardButtonEvent extends Event
	{
		public static const ENABLE_WHITEBOARD:String = "enable_whiteboard";
		public static const DISABLE_WHITEBOARD:String = "disable_whiteboard";
		
		public static const WHITEBOARD_BUTTON_PRESSED:String = "WhiteboardButtonPressedEvent";
		
		public var toolType:String;
		public var graphicType:String;
		
		public function WhiteboardButtonEvent(type:String)
		{
			super(type, true, false);
		}

	}
}