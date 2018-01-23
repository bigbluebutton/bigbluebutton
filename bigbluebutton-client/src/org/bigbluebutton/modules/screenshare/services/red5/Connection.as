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

package org.bigbluebutton.modules.screenshare.services.red5 {
    import com.asfusion.mate.events.Dispatcher;
    import flash.events.NetStatusEvent;
    import flash.events.SecurityErrorEvent;
    import flash.net.NetConnection;
    import flash.net.ObjectEncoding;
    import flash.net.Responder;
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.core.BBB;
    import org.bigbluebutton.core.Options;
    import org.bigbluebutton.core.UsersUtil;
    import org.bigbluebutton.core.managers.ReconnectionManager;
    import org.bigbluebutton.main.events.BBBEvent;
    import org.bigbluebutton.modules.screenshare.events.ViewStreamEvent;
    import org.bigbluebutton.modules.screenshare.model.ScreenshareModel;
    import org.bigbluebutton.modules.screenshare.model.ScreenshareOptions;
    import org.bigbluebutton.util.ConnUtil;
    
    public class Connection {
        private static const LOGGER:ILogger = getClassLogger(Connection);
        
        private var netConnection:NetConnection;
        private var responder:Responder;
        private var width:Number;
        private var height:Number;

        private var dispatcher:Dispatcher = new Dispatcher();
        private var _messageListeners:Array = new Array();
        private var logoutOnUserCommand:Boolean = false;
        private var reconnecting:Boolean = false;
				private var ssAppUrl: String = null;

        
        public function connect():void {

					netConnection = new NetConnection();
					netConnection.objectEncoding = ObjectEncoding.AMF3;
					
						var options: ScreenshareOptions = Options.getOptions(ScreenshareOptions) as ScreenshareOptions;
						var appURL: String = options.uri;
						
						var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)/;
						var result:Array = pattern.exec(appURL);

						var useRTMPS: Boolean = result.protocol == ConnUtil.RTMPS;
						
						if (BBB.initConnectionManager().isTunnelling) {
							var tunnelProtocol: String = ConnUtil.RTMPT;
							
							if (useRTMPS) {
								netConnection.proxyType = ConnUtil.PROXY_NONE;
								tunnelProtocol = ConnUtil.RTMPS;
							}
							
							
							ssAppUrl = tunnelProtocol + "://" + result.server + "/" + result.app + "/" + UsersUtil.getInternalMeetingID();
							LOGGER.debug("SCREENSHARE CONNECT tunnel = TRUE " + "url=" +  ssAppUrl);
						} else {
							var nativeProtocol: String = ConnUtil.RTMP;
							if (useRTMPS) {
								netConnection.proxyType = ConnUtil.PROXY_BEST;
								nativeProtocol = ConnUtil.RTMPS;
							}
							
							ssAppUrl = nativeProtocol + "://" + result.server + "/" + result.app + "/" + UsersUtil.getInternalMeetingID();
							LOGGER.debug("SCREENSHARE CONNECT tunnel = FALSE " + "url=" +  ssAppUrl);
						}
						
            netConnection.client = this;
            netConnection.addEventListener( NetStatusEvent.NET_STATUS , netStatusHandler);
            netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);

            LOGGER.debug("Connecting to uri=[{0}]", [ssAppUrl]);
            netConnection.connect(ssAppUrl);
            
        }
        
        public function addMessageListener(listener:IMessageListener):void {
            _messageListeners.push(listener);
        }
        
        public function removeMessageListener(listener:IMessageListener):void {
            for (var ob:int = 0; ob < _messageListeners.length; ob++) {
                if (_messageListeners[ob] == listener) {
                    _messageListeners.splice(ob, 1);
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
                LOGGER.debug("Message name is undefined");
            }
        }
        
        public function onMessageFromServer(messageName:String, msg:Object):void {
            LOGGER.debug("Got message from server [" + messageName + "] data=" + msg.msg);
            notifyListeners(messageName, msg);
        }
        
        public function close():void {
            netConnection.close();
        }
        
        public function isScreenSharing(meetingId:String):void {
            var message:Object = new Object();
            message["meetingId"] = meetingId;
            
            sendMessage("screenshare.isScreenSharing", function(result:String):void { // On successful result
                LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
                LOGGER.error(status);
            }, message);
        }
        
        private function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object = null):void {
            LOGGER.debug("SENDING [" + service + "]");
            var responder:Responder = new Responder(function(result:Object):void { // On successful result
                onSuccess("Successfully sent [" + service + "].");
            }, function(status:Object):void { // status - On error occurred
                var errorReason:String = "Failed to send [" + service + "]:\n";
                for (var x:Object in status) {
                    errorReason += "\t" + x + " : " + status[x];
                }
            });
            
            if (message == null) {
                netConnection.call(service, responder);
            } else {
                netConnection.call(service, responder, message);
            }
        }

        public function restartShareRequest(meetingId:String, userId:String):void {
            var message:Object = new Object();
            message["meetingId"] = meetingId;
            message["userId"] = userId;
            
            sendMessage("screenshare.restartShareRequest", function(result:String):void { // On successful result
                LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
                LOGGER.error(status);
            }, message);
        }
        
        public function pauseShareRequest(meetingId:String, userId:String, streamId:String):void {
            var message:Object = new Object();
            message["meetingId"] = meetingId;
            message["userId"] = userId;
            message["streamId"] = streamId;
            
            sendMessage("screenshare.pauseShareRequest", function(result:String):void { // On successful result
                LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
                LOGGER.error(status);
            }, message);
        }
        
        public function requestShareToken(meetingId:String, userId:String, record:Boolean, tunnel: Boolean):void {
            var message:Object = new Object();
            message["meetingId"] = meetingId;
            message["userId"] = userId;
            message["record"] = record;
            message["tunnel"] = tunnel;
            
            sendMessage("screenshare.requestShareToken", function(result:String):void { // On successful result
                LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
                LOGGER.error(status);
            }, message);
        }
        
        public function startShareRequest(meetingId:String, userId:String, session:String):void {
            var message:Object = new Object();
            message["meetingId"] = meetingId;
            message["userId"] = userId;
            message["session"] = session;
            
            sendMessage("screenshare.startShareRequest", function(result:String):void { // On successful result
                LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
                LOGGER.error(status);
            }, message);
        }
        
        public function stopShareRequest(meetingId:String, streamId:String):void {
            var message:Object = new Object();
            message["meetingId"] = meetingId;
            message["streamId"] = streamId;
            
            sendMessage("screenshare.stopShareRequest", function(result:String):void { // On successful result
                LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
                LOGGER.error(status);
            }, message);
        }
        
        public function sendClientPongMessage(meetingId:String, session:String, timestamp: Number):void {
            var message:Object = new Object();
            message["meetingId"] = meetingId;
            message["session"] = session;
            message["timestamp"] = timestamp;
            
            sendMessage("screenshare.screenShareClientPongMessage", function(result:String):void { // On successful result
              //  LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
               // LOGGER.error(status);
            }, message);
        }
                
        public function onBWCheck(... rest):Number {
            return 0;
        }
        
        public function onBWDone(... rest):void {
            var p_bw:Number;
            if (rest.length > 0) p_bw = rest[0];
            // your application should do something here 
            // when the bandwidth check is complete 
            LOGGER.debug("bandwidth = " + p_bw + " Kbps.");
        }
        
        private function sendUserIdToServer():void {
            var message:Object = new Object();
            message["meetingId"] = UsersUtil.getInternalMeetingID();
            message["userId"] = UsersUtil.getMyUserID();
            
            sendMessage("screenshare.setUserId", function(result:String):void { // On successful result
                LOGGER.debug(result);
            }, function(status:String):void { // status - On error occurred
                LOGGER.error(status);
            }, message);
        }
        
        public function stopViewing():void {
            LOGGER.debug("Received dekskshareStreamStopped");
            dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.STOP));
        }
        
        private function netStatusHandler(event:NetStatusEvent):void {
            LOGGER.debug("Connected to [" + ssAppUrl + "]. [" + event.info.code + "]");
            
            var ce:ConnectionEvent;
            switch (event.info.code) {
            case "NetConnection.Connect.Failed":
                if (reconnecting) {
                    var attemptFailedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_FAILED_EVENT);
                    attemptFailedEvent.payload.type = ReconnectionManager.DESKSHARE_CONNECTION;
                    dispatcher.dispatchEvent(attemptFailedEvent);
                }
                ce = new ConnectionEvent(ConnectionEvent.FAILED);
                dispatcher.dispatchEvent(ce);
                break;
            
            case "NetConnection.Connect.Success":
                if (reconnecting) {
                    reconnecting = false;
                    if (ScreenshareModel.getInstance().isSharing) {
                        stopShareRequest(UsersUtil.getInternalMeetingID(), ScreenshareModel.getInstance().streamId)
                    }
                    
                    var attemptSucceeded:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_SUCCEEDED_EVENT);
                    attemptSucceeded.payload.type = ReconnectionManager.DESKSHARE_CONNECTION;
                    dispatcher.dispatchEvent(attemptSucceeded);
                }
                
                sendUserIdToServer();
                ce = new ConnectionEvent(ConnectionEvent.SUCCESS);
                dispatcher.dispatchEvent(ce);
                
                break;
            
            case "NetConnection.Connect.Rejected":
                ce = new ConnectionEvent(ConnectionEvent.REJECTED);
                dispatcher.dispatchEvent(ce);
                break;
            
            case "NetConnection.Connect.Closed":
                LOGGER.debug("Screenshare connection closed.");
                if (!logoutOnUserCommand) {
                    reconnecting = true;
                    
                    var disconnectedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_DISCONNECTED_EVENT);
                    disconnectedEvent.payload.type = ReconnectionManager.DESKSHARE_CONNECTION;
                    disconnectedEvent.payload.callback = connect;
                    disconnectedEvent.payload.callbackParameters = [];
                    dispatcher.dispatchEvent(disconnectedEvent);
                }
                ce = new ConnectionEvent(ConnectionEvent.CLOSED);
                break;
            
            case "NetConnection.Connect.InvalidApp":
                ce = new ConnectionEvent(ConnectionEvent.INVALIDAPP);
                dispatcher.dispatchEvent(ce);
                break;
            
            case "NetConnection.Connect.AppShutdown":
                ce = new ConnectionEvent(ConnectionEvent.APPSHUTDOWN);
                dispatcher.dispatchEvent(ce);
                break;
            
            case "NetConnection.Connect.NetworkChange":
                LOGGER.debug("Detected network change. User might be on a wireless and temporarily dropped connection. Doing nothing. Just making a note.");
                break;
            }
        }
        
        private function securityErrorHandler(event:SecurityErrorEvent):void {
            var ce:ConnectionEvent = new ConnectionEvent(ConnectionEvent.SECURITYERROR);
            dispatcher.dispatchEvent(ce);
        }
               
        public function disconnect():void {
            logoutOnUserCommand = true;
            if (netConnection != null) netConnection.close();
        }
        
        public function getConnection():NetConnection {
            return netConnection;
        }
        
        public function connectionFailedHandler(e:ConnectionEvent):void {
            LOGGER.error("connection failed to " + ssAppUrl + " with message " + e.toString());
        }
        
        public function connectionRejectedHandler(e:ConnectionEvent):void {
            LOGGER.error("connection rejected " + ssAppUrl + " with message " + e.toString());
        }
        
    }
}
