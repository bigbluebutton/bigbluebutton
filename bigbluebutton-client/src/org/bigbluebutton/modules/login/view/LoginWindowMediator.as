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
package org.bigbluebutton.modules.login.view
{
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.login.LoginModuleConstants;
	import org.bigbluebutton.modules.login.model.LoginProxy;
	import org.bigbluebutton.modules.login.view.components.LoginWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The JoinWindowMediator is a mediator class for the JoinWindow gui component 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class LoginWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "JoinWindowMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _joinWindow:LoginWindow = new LoginWindow();
		public static const LOGIN:String = "Attempt Login";

		/**
		 * the constructor. registers this mediator with the JoinWindow gui component 
		 * @param view
		 * 
		 */		
		public function LoginWindowMediator(module:IBigBlueButtonModule)
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
					LoginModuleConstants.LOGIN_FAILED,
					LoginModuleConstants.LOGIN_SUCCESS,
					LoginModuleConstants.OPEN_WINDOW,
					LoginModuleConstants.CLOSE_WINDOW
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
				case LoginModuleConstants.OPEN_WINDOW:
					LogUtil.debug('Received request to OPEN_JOIN_WINDOW');
					
					_joinWindow.width = 350;
		   			_joinWindow.height = 270;
		   			_joinWindow.title = "Login";
		   			_joinWindow.showCloseButton = false;
		   			_joinWindow.xPosition = 450;
		   			_joinWindow.yPosition = 150;
		   			facade.sendNotification(LoginModuleConstants.ADD_WINDOW, _joinWindow); 
					break;
					
				case LoginModuleConstants.CLOSE_WINDOW:
					LogUtil.debug('Received request to CLOSE_JOIN_WINDOW');
					_joinWindow.clear();
					facade.sendNotification(LoginModuleConstants.REMOVE_WINDOW, _joinWindow);
					break;
					
				case LoginModuleConstants.LOGIN_FAILED:
					LogUtil.debug('Received request to LOGIN_FAILED');
					_joinWindow.showError(notification.getBody()["message"]);
					break;
					
				case LoginModuleConstants.LOGIN_SUCCESS:
					LogUtil.debug('Received request to LOGIN_SUCCESS');
					_joinWindow.clear();
					facade.sendNotification(LoginModuleConstants.REMOVE_WINDOW, _joinWindow);
					facade.sendNotification(LoginModuleConstants.USER_LOGGEDIN);
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
		private function get loginWindow():LoginWindow{
			return viewComponent as LoginWindow;
		}
		
		/**
		 * Try to login. 
		 * @param e
		 * 
		 */		
		private function login(e:Event):void{
			LogUtil.debug('Received login event');
			var name : String = _joinWindow.nameField.text; 
		    var room : String = _joinWindow.confField.text;
		    var password : String = _joinWindow.passwdField.text
		    
		    if ((name.length < 1) || (room.length < 1) || (password.length < 1)) {
		    	_joinWindow.lblNote.text = "Please enter all the information.";
		    	return;
		    } 
			_joinWindow.lblNote.text = "Attempting to Login.";
			
			proxy.login(name, room, password);
		}
		
		
		private function get proxy():LoginProxy {
			return facade.retrieveProxy(LoginProxy.NAME) as LoginProxy;
		}
	}
}