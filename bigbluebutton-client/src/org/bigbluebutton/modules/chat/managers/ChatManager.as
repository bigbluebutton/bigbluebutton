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
package org.bigbluebutton.modules.chat.managers
{
	import flash.events.IEventDispatcher;
	import org.bigbluebutton.common.LogUtil;
	
	public class ChatManager
	{
		/** This property is injected by the application. */
		public var dispatcher:IEventDispatcher;
		
		private var attributes:Object;
		
		public function ChatManager()
		{
		}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}
		
		public function getDispatcher():IEventDispatcher {
			return dispatcher;
		}
		
		public function receivedMessage():void {
			trace("Got New Public Chat message");
		}
		
		public function receivedPrivateMessage():void {
			trace("Got New Private Chat message");
		}
		
		public function receivedGlobalMessage():void {
			trace("Got New Global Chat message");
		}
		
		public function receivedAppletStartedMessage():void {
			LogUtil.debug("Got APPLET STARTED message");
		}
		
		public function receivedSendPublicChatMessageEvent():void {
			trace("Receive receivedSendPublicChatMessageEvent");
		}
	}
}