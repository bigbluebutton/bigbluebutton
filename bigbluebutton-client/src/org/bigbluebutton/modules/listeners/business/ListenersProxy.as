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
package org.bigbluebutton.modules.listeners.business 
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.modules.listeners.business.vo.Listeners;
	import org.bigbluebutton.modules.listeners.events.ListenersCommand;
	import org.bigbluebutton.modules.listeners.events.ListenersEvent;
	import org.bigbluebutton.modules.listeners.events.StartListenersModuleEvent;
	import org.bigbluebutton.modules.listeners.events.StopListenersModuleEvent;

	public class ListenersProxy
	{		
		private var _listenersService:ListenersSOService;
		private var _listeners:Listeners = null;
		// Is teh disconnection due to user issuing the disconnect or is it the server
		// disconnecting due to t fault?
		private var manualDisconnect:Boolean = false;
		
		private var _module:ListenersModule;
		
		private var dispatcher:Dispatcher;
		
		public function ListenersProxy(){
			dispatcher = new Dispatcher();
		}
		
		public function connect(event:StartListenersModuleEvent):void {
			_listeners = new Listeners();
			_module = event.module;
			_listenersService = new ListenersSOService(_listeners, _module);
			_listenersService.addConnectionStatusListener(connectionStatusListener);
			manualDisconnect = false;
			_listenersService.connect(_module.uri);		
			
			var listenersEvent:ListenersEvent = new ListenersEvent(ListenersEvent.REGISTER_LISTENERS);
			listenersEvent.listeners = _listeners;
			dispatcher.dispatchEvent(listenersEvent);
			
			var moderatorEvent:ListenersEvent = new ListenersEvent(ListenersEvent.SET_LOCAL_MODERATOR_STATUS);
			moderatorEvent.moderator = event.module.isModerator();
			dispatcher.dispatchEvent(moderatorEvent);
		}
		
		public function disconnect():void {
			// USer is issuing a disconnect.
			manualDisconnect = true;
			_listenersService.disconnect();
		}
		
		public function isModerator():Boolean {
			return (_module as ListenersModule).isModerator();
		}
		
		public function get listeners():ArrayCollection {
			return _listeners.listeners;
		}
		
		public function convertRecodingToMp3():void {
			//recordingService.convertRecordedAudioToMP3();
		}
		
		private function connectionStatusListener(connected:Boolean, errors:Array=null):void { 
			if (connected) {
			//	sendNotification(ListenersModuleConstants.CONNECTED);
			} else {
				_listeners = null;
				var dispatcher:Dispatcher = new Dispatcher();
				var e:StopListenersModuleEvent = new StopListenersModuleEvent(StopListenersModuleEvent.DISCONNECTED);
				e.manual_disconnect = manualDisconnect;
				dispatcher.dispatchEvent(e);
			}
		}

		public function muteUnmuteUser(command:ListenersCommand):void
		{
			_listenersService.muteUnmuteUser(command.userid, command.mute);		
		}

		public function lockMuteUser(command:ListenersCommand):void
		{
			_listenersService.lockMuteUser(command.userid, command.lock);		
		}
		
		public function muteAllUsers(command:ListenersCommand):void
		{	
			_listenersService.muteAllUsers(true);			
		}
		
		public function unmuteAllUsers(command:ListenersCommand):void{
			_listenersService.muteAllUsers(false);
		}
		
		public function ejectUser(command:ListenersCommand):void
		{
			_listenersService.ejectUser(command.userid);			
		}	
	}
}