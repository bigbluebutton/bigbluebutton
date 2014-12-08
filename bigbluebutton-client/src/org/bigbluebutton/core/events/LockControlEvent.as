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
package org.bigbluebutton.core.events
{
	import flash.events.Event;

	public class LockControlEvent extends Event
	{
		public static const LOCK_ALL:String = "LOCKCONTROL_LOCK_ALL";
		public static const UNLOCK_ALL:String = "LOCKCONTROL_UNLOCK_ALL";
		
		public static const LOCK_ALMOST_ALL:String = "LOCKCONTROL_LOCK_ALMOST_ALL";
		
		public static const LOCK_USER:String = "LOCKCONTROL_LOCK_USER";
		public static const UNLOCK_USER:String = "LOCKCONTROL_UNLOCK_USER";
		
		public static const OPEN_LOCK_SETTINGS:String = "LOCKCONTROL_OPEN_LOCK_SETTINGS";
		public static const SAVE_LOCK_SETTINGS:String = "LOCKCONTROL_SAVE_LOCK_SETTINGS";
		
		public static const CHANGED_LOCK_SETTINGS:String = "LOCKCONTROL_CHANGED_LOCK_SETTINGS";
		
		
		public var internalUserID:String;
		public var payload:Object;
		
		public function LockControlEvent(type:String)
		{
			super(type, true, false);
		}
	}
}