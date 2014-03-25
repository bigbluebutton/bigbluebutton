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

package org.bigbluebutton.modules.phone.managers {
	import com.asfusion.mate.events.Dispatcher;	
	import flash.events.StatusEvent;
	import flash.external.ExternalInterface;
	import flash.media.Microphone;
	import flash.system.Security;
	import flash.system.SecurityPanel;	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.phone.PhoneOptions;

	public class PhoneManager {		
    private static const LOG:String = "Phone::PhoneManager - ";
    
		private var onCall:Boolean = false;
		private var attributes:Object;
		private var phoneOptions:PhoneOptions = new PhoneOptions();
		// If we are joining with microphone or not
		private var withMic:Boolean = false;
		// If we are auto-rejoining the conference because we got disconnected.
		private var rejoining:Boolean = false;
		// User has requested to leave the voice conference.
		private var userHangup:Boolean = false;
		private var mic:Microphone;
		
    private var callDestination: String;
    
		public function PhoneManager() {
		}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;

			if (phoneOptions.autoJoin) {
			}
		}


	}
}
