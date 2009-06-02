/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.phone.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.phone.PhoneModuleConstants;
	import org.bigbluebutton.modules.phone.view.components.PhoneWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	
	public class PhoneWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PhoneMediator";
		public static const NEW_MESSAGE:String = "newMessage";
		
		private var _module:PhoneModule;
		private var _phoneWindow:PhoneWindow;
		private var _phoneWindowOpen:Boolean = false;
		
		public function PhoneWindowMediator(module:PhoneModule)
		{
			super(NAME, module);
			_module = module;
			_phoneWindow = new PhoneWindow();
			_phoneWindow.red5URL = _module.uri;
			_phoneWindow.username = _module.sipUsername;
			_phoneWindow.password = _module.sipPassword;
			_phoneWindow.realm = _module.sipRealm;
			_phoneWindow.server = _module.sipServer;
			_phoneWindow.confRoom = _module.sipConfRoom;
		}

        private function time() : String
		{
			var date:Date = new Date();
			var t:String = date.toLocaleTimeString();
			return t;
		}		

		public function onCallMessage(e:CallMessageEvent):void
		{
			proxy.call(e.phone);
		}
			
		override public function listNotificationInterests():Array
		{
			return [
					PhoneModuleConstants.CLOSE_WINDOW,
					PhoneModuleConstants.OPEN_WINDOW
				   ];
		}
						
		/**
		 * Handlers for notification(s) this class is listening to 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName())
			{	
				case PhoneModuleConstants.CLOSE_WINDOW:
					if (_phoneWindowOpen) {
						facade.sendNotification(PhoneModuleConstants.REMOVE_WINDOW, _phoneWindow);
						_phoneWindowOpen = false;
					}
					break;					
				case PhoneModuleConstants.OPEN_WINDOW:
		   			_phoneWindow.width = 250;
		   			_phoneWindow.height = 220;
		   			_phoneWindow.title = "Group Phone";
		   			_phoneWindow.showCloseButton = false;
		   			_phoneWindow.xPosition = 675;
		   			_phoneWindow.yPosition = 0;
		   			facade.sendNotification(PhoneModuleConstants.ADD_WINDOW, _phoneWindow); 
		   			_phoneWindowOpen = true;
		   			proxy.getPhoneTranscript();
					break;
			}
		}
			
		public function get proxy():PhoneProxy
		{
			return facade.retrieveProxy(PhoneProxy.NAME) as PhoneProxy;
		} 
	}
}