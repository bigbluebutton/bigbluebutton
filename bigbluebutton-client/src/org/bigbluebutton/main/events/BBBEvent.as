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

	public class BBBEvent extends Event {    
    
		public static const END_MEETING_EVENT:String = 'END_MEETING_EVENT';
		public static const LOGIN_EVENT:String = 'loginEvent';
		public static const RECEIVED_PUBLIC_CHAT_MESSAGE_EVENT:String = 'RECEIVED_PUBLIC_CHAT_MESSAGE_EVENT';
		public static const SEND_PUBLIC_CHAT_MESSAGE_EVENT:String = 'SEND_PUBLIC_CHAT_MESSAGE_EVENT';
		public static const JOIN_VOICE_CONFERENCE:String = 'BBB_JOIN_VOICE_CONFERENCE';
		public static const START_VIDEO_CONNECTION:String = 'BBB_START_VIDEO_CONNECTION';
		public static const START_VIDEO_STREAM:String = 'BBB_START_VIDEO_STREAM';
		public static const VIDEO_STARTED:String = 'BBB_VIDEO_STARTED';
		public static const START_DESKSHARE:String = 'BBB_START_DESKSHARE';
		public static const DESKSHARE_STARTED:String = 'BBB_DESKSHARE_STARTED';
    public static const USER_VOICE_JOINED:String = 'user voice joined event';
		public static const USER_VOICE_MUTED:String = "user voice muted event";
    public static const USER_LOCKED:String = "user locked event";
    public static const USER_VOICE_LEFT:String = "user voice left event";
    public static const USER_VOICE_TALKING:String = "user voice talking event";
    public static const CAMERA_SETTING:String = "camera settings event";
    public static const OPEN_WEBCAM_PREVIEW:String = "open webcam preview event";
	public static const MIC_SETTINGS_CLOSED:String = "MIC_SETTINGS_CLOSED";
	public static const CAM_SETTINGS_CLOSED:String = "CAM_SETTINGS_CLOSED";
	public static const JOIN_VOICE_FOCUS_HEAD:String = "JOIN_VOICE_FOCUS_HEAD";
	public static const CHANGE_RECORDING_STATUS:String = "CHANGE_RECORDING_STATUS";

		public static const SETTINGS_CONFIRMED:String = "BBB_SETTINGS_CONFIRMED";
		public static const SETTINGS_CANCELLED:String = "BBB_SETTINGS_CANCELLED";

		public static const ACCEPT_ALL_WAITING_GUESTS:String = "BBB_ACCEPT_ALL_WAITING_GUESTS";
		public static const DENY_ALL_WAITING_GUESTS:String = "BBB_DENY_ALL_WAITING_GUESTS";
		public static const BROADCAST_GUEST_POLICY:String = "BBB_BROADCAST_GUEST_POLICY";
		public static const RETRIEVE_GUEST_POLICY:String = "BBB_RETRIEVE_GUEST_POLICY";
		public static const MODERATOR_ALLOWED_ME_TO_JOIN:String = "MODERATOR_ALLOWED_ME_TO_JOIN";
		public static const WAITING_FOR_MODERATOR_ACCEPTANCE:String = "WAITING_FOR_MODERATOR_ACCEPTANCE";
		public static const ADD_GUEST_TO_LIST:String = "ADD_GUEST_TO_LIST";
		public static const REMOVE_GUEST_FROM_LIST:String = "REMOVE_GUEST_FROM_LIST";
   
		public var message:String;
		public var payload:Object = new Object();
		
		public function BBBEvent(type:String, message:String = "", bubbles:Boolean=true, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
			this.message = message;
		}		
	}
}