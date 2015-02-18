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
package org.bigbluebutton.main.model.users
{
	import com.adobe.protocols.dict.events.ErrorEvent;
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.*;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.utils.Timer;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.services.BandwidthMonitor;
	import org.bigbluebutton.main.api.JSLog;
	import org.bigbluebutton.main.events.InvalidAuthTokenEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
	import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;
		
	public class NetConnectionDelegate
	{
		public static const LOG:String = "NetConnectionDelegate - ";
		
		private var _netConnection:NetConnection;	
		private var connectionId:Number;
		private var connected:Boolean = false;
		
		private var _userid:Number = -1;
		private var _role:String = "unknown";
		private var _applicationURI:String;
		private var _conferenceParameters:ConferenceParameters;
		
		// These two are just placeholders. We'll get this from the server later and
		// then pass to other modules.
		private var _authToken:String = "AUTHORIZED";
		private var _room:String;
		private var tried_tunneling:Boolean = false;
		private var logoutOnUserCommand:Boolean = false;
		private var backoff:Number = 2000;
		
		private var dispatcher:Dispatcher;    
    private var _messageListeners:Array = new Array();
    
    private var authenticated: Boolean = false;
    
		public function NetConnectionDelegate():void
		{
			dispatcher = new Dispatcher();
			
			_netConnection = new NetConnection();				
			_netConnection.proxyType = "best";
			_netConnection.client = this;
			_netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			_netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			_netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			_netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
		}
		
    public function setUri(uri:String):void {
      _applicationURI = uri;
    }
       
        
		public function get connection():NetConnection {
			return _netConnection;
		}
        
    public function addMessageListener(listener:IMessageListener):void {
      _messageListeners.push(listener);
    }
        
    public function removeMessageListener(listener:IMessageListener):void {
      for (var ob:int=0; ob<_messageListeners.length; ob++) {
        if (_messageListeners[ob] == listener) {
          _messageListeners.splice (ob,1);
          break;
        }
      }
    }
        
    private function notifyListeners(messageName:String, message:Object):void {
      if (messageName != null && messageName != "") {
        for (var notify:String in _messageListeners) {
          _messageListeners[notify].onMessage(messageName, message);
        }                
      } else {
        LogUtil.debug("Message name is undefined");
      }
    }   
        
    public function onMessageFromServer(messageName:String, msg:Object):void {
      trace(LOG + "Got message from server [" + messageName + "]"); 
      if (!authenticated && (messageName == "validateAuthTokenReply")) {
        handleValidateAuthTokenReply(msg)
      } else if (authenticated) {
        notifyListeners(messageName, msg);
      } else {
        trace(LOG + "Ignoring message=[" + messageName + "] as our token hasn't been validated yet.");
      }     
    }
		
    private function validateToken():void {
      var message:Object = new Object();
      message["userId"] = _conferenceParameters.internalUserID;
      message["authToken"] = _conferenceParameters.authToken;
      
      sendMessage(
        "validateToken",// Remote function name
        // result - On successful result
        function(result:Object):void { 
          trace(LOG + "validating token for [" + _conferenceParameters.internalUserID + "]"); 
        },	
        // status - On error occurred
        function(status:Object):void { 
          LogUtil.error("Error occurred:"); 
          for (var x:Object in status) { 
            LogUtil.error(x + " : " + status[x]); 
          } 
        },
        message
      ); //_netConnection.call      
    }
      
    private function handleValidateAuthTokenReply(msg: Object):void {
      trace(LOG + "*** handleValidateAuthTokenReply " + msg.msg + " **** \n");      
      var map:Object = JSON.parse(msg.msg);  
      var tokenValid: Boolean = map.valid as Boolean;
      var userId: String = map.userId as String;
      
      if (tokenValid) {
        authenticated = true;
        trace(LOG + "*** handleValidateAuthTokenReply. valid=[ " + tokenValid + "] **** \n");
      } else {
        trace(LOG + "*** handleValidateAuthTokenReply. valid=[ " + tokenValid + "] **** \n");
        dispatcher.dispatchEvent(new InvalidAuthTokenEvent());
      }
    }
    
    private function sendConnectionSuccessEvent(userid:String):void{      
      var e:UsersConnectionEvent = new UsersConnectionEvent(UsersConnectionEvent.CONNECTION_SUCCESS);
      e.userid = userid;
      dispatcher.dispatchEvent(e);
      
    }
    
		public function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object=null):void {
      trace(LOG + "SENDING [" + service + "]");
			var responder:Responder =	new Responder(                    
					function(result:Object):void { // On successful result
						onSuccess("Successfully sent [" + service + "]."); 
					},	                   
					function(status:Object):void { // status - On error occurred
						var errorReason:String = "Failed to send [" + service + "]:\n"; 
						for (var x:Object in status) { 
							errorReason += "\t" + x + " : " + status[x]; 
						} 
					}
				);
			
			if (message == null) {
				_netConnection.call(service, responder);			
			} else {
				_netConnection.call(service, responder, message);
			}
		}
		
		/**
		 * Connect to the server.
		 * uri: The uri to the conference application.
		 * username: Fullname of the participant.
		 * role: MODERATOR/VIEWER
		 * conference: The conference room
		 * mode: LIVE/PLAYBACK - Live:when used to collaborate, Playback:when being used to playback a recorded conference.
		 * room: Need the room number when playing back a recorded conference. When LIVE, the room is taken from the URI.
		 */
		public function connect(params:ConferenceParameters, tunnel:Boolean = false):void {	
			_conferenceParameters = params;
			
			tried_tunneling = tunnel;	
            
			try {	
				var uri:String = _applicationURI + "/" + _conferenceParameters.room;
				
				trace(LOG + "::Connecting to " + uri + " [" + _conferenceParameters.username + "," + _conferenceParameters.role + "," + 
					_conferenceParameters.conference + "," + _conferenceParameters.record + "," + _conferenceParameters.room + "]");	
				_netConnection.connect(uri, _conferenceParameters.username, _conferenceParameters.role,
											_conferenceParameters.room, _conferenceParameters.voicebridge, 
											_conferenceParameters.record, _conferenceParameters.externUserID,
											_conferenceParameters.internalUserID, _conferenceParameters.lockOnStart, 
                      _conferenceParameters.muteOnStart, _conferenceParameters.lockSettings);			
			} catch(e:ArgumentError) {
				// Invalid parameters.
				switch (e.errorID) {
					case 2004 :						
						LogUtil.debug("Error! Invalid server location: " + uri);											   
						break;						
					default :
						LogUtil.debug("UNKNOWN Error! Invalid server location: " + uri);
					   break;
				}
			}	
		}
			
		public function disconnect(logoutOnUserCommand:Boolean):void {
			this.logoutOnUserCommand = logoutOnUserCommand;
			_netConnection.close();
		}
		
    
    public function forceClose():void {
      _netConnection.close();
    }
    
		protected function netStatus(event:NetStatusEvent):void {
			handleResult( event );
		}
		
    private var _bwMon:BandwidthMonitor = new BandwidthMonitor();
    
    private function startMonitoringBandwidth():void {
      trace("Start monitoring bandwidth.");
      var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)/;
      var result:Array = pattern.exec(_applicationURI);
      _bwMon.serverURL = result.server;
      _bwMon.serverApplication = "video";
      _bwMon.start();
    }
        
    private var autoReconnectTimer:Timer = new Timer(1000, 1);
    
		public function handleResult(event:Object):void {
			var info : Object = event.info;
			var statusCode : String = info.code;

      var logData:Object = new Object();
      logData.user = UsersUtil.getUserData();
      
			switch (statusCode) {
				case "NetConnection.Connect.Success":
					trace(LOG + ":Connection to viewers application succeeded.");
          JSLog.info("Successfully connected to BBB App.", logData);
          
          validateToken();
			
					break;
			
				case "NetConnection.Connect.Failed":					
					if (tried_tunneling) {
            trace(LOG + ":Connection to viewers application failed...even when tunneling");
						sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_FAILED);
					} else {
						disconnect(false);
            trace(LOG + ":Connection to viewers application failed...try tunneling");
						var rtmptRetryTimer:Timer = new Timer(1000, 1);
            rtmptRetryTimer.addEventListener("timer", rtmptRetryTimerHandler);
            rtmptRetryTimer.start();						
					}									
					break;
					
				case "NetConnection.Connect.Closed":	
          trace(LOG + "Connection to viewers application closed");
          sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_CLOSED);		
											
					break;
					
				case "NetConnection.Connect.InvalidApp":	
          trace(LOG + ":viewers application not found on server");			
					sendConnectionFailedEvent(ConnectionFailedEvent.INVALID_APP);				
					break;
					
				case "NetConnection.Connect.AppShutDown":
          trace(LOG + ":viewers application has been shutdown");
					sendConnectionFailedEvent(ConnectionFailedEvent.APP_SHUTDOWN);	
					break;
					
				case "NetConnection.Connect.Rejected":
          trace(LOG + ":Connection to the server rejected. Uri: " + _applicationURI + ". Check if the red5 specified in the uri exists and is running" );
					sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_REJECTED);		
					break;
				
				case "NetConnection.Connect.NetworkChange":
          JSLog.warn("Detected network change to BBB App", logData);
          trace(LOG + "Detected network change. User might be on a wireless and temporarily dropped connection. Doing nothing. Just making a note.");
					break;
					
				default :
          trace(LOG + ":Default status to the viewers application" );
				   sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
				   break;
			}
		}
		
    private function autoReconnectTimerHandler(event:TimerEvent):void {
      trace(LOG + "autoReconnectTimerHandler: " + event);
      connect(_conferenceParameters, tried_tunneling);
    }
        
		private function rtmptRetryTimerHandler(event:TimerEvent):void {
      trace(LOG + "rtmptRetryTimerHandler: " + event);
      connect(_conferenceParameters, true);
    }
			
		protected function netSecurityError(event: SecurityErrorEvent):void {
      trace(LOG + "Security error - " + event.text);
			sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
		}
		
		protected function netIOError(event: IOErrorEvent):void {
      trace(LOG + "Input/output error - " + event.text);
			sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
		}
			
		protected function netASyncError(event: AsyncErrorEvent):void  {
      trace(LOG + "Asynchronous code error - " + event.toString() );
      
			LogUtil.debug("Asynchronous code error - " + event.toString() );
			sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
		}	
			
		private function sendConnectionFailedEvent(reason:String):void{
      var logData:Object = new Object();
      
			if (this.logoutOnUserCommand) {
        logData.reason = "User requested.";
        logData.user = UsersUtil.getUserData();
        JSLog.info("User logged out from BBB App.", logData);
				sendUserLoggedOutEvent();
			} else {
        logData.reason = reason;
        logData.user = UsersUtil.getUserData();
        JSLog.info("User disconnected from BBB App.", logData);
        var e:ConnectionFailedEvent = new ConnectionFailedEvent(reason);
        dispatcher.dispatchEvent(e);        
      }
		}
		
		private function sendUserLoggedOutEvent():void{
			var e:ConnectionFailedEvent = new ConnectionFailedEvent(ConnectionFailedEvent.USER_LOGGED_OUT);
			dispatcher.dispatchEvent(e);
		}
		
		private function attemptReconnect(backoff:Number):void{
			var retryTimer:Timer = new Timer(backoff, 1);
			retryTimer.addEventListener(TimerEvent.TIMER, function():void{
				connect(_conferenceParameters, tried_tunneling);
			});
			retryTimer.start();
			if (this.backoff < 16000) this.backoff = backoff *2;
		}
		
		public function onBWCheck(... rest):Number { 
			return 0; 
		} 
    
		public function onBWDone(... rest):void { 
			var p_bw:Number; 
			if (rest.length > 0) p_bw = rest[0]; 
			// your application should do something here 
			// when the bandwidth check is complete 
			trace("bandwidth = " + p_bw + " Kbps."); 
		}
	}
}
