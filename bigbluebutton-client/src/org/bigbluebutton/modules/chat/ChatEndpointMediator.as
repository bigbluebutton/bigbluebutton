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
package org.bigbluebutton.modules.chat
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.modules.chat.model.business.UserVO;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	
	public class ChatEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ChatEndPointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_CHAT_MODULE:String = "TO_CHAT_MODULE";
		private static const FROM_CHAT_MODULE:String = "FROM_CHAT_MODULE";
		
		private static const PLAYBACK_MESSAGE:String = "PLAYBACK_MESSAGE";
		private static const PLAYBACK_MODE:String = "PLAYBACK_MODE";
				
		public function ChatEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			LogUtil.debug("Creating endpoint for ChatModule");
			_endpoint = new Endpoint(_router, FROM_CHAT_MODULE, TO_CHAT_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
				
		override public function listNotificationInterests():Array
		{
			return [
				ChatModuleConstants.CONNECTED,
				ChatModuleConstants.DISCONNECTED,
				ChatModuleConstants.ADD_WINDOW,
				ChatModuleConstants.REMOVE_WINDOW
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			LogUtil.debug("ChatEndPoint MSG. " + notification.getName());	
			switch(notification.getName()){
				case ChatModuleConstants.CONNECTED:
					LogUtil.debug("Sending Chat MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
				case ChatModuleConstants.DISCONNECTED:
					LogUtil.debug('Sending Chat MODULE_STOPPED message to main');
					facade.sendNotification(ChatModuleConstants.CLOSE_WINDOW);
					//var info:Object = notification.getBody();
					var info:Object = new Object()
					info["moduleId"] = _module.moduleId
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, info);
					break;
				case ChatModuleConstants.ADD_WINDOW:
					LogUtil.debug('Sending Chat ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case ChatModuleConstants.REMOVE_WINDOW:
					LogUtil.debug('Sending Chat REMOVE_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
			}
		}
	
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(ChatModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					//LogUtil.debug('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
				case EndpointMessageConstants.NEW_PARTICIPANT:
					var userToAdd:Object = message.getBody(); //Has username, userid, userrole parameters
					var newUser:UserVO = new UserVO(userToAdd.username, userToAdd.userid);
					facade.sendNotification(ChatModuleConstants.ADD_PARTICIPANT, newUser);
					break;
				case EndpointMessageConstants.PARTICIPANT_LEFT:
					var userToRemove:Object = message.getBody();
					facade.sendNotification(ChatModuleConstants.REMOVE_PARTICIPANT, userToRemove.username as String);
					break;
			}
		}
		
		private function playMessage(message:XML):void{

		}				
	}
}