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
package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	public class MadePresenterEvent extends Event
	{
		public static const PRESENTER_NAME_CHANGE:String = "PRESENTER_NAME_CHANGE";
		public static const SWITCH_TO_VIEWER_MODE:String = "VIEWER_MODE";
		public static const SWITCH_TO_PRESENTER_MODE:String = "PRESENTER_MODE";
		
		public var presenterName:String;
		public var assignedBy:String;
		public var userID:String;
		
		public function MadePresenterEvent(type:String)
		{
			super(type, true, false);
		}

	}
}