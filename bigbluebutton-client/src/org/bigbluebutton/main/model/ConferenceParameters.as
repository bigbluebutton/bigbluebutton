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
package org.bigbluebutton.main.model {
	
	/**
	 * The ConferenceParameters class holds attributes that define the conference. You can access them in your module through the
	 * attributes property that is passed to your IBigBlueButtonModule instance on startup.
	 *
	 */
	public class ConferenceParameters {
		public var meetingName:String;
		
		public var externMeetingID:String;
		
		/**
		 * True if the room is a breakout room.
		 */
		public var isBreakout:Boolean;
		
		/**
		 * The name of the conference
		 */
		public var conference:String;
		
		/**
		 * The username of the local user
		 */
		public var username:String;
		
		public var avatarURL:String;
		/**
		 * The role of the local user. Could be MODERATOR or VIEWER
		 */
		public var role:String;
		
		/**
		 * The room unique id, as specified in the API /create call.
		 */
		public var room:String;
		
		/**
		 * Voice conference bridge for the client
		 */
		public var webvoiceconf:String;
		
		/**
		 * Voice conference bridge that external SIP clients use. Usually the same as webvoiceconf
		 */
		public var voicebridge:String;
		
		/**
		 *  The welcome string, as passed in through the API /create call.
		 */
		public var welcome:String;
		
		public var meetingID:String;
		
		/**
		 * External unique user id.
		 */
		public var externUserID:String;
		
		/**
		 * Internal unique user id.
		 */
		public var internalUserID:String;
		
		public var logoutUrl:String;
		
		/**
		 * The unique userid internal to bbb-client.
		 */
		public var userid:String;
		
		public var record:Boolean;
		
		/**
		 * Flag used to start room as muted
		 * */
		public var muteOnStart:Boolean;
		
		/**
		 * Parameter used to send initial lock settings
		 * */
		public var lockSettings:Object;
		
		public var authToken:String;
	}
}
