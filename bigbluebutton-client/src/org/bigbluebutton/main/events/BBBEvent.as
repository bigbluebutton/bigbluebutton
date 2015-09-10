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
	public static const ERASE_CAMERA_SETTING:String = "ERASE_CAMERA_SETTING";
    public static const OPEN_WEBCAM_PREVIEW:String = "open webcam preview event";
	public static const MIC_SETTINGS_CLOSED:String = "MIC_SETTINGS_CLOSED";
	public static const CAM_SETTINGS_CLOSED:String = "CAM_SETTINGS_CLOSED";
	public static const JOIN_VOICE_FOCUS_HEAD:String = "JOIN_VOICE_FOCUS_HEAD";
	public static const CHANGE_RECORDING_STATUS:String = "CHANGE_RECORDING_STATUS";
   
		public static const RECONNECT_DISCONNECTED_EVENT:String = "RECONNECT_ON_DISCONNECTED_EVENT";
		public static const RECONNECT_CONNECTION_ATTEMPT_FAILED_EVENT:String = "RECONNECT_CONNECTION_ATTEMPT_FAILED_EVENT";
		public static const RECONNECT_CONNECTION_ATTEMPT_SUCCEEDED_EVENT:String = "RECONNECT_CONNECTION_ATTEMPT_SUCCEEDED_EVENT";

		public static const RECONNECT_BIGBLUEBUTTON_SUCCEEDED_EVENT:String = "RECONNECT_BIGBLUEBUTTON_SUCCEEDED_EVENT";
		public static const RECONNECT_VIDEO_SUCCEEDED_EVENT:String = "RECONNECT_VIDEO_SUCCEEDED_EVENT";
		public static const RECONNECT_SIP_SUCCEEDED_EVENT:String = "RECONNECT_SIP_SUCCEEDED_EVENT";
		public static const RECONNECT_DESKSHARE_SUCCEEDED_EVENT:String = "RECONNECT_DESKSHARE_SUCCEEDED_EVENT";

		public static const CANCEL_RECONNECTION_EVENT:String = "CANCEL_RECONNECTION_EVENT";

		public var message:String;
		public var payload:Object = new Object();
		
		public function BBBEvent(type:String, message:String = "", bubbles:Boolean=true, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
			this.message = message;
		}		
	}
}
