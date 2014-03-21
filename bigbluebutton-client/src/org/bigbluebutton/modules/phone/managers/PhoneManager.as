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
	import org.bigbluebutton.modules.phone.events.CallConnectedEvent;
	import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;

	public class PhoneManager {		
    private static const LOG:String = "Phone::PhoneManager - ";
    
		private var connectionManager:ConnectionManager;
		private var streamManager:StreamManager;
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
			connectionManager = new ConnectionManager();
			streamManager = new StreamManager();
		}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;

			if (phoneOptions.autoJoin) {
				onClickToJoinVoiceConference();
			}
		}

		private function micStatusEventHandler(event:StatusEvent):void {					
			switch(event.code) {
				case "Microphone.Muted":
					LogUtil.warn("Access to microphone has been denied.");
					joinVoice(false);
					break;
				case "Microphone.Unmuted":
					LogUtil.debug("Access to the microphone has been allowed.");
					joinVoice(true);
					break;
				default:
					LogUtil.debug("unknown micStatusHandler event: " + event);
			}
		}			
		
		private function noMicrophone():Boolean {
			return ((Microphone.getMicrophone() == null) || (Microphone.names.length == 0) 
				|| ((Microphone.names.length == 1) && (Microphone.names[0] == "Unknown Microphone")));
		}
		
		private function setupMic(useMic:Boolean, microphoneIndex:int):void {
			withMic = useMic;
			if (withMic)
				streamManager.initMicrophone(microphoneIndex);
			else
				streamManager.initWithNoMicrophone();
		}
		
		private function setupConnection():void {
			streamManager.setConnection(connectionManager.getConnection());
		}
						
		public function joinVoice(autoJoin:Boolean, microphoneIndex:int = 0):void {
			  userHangup = false;
			  setupMic(autoJoin, microphoneIndex);
			  var uid:String = String(Math.floor(new Date().getTime()));
			  var uname:String = encodeURIComponent(UsersUtil.getMyExternalUserID() + "-bbbID-" + attributes.username);
			  connectionManager.connect(uid, attributes.internalUserID, uname , attributes.room, attributes.uri);
			  var dispatcher:Dispatcher = new Dispatcher();
			  dispatcher.dispatchEvent(new BBBEvent(BBBEvent.JOIN_VOICE_FOCUS_HEAD));
    }
		
		public function onJoinVoiceConferenceEvent(args:Object):void {
      if (args != null && args.hasOwnProperty("callDestination")) {
        callDestination = args.callDestination;
      }
			joinVoice(args.useMicrophone, args.microphoneIndex);
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
      // TODO: Just Return for now. Testing only WebRTC. Working on Flash.
      // richard (mar 21, 2014)
      
			LogUtil.debug("*** Dialling conference ***");
			connectionManager.doCall(callDestination);
		}
		
		public function callConnected(event:CallConnectedEvent):void {
      // TODO: Just Return for now. Testing only WebRTC. Working on Flash.
      // richard (mar 21, 2014)
      return;
		
			setupConnection();
			streamManager.callConnected(event.playStreamName, event.publishStreamName, event.codec);
			onCall = true;
			// We have joined the conference. Reset so that if and when we get disconnected, we
			// can rejoin automatically.
			rejoining = false;
		}
		
		public function userRequestedHangup():void {
      // TODO: Just Return for now. Testing only WebRTC. Working on Flash.
      // richard (mar 21, 2014)
      
			LogUtil.debug("User has requested to hangup and leave the conference");
			userHangup = true;
			hangup();
		}
		
		public function hangup():void {
			if (onCall) {
				onCall = false;
				streamManager.stopStreams();
				connectionManager.doHangUp();
			}			
		}

		public function onClickToJoinVoiceConference(args:Object = null):void {
//			var forceSkipCheck:Boolean = (args != null && args.hasOwnProperty('forceSkipCheck')? args['forceSkipCheck']: false);
//			webrtcCapable = (args != null && args.hasOwnProperty('webrtcCapable')? args['webrtcCapable']: webrtcCapable);

//			if (phoneOptions.skipCheck || noMicrophone() || forceSkipCheck) {
//				if (webrtcCapable && phoneOptions.useWebrtcIfAvailable) {
//					joinVoice(true);
//				} else {
//					mic = Microphone.getMicrophone();
					
					/*
					 * If the user had no mic, let her join but she'll just be listening.	
					 * We should indicate a warning that the user is joining without mic
					 * so that he will know that others won't be able to hear him.
					*/
//					if (mic == null) {
//						joinVoice(false);
//					} else if (mic.muted) {
						// user has disallowed access to the mic
//						Security.showSettings(SecurityPanel.PRIVACY);
//						mic.addEventListener(StatusEvent.STATUS, micStatusEventHandler);
//					} else {
						// user has allowed access to the mic already
//						joinVoice(true);
//					}
//				}
//			} else {
//				var dispatcher:Dispatcher = new Dispatcher();
//      dispatcher.dispatchEvent(new PerformEchoTestEvent("webrtc"));
//				var showMicSettings:BBBEvent = new BBBEvent("SHOW_MIC_SETTINGS");
////				showMicSettings.payload['webrtcCapable'] = webrtcCapable;
//				showMicSettings.payload['useWebrtcIfAvailable'] = phoneOptions.useWebrtcIfAvailable;
//				dispatcher.dispatchEvent(showMicSettings);
        
//			}
		}

		public function onClickToLeaveVoiceConference():void {
			userRequestedHangup();
		}
	}
}
