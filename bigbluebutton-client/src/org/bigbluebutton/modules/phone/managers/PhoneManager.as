/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.phone.managers
{
	import flash.events.IEventDispatcher;
	
	import org.bigbluebutton.modules.phone.events.CallConnectedEvent;
	
	public class PhoneManager
	{
		private var localDispatcher:IEventDispatcher;
		
		private var connectionManager:ConnectionManager;
		private var streamManager:StreamManager;
		
		private var attributes:Object;
		
		public function PhoneManager(dispatcher:IEventDispatcher)
		{
			localDispatcher = dispatcher;
			connectionManager = new ConnectionManager(dispatcher);
			streamManager = new StreamManager(dispatcher);
		}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function setupMic():void {
			streamManager.initMicrophone();
		}
		
		public function setupConnection():void {
			streamManager.setConnection(connectionManager.getConnection());
		}
		public function join():void {
			setupMic();
			var uid:String = String( Math.floor( new Date().getTime() ) );
			connectionManager.connect(uid, attributes.username, attributes.room, attributes.uri);
		}
		
		public function register():void {
			setupConnection();
			trace("Registering....");
			connectionManager.register();
		}
		
		public function dialConference():void {
			trace("Dialing...." + attributes.voicebridge);
			connectionManager.doCall(attributes.voicebridge);
		}
		
		public function callConnected(event:CallConnectedEvent):void {
			streamManager.callConnected(event.playStreamName, event.publishStreamName);
		}
		
		public function hangup():void {
			trace("PhoneManager hangup");
			connectionManager.doHangUp();
			connectionManager.doClose();
		}
	}
}