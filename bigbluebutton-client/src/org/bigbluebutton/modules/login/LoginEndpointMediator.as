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
package org.bigbluebutton.modules.login
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	
	public class LoginEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "LoginEndPointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_LOGIN_MODULE:String = "TO_LOGIN_MODULE";
		private static const FROM_LOGIN_MODULE:String = "FROM_LOGIN_MODULE";
		
		private static const PLAYBACK_MESSAGE:String = "PLAYBACK_MESSAGE";
		private static const PLAYBACK_MODE:String = "PLAYBACK_MODE";
				
		public function LoginEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			LogUtil.debug(NAME + "::Creating endpoint for LoginModule");
			_endpoint = new Endpoint(_router, FROM_LOGIN_MODULE, TO_LOGIN_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
				
		override public function listNotificationInterests():Array
		{
			return [
				LoginModuleConstants.USER_LOGGEDIN,
				LoginModuleConstants.STARTED,
				LoginModuleConstants.STOPPED,
				LoginModuleConstants.ADD_WINDOW,
				LoginModuleConstants.REMOVE_WINDOW
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			LogUtil.debug(NAME + "::LoginEndPoint MSG. " + notification.getName());	
			switch(notification.getName()){
				case LoginModuleConstants.STARTED:
					LogUtil.debug(NAME + "::Sending Login MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					facade.sendNotification(LoginModuleConstants.OPEN_WINDOW);
					break;
				case LoginModuleConstants.STOPPED:
					LogUtil.debug(NAME + '::Sending Login MODULE_STOPPED message to main');
					facade.sendNotification(LoginModuleConstants.CLOSE_WINDOW);
					var info:Object = notification.getBody();
					info["moduleId"] = _module.moduleId
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, info);
					break;
				case LoginModuleConstants.ADD_WINDOW:
					LogUtil.debug(NAME + '::Sending Login ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case LoginModuleConstants.REMOVE_WINDOW:
					LogUtil.debug(NAME + '::Sending Login REMOVE_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case LoginModuleConstants.USER_LOGGEDIN:
					LogUtil.debug(NAME + '::Sending Login LOGIN_SUCCESS message to main');
					_endpoint.sendMessage(EndpointMessageConstants.USER_LOGGED_IN, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
			}
		}
	
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(LoginModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					//LogUtil.debug('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
			}
		}
		
		private function playMessage(message:XML):void{

		}				
	}
}