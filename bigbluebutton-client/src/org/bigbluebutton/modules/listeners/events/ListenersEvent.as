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
package org.bigbluebutton.modules.listeners.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.listeners.business.vo.Listeners;

	public class ListenersEvent extends Event
	{
		public static const FIRST_LISTENER_JOINED_EVENT:String = "FIRST_LISTENER_JOINED_EVENT";
		public static const ROOM_MUTE_STATE:String = "ROOM_MUTE_STATE";
		public static const REGISTER_LISTENERS:String = "REGISTER_LISTENERS";
		public static const SET_LOCAL_MODERATOR_STATUS:String = "SET_LOCAL_MODERATOR";
		
		public var mute_state:Boolean;
		public var listeners:Listeners;
		public var moderator:Boolean;
		
		public function ListenersEvent(type:String)
		{
			super(type, true, false);
		}
	}
}