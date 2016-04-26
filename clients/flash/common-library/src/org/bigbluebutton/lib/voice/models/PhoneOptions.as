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
package org.bigbluebutton.lib.voice.models {
	
	public class PhoneOptions {
		public var firstAudioJoin:Boolean = true;
		
		public var uri:String = "unknown";
		
		public var showButton:Boolean = true;
		
		public var autoJoin:Boolean = false;
		
		public var skipCheck:Boolean = false;
		
		public var enabledEchoCancel:Boolean = false;
		
		public var useWebRTCIfAvailable:Boolean = true;
		
		public var echoTestApp:String = "9196";
		
		public var listenOnlyMode:Boolean = true;
		
		public var presenterShareOnly:Boolean = false;
		
		public var showPhoneOption:Boolean = false;
		
		public var showMicrophoneHint:Boolean = true;
		
		public var forceListenOnly:Boolean = false;
		
		public function PhoneOptions(phoneModule:XML) {
			parseOptions(phoneModule);
		}
		
		public function parseOptions(vxml:XML):void {
			if (vxml != null) {
				if (vxml.@uri != undefined) {
					uri = vxml.@uri.toString();
				}
				if (vxml.@showButton != undefined) {
					showButton = (vxml.@showButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@autoJoin != undefined) {
					autoJoin = (vxml.@autoJoin.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@skipCheck != undefined) {
					skipCheck = (vxml.@skipCheck.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@enabledEchoCancel != undefined) {
					enabledEchoCancel = (vxml.@enabledEchoCancel.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@useWebRTCIfAvailable != undefined) {
					useWebRTCIfAvailable = (vxml.@useWebRTCIfAvailable.toString().toUpperCase() == "TRUE");
				}
				if (vxml.@echoTestApp != undefined) {
					echoTestApp = vxml.@echoTestApp.toString();
				}
				if (vxml.@listenOnlyMode != undefined) {
					listenOnlyMode = (vxml.@listenOnlyMode.toString().toUpperCase() == "TRUE");
				}
				if (vxml.@forceListenOnly != undefined) {
					forceListenOnly = (vxml.@forceListenOnly.toString().toUpperCase() == "TRUE");
				}
				if (vxml.@presenterShareOnly != undefined) {
					presenterShareOnly = (vxml.@presenterShareOnly.toString().toUpperCase() == "TRUE");
				}
				if (vxml.@showPhoneOption != undefined) {
					showPhoneOption = (vxml.@showPhoneOption.toString().toUpperCase() == "TRUE");
				}
				if (vxml.@showMicrophoneHint != undefined) {
					showMicrophoneHint = (vxml.@showMicrophoneHint.toString().toUpperCase() == "TRUE");
				}
			}
		}
	}
}
