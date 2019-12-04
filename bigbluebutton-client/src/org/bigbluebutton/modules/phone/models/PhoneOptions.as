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
package org.bigbluebutton.modules.phone.models {
	import org.bigbluebutton.core.Options;

	public class PhoneOptions extends Options {
		static public var firstAudioJoin:Boolean = true;

		public var uri:String = "";

		[Bindable]
		public var showButton:Boolean = true;

		[Bindable]
		public var autoJoin:Boolean = false;

		[Bindable]
		public var skipCheck:Boolean = false;

		[Bindable]
		public var enabledEchoCancel:Boolean = false;

		[Bindable]
		public var useWebRTCIfAvailable:Boolean = true;

		[Bindable]
		public var echoTestApp:String = "9196";

		[Bindable]
		public var listenOnlyMode:Boolean = true;

		[Bindable]
		public var showPhoneOption:Boolean = false;

		[Bindable]
		public var showMicrophoneHint:Boolean = true;

		[Bindable]
		public var forceListenOnly:Boolean = false;

		[Bindable]
		public var showWebRTCStats:Boolean = false;
		
		[Bindable]
		public var showWebRTCMOS:Boolean = false;

		public function PhoneOptions() {
			name = "PhoneModule";
		}
	}
}
