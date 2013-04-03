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
package org.bigbluebutton.modules.users.business 
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.events.KickUserEvent;
	import org.bigbluebutton.modules.users.events.UsersEvent;
	import org.bigbluebutton.modules.users.events.StartUsersModuleEvent;
	import org.bigbluebutton.modules.users.events.StopUsersModuleEvent;
	import org.bigbluebutton.core.events.VoiceConfEvent;

	public class UsersProxy
	{		
		private var _listenersService:ListenersSOService;
		private var _users:ArrayCollection = null;
		// Is teh disconnection due to user issuing the disconnect or is it the server
		// disconnecting due to t fault?
		private var manualDisconnect:Boolean = false;
		
		private var _module:UsersModule;
		
		private var dispatcher:Dispatcher;
		
		public function UsersProxy(){
			dispatcher = new Dispatcher();
			
		}
		
		public function connect(event:StartUsersModuleEvent):void {
			_users = UserManager.getInstance().getConference().users
			_module = event.module;
			_listenersService = new ListenersSOService(_module);
			_listenersService.addConnectionStatusListener(connectionStatusListener);
			manualDisconnect = false;
			_listenersService.connect(_module.uri);
		}
		
		public function disconnect():void {
			// USer is issuing a disconnect.
			manualDisconnect = true;
			_listenersService.disconnect();
		}
		
		private function connectionStatusListener(connected:Boolean, errors:Array=null):void { 
			if (connected) {
			//	sendNotification(ListenersModuleConstants.CONNECTED);
			} else {
				_users = null;
				var dispatcher:Dispatcher = new Dispatcher();
				var e:StopUsersModuleEvent = new StopUsersModuleEvent(StopUsersModuleEvent.DISCONNECTED);
				e.manual_disconnect = manualDisconnect;
				dispatcher.dispatchEvent(e);
			}
		}
		
		public function muteUnmuteUser(command:VoiceConfEvent):void
		{
			_listenersService.muteUnmuteUser(command.userid, command.mute);		
		}
		
		public function muteAllUsers(command:VoiceConfEvent):void
		{	
			_listenersService.muteAllUsers(true);			
		}
		
		public function unmuteAllUsers(command:VoiceConfEvent):void{
			_listenersService.muteAllUsers(false);
		}
		
		public function muteAlmostAllUsers(command:VoiceConfEvent):void
		{	
			//find the presenter and lock them
			var pres:BBBUser = UserManager.getInstance().getConference().getPresenter();
			if (pres && pres.voiceLocked) pres = null;
			
			if (pres)
				_listenersService.lockMuteUser(int(pres.voiceUserid), true);
			
			_listenersService.muteAllUsers(true);
			
			//unlock the presenter
			if (pres)
				_listenersService.lockMuteUser(int(pres.voiceUserid), false);
		}
		
		public function lockMuteUser(command:VoiceConfEvent):void
		{
			_listenersService.lockMuteUser(command.userid, command.lock);		
		}

    public function kickUser(event:KickUserEvent):void {
      var user:BBBUser = UsersUtil.getUser(event.userid);
      _listenersService.ejectUser(user.voiceUserid);
    }
      
		public function ejectUser(command:VoiceConfEvent):void
		{
			_listenersService.ejectUser(command.userid);			
		}	
	}
}