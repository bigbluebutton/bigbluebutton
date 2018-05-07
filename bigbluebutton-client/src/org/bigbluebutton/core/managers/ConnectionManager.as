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
package org.bigbluebutton.core.managers {
    import flash.net.NetConnection;
    
    import org.bigbluebutton.core.Options;
    import org.bigbluebutton.main.model.options.PortTestOptions;
    import org.bigbluebutton.main.model.users.IMessageListener;
    import org.bigbluebutton.main.model.users.NetConnectionDelegate;

    public class ConnectionManager {
        private var connDelegate:NetConnectionDelegate;
				
				private var _videoConnId:String = "";
				private var _voiceConnId:String = "";
				private var _screenshareConnId:String = "";
				private var _appsConnId:String = "";

        private var _isTunnelling:Boolean = false;

				private var portTestOptions : PortTestOptions;
				
        public function ConnectionManager() {
            connDelegate = new NetConnectionDelegate();
        }

				public function getConnectionIds():Object {
					var connObject:Object = new Object();
					connObject.apps = _appsConnId;
					connObject.video = _videoConnId;
					connObject.voice = _voiceConnId;
					connObject.screenshare = _screenshareConnId;
					return connObject;
				}
				
				public function set appsConnId(id:String):void {
					_appsConnId = id;
				}

				public function get appsConnId():String {
					return _appsConnId;
				}
				
				public function set videoConnId(id:String):void {
					_videoConnId = id;
				}
				
				public function get videoConnId():String {
					return _videoConnId;
				}
				
				public function set screenshareConnId(id:String):void {
					_screenshareConnId = id;
				}
				
				public function get screenshareConnId():String {
					return _screenshareConnId;
				}
				
				public function set voiceConnId(id:String):void {
					_voiceConnId = id;
				}
				
				public function get voiceConnId():String {
					return _voiceConnId;
				}
				
        public function get connection():NetConnection {
            return connDelegate.connection;
        }
				
        public function connect():void {
            connDelegate.connect();
        }

        public function disconnect(onUserAction:Boolean):void {
            connDelegate.disconnect(onUserAction);
        }

				public function initPortTestOption():void {
					portTestOptions = Options.getOptions(PortTestOptions) as PortTestOptions;
				}
				
				public function useProtocol(tunnel:Boolean):void {
					_isTunnelling = tunnel;
				}
				
				public function get isTunnelling():Boolean {
					return _isTunnelling;
				}
				
				public function get portTestHost():String {
					return portTestOptions.host;
				}
				
				public function get portTestApplication():String {
					return portTestOptions.application;
				}
				
				public function get portTestTimeout():Number {
					return portTestOptions.timeout;
				}
				
        public function addMessageListener(listener:IMessageListener):void {
            connDelegate.addMessageListener(listener);
        }

        public function removeMessageListener(listener:IMessageListener):void {
            connDelegate.removeMessageListener(listener);
        }

        public function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object = null):void {
            connDelegate.sendMessage(service, onSuccess, onFailure, message);
        }

        public function sendMessage2x(onSuccess:Function, onFailure:Function, message:Object = null):void {
            connDelegate.sendMessage2x(onSuccess, onFailure, message);
        }

        public function forceClose():void {
            connDelegate.forceClose();
        }

        public function guestDisconnect():void {
            connDelegate.guestDisconnect();
        }

    }
}
