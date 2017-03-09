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
 package org.bigbluebutton.main.model.users.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.core.vo.CameraSettingsVO;
	
	public class BroadcastStartedEvent extends Event
	{
		public static const BROADCAST_STARTED_EVENT:String = "BROADCAST_STARTED_EVENT";
		
		public var stream:String;
		public var userid:String;
		public var isPresenter:Boolean;
		public var camSettings:CameraSettingsVO;
    
		public function BroadcastStartedEvent(type:String = BROADCAST_STARTED_EVENT) {
			super(type, true, false);
		}

	}
}