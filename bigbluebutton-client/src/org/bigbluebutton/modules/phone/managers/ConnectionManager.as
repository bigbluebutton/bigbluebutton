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
	
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.net.ObjectEncoding;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.ReconnectionManager;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.phone.events.FlashCallConnectedEvent;
	import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
	import org.bigbluebutton.modules.phone.events.FlashVoiceConnectionStatusEvent;
	import org.bigbluebutton.util.ConnUtil;
	
	public class ConnectionManager {
		private static const LOGGER:ILogger = getClassLogger(ConnectionManager);
    
		private  var netConnection:NetConnection = null;
		private var incomingNetStream:NetStream = null;
		private var outgoingNetStream:NetStream = null;
		private var username:String;
		private var uri:String;
		private var externUserId:String;
		private var uid:String;
		private var meetingId:String;
		
		private var registered:Boolean = false;
    private var closedByUser:Boolean = false;

		private var reconnecting:Boolean = false;
		private var amIListenOnly:Boolean = false;
    
		private var dispatcher:Dispatcher;
		
		private var numNetworkChangeCount:int = 0;
		
		public function ConnectionManager():void {
			dispatcher = new Dispatcher();
		}
		
    public function isConnected():Boolean {
      if (netConnection != null) {
        return netConnection.connected;
      }
      return false;
    }
    
		public function getConnection():NetConnection {
			return netConnection;
		}
		
    public function setup(uid:String, externUserId:String, username:String, meetingId:String, uri:String):void {	
	  LOGGER.debug("Setup uid=[{0}] extuid=[{1}] name=[{2}] uri=[{3}]", [uid, externUserId, username, uri]);
      this.uid = uid;	
      this.username  = username;
      this.meetingId = meetingId;
      this.uri   = uri;
      this.externUserId = externUserId;
    }
    
		public function connect():void {				
			if (!reconnecting || amIListenOnly) {
				closedByUser = false;
				
				var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)/;
				var result:Array = pattern.exec(uri);
				var useRTMPS: Boolean = result.protocol == ConnUtil.RTMPS
					
				netConnection = new NetConnection();
				
				if (BBB.initConnectionManager().isTunnelling) {
					var tunnelProtocol: String = ConnUtil.RTMPT;
					
					if (useRTMPS) {
						netConnection.proxyType = ConnUtil.PROXY_NONE;
						tunnelProtocol = ConnUtil.RTMPS;
					}
						
					uri = tunnelProtocol + "://" + result.server + "/" + result.app;
					trace("******* BBB SIP CONNECT tunnel = TRUE " + "url=" +  uri);
				} else {
					var nativeProtocol: String = ConnUtil.RTMP;
					if (useRTMPS) {
						netConnection.proxyType = ConnUtil.PROXY_BEST;
						nativeProtocol = ConnUtil.RTMPS;
					}
					
					uri = nativeProtocol + "://" + result.server + "/" + result.app;
					trace("******* BBB SIP CONNECT tunnel = FALSE " + "url=" +  uri);
				}
				
				LOGGER.debug("******** VOICE CONF == Connecting to uri=[{0}]", [uri]);
				
				netConnection.objectEncoding = ObjectEncoding.AMF3;

				netConnection.client = this;
				netConnection.addEventListener( NetStatusEvent.NET_STATUS , netStatus );
				netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
				
				var authToken: String = LiveMeeting.inst().me.authToken;
				netConnection.connect(uri, meetingId, externUserId, username, authToken);
			}
			if (reconnecting && !amIListenOnly) {
				handleConnectionSuccess();
			}
		}

		public function disconnect(requestByUser:Boolean):void {
      closedByUser = requestByUser;
      if (netConnection != null) {
        netConnection.close();
      }			
		}
		
    private function handleConnectionSuccess():void {
      if (reconnecting) {
        var attemptSucceeded:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_SUCCEEDED_EVENT);
        attemptSucceeded.payload.type = ReconnectionManager.SIP_CONNECTION;
        dispatcher.dispatchEvent(attemptSucceeded);
      }
      dispatcher.dispatchEvent(new FlashVoiceConnectionStatusEvent(FlashVoiceConnectionStatusEvent.CONNECTED));
      reconnecting = false;
    }

    private function handleConnectionFailed():void {
      if (reconnecting) {
        var attemptFailedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_FAILED_EVENT);
        attemptFailedEvent.payload.type = ReconnectionManager.SIP_CONNECTION;
        dispatcher.dispatchEvent(attemptFailedEvent);
      }
      dispatcher.dispatchEvent(new FlashVoiceConnectionStatusEvent(FlashVoiceConnectionStatusEvent.FAILED, reconnecting));
    }

    private function handleConnectionClosed():void {
      if (!closedByUser) {
        reconnecting = true;

        var disconnectedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_DISCONNECTED_EVENT);
        disconnectedEvent.payload.type = ReconnectionManager.SIP_CONNECTION;
        disconnectedEvent.payload.callback = connect;
        disconnectedEvent.payload.callbackParameters = [];
        dispatcher.dispatchEvent(disconnectedEvent);

        dispatcher.dispatchEvent(new FlashVoiceConnectionStatusEvent(FlashVoiceConnectionStatusEvent.DISCONNECTED, reconnecting));
      }
    }

		private function netStatus (event:NetStatusEvent ):void {		 
      var info : Object = event.info;
      var statusCode : String = info.code;
      
      var logData:Object = UsersUtil.initLogData();
      
      switch (statusCode) {
        case "NetConnection.Connect.Success":
          numNetworkChangeCount = 0;
          logData.tags = ["voice", "flash"];
          logData.message = "Connection success.";
          LOGGER.info(JSON.stringify(logData));
          handleConnectionSuccess();
          break;
        case "NetConnection.Connect.Failed":
          logData.tags = ["voice", "flash"];
		  logData.message = "NetConnection.Connect.Failed from bbb-voice";
		  LOGGER.info(JSON.stringify(logData));
          handleConnectionFailed();
          break;
        case "NetConnection.Connect.NetworkChange":
          numNetworkChangeCount++;
          if (numNetworkChangeCount % 2 == 0) {
              logData.tags = ["voice", "flash"];
             logData.message = "Detected network change on bbb-voice";
             logData.numNetworkChangeCount = numNetworkChangeCount;
             LOGGER.info(JSON.stringify(logData));
          }
          break;
        case "NetConnection.Connect.Closed":
          logData.tags = ["voice", "flash"];
		  logData.message = "Disconnected from BBB Voice";
		  LOGGER.info(JSON.stringify(logData));
          handleConnectionClosed();
          break;
      }
		} 
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
			LOGGER.error("AsyncErrorEvent: {0}", [event]);
    }
		
		private function securityErrorHandler(event:SecurityErrorEvent):void {
			LOGGER.error("securityErrorHandler: {0}", [event]);
    }
        
    //********************************************************************************************
		//			
		//			CallBack Methods from Red5 
		//
		//********************************************************************************************		
		public function failedToJoinVoiceConferenceCallback(msg:String):* {
			LOGGER.error("failedToJoinVoiceConferenceCallback {0}", [msg]);
			var event:FlashCallDisconnectedEvent = new FlashCallDisconnectedEvent();
			dispatcher.dispatchEvent(event);	
		}
		
		public function disconnectedFromJoinVoiceConferenceCallback(msg:String):* {
			LOGGER.debug("disconnectedFromJoinVoiceConferenceCallback {0}", [msg]);
			var event:FlashCallDisconnectedEvent = new FlashCallDisconnectedEvent();
			dispatcher.dispatchEvent(event);	
		}	
				
     	public function successfullyJoinedVoiceConferenceCallback(publishName:String, playName:String, codec:String):* {
		 	LOGGER.debug("successfullyJoinedVoiceConferenceCallback [{0}] : [{1}] : [{2}]", [publishName, playName, codec]);
			var event:FlashCallConnectedEvent = new FlashCallConnectedEvent(publishName, playName, codec);
			dispatcher.dispatchEvent(event);
		}
						
		//********************************************************************************************
		//			
		//			SIP Actions
		//
		//********************************************************************************************		
		public function doCall(dialStr:String, listenOnly:Boolean = false):void {
			amIListenOnly = listenOnly;
			LOGGER.debug("in doCall - Calling {0} {1}", [dialStr, listenOnly? "*listen only*": ""]);
			netConnection.call("voiceconf.call", null, "default", username, dialStr, listenOnly.toString());
		}
				
		public function doHangUp():void {			
			if (isConnected()) {
				amIListenOnly = false;
        		LOGGER.debug("hanging up call");
				netConnection.call("voiceconf.hangup", null, "default");
			}
		}
		
		public function onBWCheck(... rest):Number { 
			return 0; 
		} 
		public function onBWDone(... rest):void { 
			var p_bw:Number; 
			if (rest.length > 0) p_bw = rest[0]; 
			// your application should do something here 
			// when the bandwidth check is complete
			LOGGER.debug("bandwidth = {0} Kbps.", [p_bw]); 
		}
	}
}
