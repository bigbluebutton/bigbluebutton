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
package org.bigbluebutton.modules.viewers.view
{
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;
	import org.bigbluebutton.modules.viewers.model.ViewersProxy;
	import org.bigbluebutton.modules.viewers.view.components.JoinWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The JoinWindowMediator is a mediator class for the JoinWindow gui component 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class JoinWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "JoinWindowMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _joinWindow:JoinWindow = new JoinWindow();
		public static const LOGIN:String = "Attempt Login";

		/**
		 * the constructor. registers this mediator with the JoinWindow gui component 
		 * @param view
		 * 
		 */		
		public function JoinWindowMediator(module:IBigBlueButtonModule)
		{
			super(NAME, module);
			_module = module;
			_joinWindow.addEventListener(LOGIN, login);
			_joinWindow.addEventListener(KeyboardEvent.KEY_DOWN, keyPressed);
		}
		
		/**
		 * Lists the notifications to which this mediator listens to 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{

			return [
					ViewersModuleConstants.OPEN_JOIN_WINDOW,
					ViewersModuleConstants.CLOSE_JOIN_WINDOW,
					ViewersModuleConstants.LOGIN_FAILED
			];

		
		}
		
		/**
		 * Handles specific notifications upon their reception 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{

			switch(notification.getName())
			{
				case ViewersModuleConstants.OPEN_JOIN_WINDOW:
					trace('Received request to OPEN_JOIN_WINDOW');
					
					_joinWindow.width = 350;
		   			_joinWindow.height = 270;
		   			_joinWindow.title = "Login";
		   			_joinWindow.showCloseButton = false;
		   			_joinWindow.xPosition = 450;
		   			_joinWindow.yPosition = 150;
		   			facade.sendNotification(ViewersModuleConstants.ADD_WINDOW, _joinWindow); 
					break;
					
				case ViewersModuleConstants.CLOSE_JOIN_WINDOW:
					trace('Received request to CLOSE_JOIN_WINDOW');
					_joinWindow.clear();
					facade.sendNotification(ViewersModuleConstants.REMOVE_WINDOW, _joinWindow);
					break;
					
				case ViewersModuleConstants.LOGIN_FAILED:
					_joinWindow.showError(notification.getBody() as String);
					break;
					
			}

		}
		
		protected function keyPressed(event:KeyboardEvent):void{
			if (event.keyCode == 13) login(event);
		}
		
		/**
		 * Returns the gui component which this class is a mediator of 
		 * @return 
		 * 
		 */		
		private function get joinWindow():JoinWindow{
			return viewComponent as JoinWindow;
		}
		
		/**
		 * Try to login. 
		 * @param e
		 * 
		 */		
		private function login(e:Event):void{
			var name : String = _joinWindow.nameField.text; 
		    var room : String = _joinWindow.confField.text;
		    var password : String = _joinWindow.passwdField.text
		    
		    if ((name.length < 1) || (room.length < 1) || (password.length < 1)) {
		    	_joinWindow.lblNote.text = "Please enter all the information";
		    	return;
		    } 
			_joinWindow.lblNote.text = "Attempting to Login";
			
			var completeHost:String = _module.uri + room;
			proxy.connect(completeHost, room, name, password);
		}
		
		
		private function get proxy():ViewersProxy {
			return facade.retrieveProxy(ViewersProxy.NAME) as ViewersProxy;
		}
		
		/**
		 * Initialize the notifier key of this mediator. This method need never be called directly. It is 
		 * necessary because in puremvc multicore version we cannot communicate with the facade directly
		 * through the constructor. 
		 * @param key
		 * 
		 */		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			sendNotification(ViewersFacade.DEBUG, "Started JoinWindowMediator");
		}

	}
}