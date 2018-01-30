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
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.utils.Timer;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.connection.messages.MsgFromClientHdr;
	import org.bigbluebutton.core.connection.messages.ValidateAuthTokenReqMsg;
	import org.bigbluebutton.core.connection.messages.ValidateAuthTokenReqMsgBody;
	import org.bigbluebutton.core.events.TokenValidEvent;
	import org.bigbluebutton.core.events.TokenValidReconnectEvent;
	import org.bigbluebutton.core.managers.ReconnectionManager;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.core.services.BandwidthMonitor;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.InvalidAuthTokenEvent;
	import org.bigbluebutton.main.model.options.ApplicationOptions;
	import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
	import org.bigbluebutton.main.model.users.events.UsersConnectionEvent;

    public class NetConnectionDelegate {
        private static const LOGGER:ILogger = getClassLogger(NetConnectionDelegate);

        private var _netConnection:NetConnection;	
        private var connectionId:Number;
        private var connected:Boolean = false;
        private var _userid:Number = -1;
        private var _role:String = "unknown";
        private var logoutOnUserCommand:Boolean = false;
        private var dispatcher:Dispatcher;    
        private var _messageListeners:Array = new Array();

        private var reconnecting:Boolean = false;
        private var guestKickedOutCommand:Boolean = false;
        
        private var maxConnectAttempt:int = 2;
        private var connectAttemptCount:int = 0;
        private var connectAttemptTimeout:Number = 5000;
        private var connectionTimer:Timer;
    
        private var numNetworkChangeCount:int = 0;
        private var _validateTokenTimer:Timer = null;

        private var bbbAppsUrl: String = null;
		
		private var _applicationOptions : ApplicationOptions;
        
        public function NetConnectionDelegate():void {
            dispatcher = new Dispatcher();
            _netConnection = new NetConnection();
            _netConnection.proxyType = "best";
            _netConnection.client = this;
            _netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
            _netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
            _netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
            _netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			_applicationOptions = Options.getOptions(ApplicationOptions) as ApplicationOptions;
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
            try {
              for (var notify:String in _messageListeners) {
                _messageListeners[notify].onMessage(messageName, message);
              }
            } catch(error:Error) {
              LOGGER.error("Exception dispatched by a MessageListener, error: " + error.message);
            }
          } else {
            LOGGER.debug("Message name is undefined");
          }
        }   
            
        private function handleValidateAuthTokenReply2x(body: Object):void { 
          LOGGER.debug("handleValidateAuthTokenReply2x");
            stopValidateTokenTimer();
 
            var tokenValid: Boolean = body.valid as Boolean;
            var userId: String = body.userId as String;
            var waitForApproval: Boolean = body.waitForApproval as Boolean;
            
 
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps", "connected"];
            logData.tokenValid = tokenValid;
            logData.waitForApproval = waitForApproval;
            logData.status = "validate_token_response_received";
            logData.message = "Received validate token response from server. 2x";
            LOGGER.info(JSON.stringify(logData));
            
            if (tokenValid) {
              LiveMeeting.inst().me.authTokenValid = true;
              if (waitForApproval) {
                var waitCommand:BBBEvent = new BBBEvent(BBBEvent.WAITING_FOR_MODERATOR_ACCEPTANCE);
                dispatcher.dispatchEvent(waitCommand);
              } else {
                LiveMeeting.inst().me.waitingForApproval = false;
                if (reconnecting) {
                  dispatcher.dispatchEvent(new TokenValidReconnectEvent());
                } else {
                  dispatcher.dispatchEvent(new TokenValidEvent());
                }
                sendConnectionSuccessEvent(userId);
              }
            } else {
                dispatcher.dispatchEvent(new InvalidAuthTokenEvent());
            }
      
            if (reconnecting) {
              onReconnect();
              reconnecting = false;
            }
        }

        public function onMessageFromServer2x(messageName:String, msg:String):void {
          if (messageName != "SendCursorPositionEvtMsg" &&
            messageName != "UpdateBreakoutUsersEvtMsg" &&
            messageName != "BreakoutRoomsTimeRemainingUpdateEvtMsg" &&
            messageName != "UserTalkingVoiceEvtMsg" &&
            messageName != "MeetingTimeRemainingUpdateEvtMsg") {
//            LOGGER.debug("onMessageFromServer2x - " + msg);
          }
            
            var map:Object = JSON.parse(msg);  
            var header: Object = map.header as Object;
            var body: Object = map.body as Object;
            
            var msgName: String = header.name
             
          if (!LiveMeeting.inst().me.authTokenValid && (messageName == "ValidateAuthTokenRespMsg")) {
            handleValidateAuthTokenReply2x(body)
          } else if (messageName == "validateAuthTokenTimedOut") {
            handleValidateAuthTokenTimedOut(msg)
          } else if (LiveMeeting.inst().me.authTokenValid) {
            notifyListeners(messageName, map);
          } else {
            LOGGER.debug("Ignoring message=[{0}] as our token hasn't been validated yet.", [messageName]);
          } 
        }

        public function onMessageFromServer(messageName:String, msg:Object):void {
          if (!LiveMeeting.inst().me.authTokenValid && (messageName == "validateAuthTokenReply")) {
            handleValidateAuthTokenReply(msg)
          } else if (messageName == "validateAuthTokenTimedOut") {
            handleValidateAuthTokenTimedOut(msg)
          } else if (LiveMeeting.inst().me.authTokenValid) {
            notifyListeners(messageName, msg);
          } else {
            LOGGER.debug("Ignoring message=[{0}] as our token hasn't been validated yet.", [messageName]);
          }     
        }

        private function validataTokenTimerHandler(event:TimerEvent):void {
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps"];
            logData.key = "validate_token_request_timedout";
            logData.message = "No response for validate token request.";
            LOGGER.info(JSON.stringify(logData));
        }

        private function validateToken2x():void {
          var intMeetingId: String = LiveMeeting.inst().meeting.internalId;
          var intUserId: String = LiveMeeting.inst().me.id;
          var authToken: String = LiveMeeting.inst().me.authToken;
                              
            var header: MsgFromClientHdr = new MsgFromClientHdr("ValidateAuthTokenReqMsg");

            var body: ValidateAuthTokenReqMsgBody = new ValidateAuthTokenReqMsgBody(intUserId,
              authToken);

            var message: ValidateAuthTokenReqMsg = new ValidateAuthTokenReqMsg(body);

            LOGGER.debug("******* msg \n" + JSON.stringify(message));

            sendMessage2x(
                // result - On successful result
                function(result:Object):void { 
              
                },
                // status - On error occurred
                function(status:Object):void {
                    LOGGER.error("Error occurred:");
                    for (var x:Object in status) {
                        LOGGER.error(x + " : " + status[x]);
                    } 
                },
                JSON.stringify(message)
            ); //_netConnection.call      
            
            _validateTokenTimer = new Timer(10000, 1);
            _validateTokenTimer.addEventListener(TimerEvent.TIMER, validataTokenTimerHandler);
            _validateTokenTimer.start();
        }

        public function sendMessage2x(onSuccess:Function, onFailure:Function, json:Object):void {

            var service: String = "onMessageFromClient";

            var responder:Responder =   new Responder(
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

            if (json == null) {
                _netConnection.call(service, responder);
            } else {
                _netConnection.call(service, responder, json);
            }
        }


        private function validateToken():void {

          var intUserId: String = LiveMeeting.inst().me.id;
          var authToken: String = LiveMeeting.inst().me.authToken;
          
            var message:Object = new Object();
            message["userId"] = intUserId;
            message["authToken"] = authToken;
                                
            sendMessage("validateToken",// Remote function name
                // result - On successful result
                function(result:Object):void { 
              
                },
                // status - On error occurred
                function(status:Object):void {
                    LOGGER.error("Error occurred:");
                    for (var x:Object in status) {
                        LOGGER.error(x + " : " + status[x]);
                    } 
                },
                message
            ); //_netConnection.call      
            
            _validateTokenTimer = new Timer(10000, 1);
            _validateTokenTimer.addEventListener(TimerEvent.TIMER, validataTokenTimerHandler);
            _validateTokenTimer.start();
        }
        
        private function stopValidateTokenTimer():void {
            if (_validateTokenTimer != null && _validateTokenTimer.running) {
                _validateTokenTimer.stop();
                _validateTokenTimer = null;
            }
        }

        private function handleValidateAuthTokenTimedOut(msg: Object):void {  
            stopValidateTokenTimer();
      
            var tokenValid: Boolean = msg.body.valid as Boolean;
            var userId: String = msg.body.userId as String;

            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps", "connected"];
            logData.tokenValid = tokenValid;
            logData.key = "validate_token_response_received";
            logData.message = "Validate auth token timed out.";
            LOGGER.info(JSON.stringify(logData));
      
            if (tokenValid) {
              LiveMeeting.inst().me.authTokenValid = true;
            } else {
                dispatcher.dispatchEvent(new InvalidAuthTokenEvent());
            }

            if (reconnecting) {
              onReconnect();
              reconnecting = false;
            }
        }
        
        private function handleValidateAuthTokenReply(msg: Object):void {  
            stopValidateTokenTimer();

            var map:Object = JSON.parse(msg.msg);  
            var tokenValid: Boolean = map.valid as Boolean;
            var userId: String = map.userId as String;
 
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps", "connected"];
            logData.tokenValid = tokenValid;
            logData.status = "validate_token_response_received";
            logData.message = "Received validate token response from server.";
            LOGGER.info(JSON.stringify(logData));
            
            if (tokenValid) {
//              LiveMeeting.inst().me.authTokenValid = true;
            } else {
                dispatcher.dispatchEvent(new InvalidAuthTokenEvent());
            }
      
            if (reconnecting) {
              onReconnect();
              reconnecting = false;
            }
        }

        private function onReconnect():void {
            if (LiveMeeting.inst().me.authTokenValid) {
                onReconnectSuccess();
            } else {
                onReconnectFailed();
            }
        }

        private function onReconnectSuccess():void {
            var attemptSucceeded:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_SUCCEEDED_EVENT);
            attemptSucceeded.payload.type = ReconnectionManager.BIGBLUEBUTTON_CONNECTION;
            dispatcher.dispatchEvent(attemptSucceeded);
        }

        private function onReconnectFailed():void {
            sendUserLoggedOutEvent();
        }
        
        private function sendConnectionSuccessEvent(userid:String):void{
          LOGGER.debug("Sending UsersConnectionEvent.CONNECTION_SUCCESS event");
            var e:UsersConnectionEvent = new UsersConnectionEvent(UsersConnectionEvent.CONNECTION_SUCCESS);
            e.userid = userid;
            dispatcher.dispatchEvent(e);
        }
        

        public function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object=null):void {
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

        public function connect():void {
            var intMeetingId: String = LiveMeeting.inst().meeting.internalId;
                
            try {
                var appURL:String = _applicationOptions.uri;
                var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)/;
                var result:Array = pattern.exec(appURL);

                BandwidthMonitor.getInstance().serverURL = result.server;
            
                var protocol:String = "rtmp";
                var uri:String = appURL + "/" + intMeetingId;
            
                if (BBB.initConnectionManager().isTunnelling) {
                    bbbAppsUrl = "rtmpt://" + result.server + "/" + result.app + "/" + intMeetingId;
                } else {
                    bbbAppsUrl = "rtmp://" + result.server + ":1935/" + result.app + "/" + intMeetingId;
                }

                var logData:Object = UsersUtil.initLogData();
                logData.connection = bbbAppsUrl;
                logData.tags = ["apps", "connection"];
                logData.message = "Connecting to bbb-apps.";
                LOGGER.info(JSON.stringify(logData));
            
                connectAttemptCount++;
                
                connectionTimer = new Timer(connectAttemptTimeout, 1);
                connectionTimer.addEventListener(TimerEvent.TIMER, connectionTimeout);
                connectionTimer.start();

                var username: String = LiveMeeting.inst().me.name;
                var role: String = LiveMeeting.inst().me.role;
                var voiceConf: String = LiveMeeting.inst().meeting.voiceConf;
                var recorded: Boolean = LiveMeeting.inst().meeting.recorded;
                var intUserId: String = LiveMeeting.inst().me.id;
                var extUserId: String = LiveMeeting.inst().me.externalId;
                var muteOnStart: Boolean = LiveMeeting.inst().meeting.muteOnStart;
                var guest: Boolean = LiveMeeting.inst().me.guest;
                var authToken: String = LiveMeeting.inst().me.authToken;
                
                _netConnection.connect(bbbAppsUrl, username, role,
                                        intMeetingId, voiceConf, 
                                        recorded, extUserId,
                                        intUserId, muteOnStart,
                                        guest, authToken);
                   
            } catch(e:ArgumentError) {
                // Invalid parameters.
                switch (e.errorID) {
                    case 2004 :
                        LOGGER.debug("Error! Invalid server location: {0}", [uri]);
                        break;
                    default :
                        LOGGER.debug("UNKNOWN Error! Invalid server location: {0}", [uri]);
                       break;
                }
            }
        }
            
        public function connectionTimeout (e:TimerEvent) : void {
            var logData:Object = UsersUtil.initLogData();
            logData.connection = bbbAppsUrl;
            logData.tags = ["apps", "connection"];
            logData.connectAttemptCount = connectAttemptCount;
            logData.message = "Connecting attempt to bbb-apps timedout. Retrying.";
            LOGGER.info(JSON.stringify(logData));
            
            if (connectAttemptCount <= maxConnectAttempt) {
                connect();
            } else {
                sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_ATTEMPT_TIMEDOUT);
            }
            
        }
            

        public function disconnect(logoutOnUserCommand:Boolean):void {
            this.logoutOnUserCommand = logoutOnUserCommand;
            _netConnection.close();
        }
        
        public function guestDisconnect() : void {
            this.guestKickedOutCommand = true;
            _netConnection.close();
        }

        public function forceClose():void {
          _netConnection.close();
        }
        
        protected function netStatus(event:NetStatusEvent):void {
            handleResult( event );
        }

        public function handleResult(event:Object):void {
            var info : Object = event.info;
            var statusCode : String = info.code;
            
            //Stop timeout timer when connected/rejected
            if (connectionTimer != null && connectionTimer.running) {
                connectionTimer.stop();
                connectionTimer = null;
            }
            

            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps", "connection"];
          
            switch (statusCode) {
                case "NetConnection.Connect.Success":
                    numNetworkChangeCount = 0;
                    connectAttemptCount = 0;
                    logData.message = "Successfully connected to bbb-apps.";
                    LOGGER.info(JSON.stringify(logData));
                    validateToken2x();
                    break;

                case "NetConnection.Connect.Failed":
                    logData.message = "Connection to bbb-apps failed.";
                    LOGGER.info(JSON.stringify(logData));
                    sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_FAILED);	
                    break;

                case "NetConnection.Connect.Closed":
                    logData.message = "NetConnection.Connect.Closed on bbb-apps";
                    LOGGER.info(JSON.stringify(logData));
                    sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_CLOSED);
                    break;

                case "NetConnection.Connect.InvalidApp":
                    logData.message = "bbb-app not found.";
                    LOGGER.info(JSON.stringify(logData));
                    sendConnectionFailedEvent(ConnectionFailedEvent.INVALID_APP);
                    break;

                case "NetConnection.Connect.AppShutDown":
                    LOGGER.debug(":viewers application has been shutdown");
                    sendConnectionFailedEvent(ConnectionFailedEvent.APP_SHUTDOWN);
                    break;

                case "NetConnection.Connect.Rejected":
                    var appURL:String = _applicationOptions.uri;
                    LOGGER.debug(":Connection to the server rejected. Uri: {0}. Check if the red5 specified in the uri exists and is running", [appURL]);
                    sendConnectionFailedEvent(ConnectionFailedEvent.CONNECTION_REJECTED);
                    break;
                
                case "NetConnection.Connect.NetworkChange":
                    numNetworkChangeCount++;
                    if (numNetworkChangeCount % 2 == 0) {
                        logData.message = "Detected network change on bbb-apps";
                        logData.numNetworkChangeCount = numNetworkChangeCount;
                        LOGGER.info(JSON.stringify(logData));
                    }
                    break;

                default :
                    LOGGER.debug(":Default status to the viewers application" );
                    sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
                    break;   
             }
        }

        protected function netSecurityError(event: SecurityErrorEvent):void {
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps", "connection"];
            logData.message = "Security error - " + event.text;
            LOGGER.info(JSON.stringify(logData));
            sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
        }

        protected function netIOError(event: IOErrorEvent):void {
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps", "connection"];
            logData.message = "Input/output error - " + event.text;
            LOGGER.info(JSON.stringify(logData));

            sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
        }

        protected function netASyncError(event: AsyncErrorEvent):void  {
            LOGGER.debug("Asynchronous code error - {0}", [event.toString()]);
            sendConnectionFailedEvent(ConnectionFailedEvent.UNKNOWN_REASON);
        }

        private function sendConnectionFailedEvent(reason:String):void{
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps", "connection"];

            if (this.guestKickedOutCommand) {
                logData.reason = "Guest kicked out.";
                logData.message = "User disconnected from BBB App.";
                LOGGER.info(JSON.stringify(logData));

                sendGuestUserKickedOutEvent();
            } else if (this.logoutOnUserCommand) {
                logData.reason = "User requested.";
                logData.message = "User logged out from BBB App.";
                LOGGER.info(JSON.stringify(logData));
                   
                sendUserLoggedOutEvent();
            } else if (reason == ConnectionFailedEvent.CONNECTION_CLOSED && !UsersUtil.isUserEjected()) {
                // do not try to reconnect if the connection failed is different than CONNECTION_CLOSED  
                logData.reason = reason;
                logData.message = "User disconnected from BBB App.";
                LOGGER.info(JSON.stringify(logData));

                if (reconnecting) {
                    var attemptFailedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_FAILED_EVENT);
                    attemptFailedEvent.payload.type = ReconnectionManager.BIGBLUEBUTTON_CONNECTION;
                    dispatcher.dispatchEvent(attemptFailedEvent);
                } else {
                    reconnecting = true;
                    LiveMeeting.inst().me.authTokenValid = false;

                    var disconnectedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_DISCONNECTED_EVENT);
                    disconnectedEvent.payload.type = ReconnectionManager.BIGBLUEBUTTON_CONNECTION;
                    disconnectedEvent.payload.callback = connect;
                    disconnectedEvent.payload.callbackParameters = new Array();
                    dispatcher.dispatchEvent(disconnectedEvent);
                }
            } else {
                if (UsersUtil.isUserEjected()) {
                    logData.message = "User has been ejected from meeting.";
                    LOGGER.info(JSON.stringify(logData));
                    reason = ConnectionFailedEvent.USER_EJECTED_FROM_MEETING;
                    var cfe:ConnectionFailedEvent = new ConnectionFailedEvent(reason);
                    dispatcher.dispatchEvent(cfe);
                } else {
                    logData.message = "Connection failed event - " + reason;
                    LOGGER.info(JSON.stringify(logData));
                    var e:ConnectionFailedEvent = new ConnectionFailedEvent(reason);
                    dispatcher.dispatchEvent(e);
                }

            }
        }

        private function sendUserLoggedOutEvent():void{
            var e:ConnectionFailedEvent = new ConnectionFailedEvent(ConnectionFailedEvent.USER_LOGGED_OUT);
            dispatcher.dispatchEvent(e);
        }

        private function sendGuestUserKickedOutEvent():void {
            var e:ConnectionFailedEvent = new ConnectionFailedEvent(ConnectionFailedEvent.MODERATOR_DENIED_ME);
            dispatcher.dispatchEvent(e);
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
