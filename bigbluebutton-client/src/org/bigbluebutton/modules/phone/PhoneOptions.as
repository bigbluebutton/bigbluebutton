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
package org.bigbluebutton.modules.phone
{
	import org.bigbluebutton.core.BBB;
	
	public class PhoneOptions {
    public var uri:String = "unknown";
    
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
		public var presenterShareOnly:Boolean = false;
		
		[Bindable]
		public var showPhoneOption:Boolean = false;
		
		public function PhoneOptions() {
			parseOptions();
		}
		
		public function parseOptions():void {
			var vxml:XML = BBB.getConfigForModule("PhoneModule");
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
				if (vxml.@presenterShareOnly != undefined) {
					presenterShareOnly = (vxml.@presenterShareOnly.toString().toUpperCase() == "TRUE");
				}
				if (vxml.@showPhoneOption != undefined) {
					showPhoneOption = (vxml.@showPhoneOption.toString().toUpperCase() == "TRUE");
				}
			}
		}		
	}
}