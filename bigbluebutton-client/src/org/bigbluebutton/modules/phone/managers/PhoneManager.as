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

package org.bigbluebutton.modules.phone.managers {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.media.Microphone;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.phone.PhoneOptions;
	import org.bigbluebutton.modules.phone.events.CallConnectedEvent;
	
	public class PhoneManager {		
		private var connectionManager:ConnectionManager;
		private var streamManager:StreamManager;
		private var onCall:Boolean = false;
		private var attributes:Object;
		private var phoneOptions:PhoneOptions;
		// If we are joining with microphone or not
		private var withMic:Boolean = false;
		// If we are auto-rejoining the conference because we got disconnected.
		private var rejoining:Boolean = false;
		// User has requested to leave the voice conference.
		private var userHangup:Boolean = false;
		
		
		public function PhoneManager() {
			connectionManager = new ConnectionManager();
			streamManager = new StreamManager();
		}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
			var vxml:XML = BBB.getConfigForModule("PhoneModule");
			phoneOptions = new PhoneOptions();
			if (vxml != null) {
				phoneOptions.showButton = (vxml.@showButton.toString().toUpperCase() == "TRUE") ? true : false;
				phoneOptions.autoJoin = (vxml.@autoJoin.toString().toUpperCase() == "TRUE") ? true : false;
				phoneOptions.skipCheck = (vxml.@skipCheck.toString().toUpperCase() == "TRUE") ? true : false;
			}
			
			if (phoneOptions.autoJoin) {
				if (phoneOptions.skipCheck || noMicrophone()) {
					if (noMicrophone()) {
						joinVoice(false);
					} else {
						joinVoice(true);						
					}
				} else {
					var dispatcher:Dispatcher = new Dispatcher();
					dispatcher.dispatchEvent(new BBBEvent("SHOW_MIC_SETTINGS"));
				}
			}
		}

		private function noMicrophone():Boolean {
			return ((Microphone.getMicrophone() == null) || (Microphone.names.length == 0) 
				|| ((Microphone.names.length == 1) && (Microphone.names[0] == "Unknown Microphone")));
		}
		
		private function setupMic(useMic:Boolean):void {
			withMic = useMic;
			if (withMic)
				streamManager.initMicrophone();
			else
				streamManager.initWithNoMicrophone();
		}
		
		private function setupConnection():void {
			streamManager.setConnection(connectionManager.getConnection());
		}
				
		public function joinVoice(autoJoin:Boolean):void {
			userHangup = false;
			setupMic(autoJoin);
			var uid:String = String(Math.floor(new Date().getTime()));
			var uname:String = encodeURIComponent(UserManager.getInstance().getConference().getMyUserId() + "-" + attributes.username);
			connectionManager.connect(uid, attributes.externUserID, uname , attributes.room, attributes.uri);
		}		
		
		public function rejoin():void {
			if (!rejoining && !userHangup) {
				// We got disconnected and it's not because the user requested it. Let's rejoin the conference.
				LogUtil.debug("Rejoining the conference");
				rejoining = true;
				joinVoice(withMic);
			}			
		}
				
		public function dialConference():void {
			connectionManager.doCall(attributes.webvoiceconf);
		}
		
		public function callConnected(event:CallConnectedEvent):void {
			setupConnection();
			streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec);
			onCall = true;
			// We have joined the conference. Reset so that if and when we get disconnected, we
			// can rejoin automatically.
			rejoining = false;
		}
		
		public function userRequestedHangup():void {
			LogUtil.debug("User has requested to hangup and leave the conference");
			userHangup = true;
			hangup();
		}
		
		public function hangup():void {
			if (onCall) {
				streamManager.stopStreams();
				connectionManager.doHangUp();
				onCall = false;
			}			
		}
	}
}
