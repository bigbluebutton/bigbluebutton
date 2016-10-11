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
package org.bigbluebutton.main.events {

	import flash.events.Event;

	public class BreakoutRoomEvent extends Event {
		public static const OPEN_BREAKOUT_ROOMS_PANEL:String = "OPEN_BREAKOUT_ROOMS_PANEL";

		public static const CREATE_BREAKOUT_ROOMS:String = "CREATE_BREAKOUT_ROOMS";

		public static const REQUEST_BREAKOUT_JOIN_URL:String = "REQUEST_BREAKOUT_JOIN_URL";

		public static const BREAKOUT_JOIN_URL:String = "BREAKOUT_JOIN_URL";

		public static const LISTEN_IN:String = "LISTEN_IN";

		public static const END_ALL_BREAKOUT_ROOMS:String = "END_ALL_BREAKOUT_ROOMS";

		public static const UPDATE_REMAINING_TIME_PARENT:String = "UPDATE_REMAINING_TIME_PARENT";

		public static const UPDATE_REMAINING_TIME_BREAKOUT:String = "UPDATE_REMAINING_TIME_BREAKOUT";

		public var meetingId:String;

		public var breakoutMeetingId:String;
		
		public var breakoutMeetingSequence:int;

		public var rooms:Array;

		public var durationInMinutes:int;

		public var record:Boolean;

		public var joinURL:String;

		public var listen:Boolean;

		public var joinMode:String;

		public var userId:String;

		public function BreakoutRoomEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
		}
	}
}
