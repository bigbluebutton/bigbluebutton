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

	public class ChangeStatusEvent extends Event
	{
		public static const CHANGE_STATUS:String = "CHANGE_STATUS_EVENT";

		public static const CLEAR_STATUS:String = "CLEAR_STATUS";
		public static const RAISE_HAND:String = "RAISE_HAND";
		public static const AGREE:String = "AGREE";
		public static const DISAGREE:String = "DISAGREE";
		public static const SPEAK_LOUDER:String = "SPEAK_LOUDER";
		public static const SPEAK_LOWER:String = "SPEAK_LOWER";
		public static const SPEAK_FASTER:String = "SPEAK_FASTER";
		public static const SPEAK_SLOWER:String = "SPEAK_SLOWER";
		public static const BE_RIGHT_BACK:String = "BE_RIGHT_BACK";
		public static const LAUGHTER:String = "LAUGHTER";
		public static const SAD:String = "SAD";

		private var status:String;
		public var userId:String;
		
		public function ChangeStatusEvent(id:String,status:String)
		{	
			userId = id;
			this.status = status;
			super(CHANGE_STATUS, true, false);
		}

		public function getStatusName():String
		{
			return status;
		}
	}
}
