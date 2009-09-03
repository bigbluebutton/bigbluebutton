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
package org.bigbluebutton.modules.video
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;

	public class VideoModuleEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "VideoModuleEndpointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_VIDEO_MODULE:String = "TO_VIDEO_MODULE";
		private static const FROM_VIDEO_MODULE:String = "FROM_VIDEO_MODULE";
		
		public function VideoModuleEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			_endpoint = new Endpoint(_router, FROM_VIDEO_MODULE, TO_VIDEO_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
				
		override public function listNotificationInterests():Array
		{
			return [
				VideoModuleConstants.CONNECTED,
				VideoModuleConstants.DISCONNECTED,
				VideoModuleConstants.STARTED_BROADCAST,
				VideoModuleConstants.STOPPED_BROADCAST,
				VideoModuleConstants.ADD_WINDOW,
				VideoModuleConstants.REMOVE_WINDOW,
				VideoModuleConstants.ADD_BUTTON
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case VideoModuleConstants.CONNECTED:
					LogUtil.debug("Sending Video MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					break;
				case VideoModuleConstants.DISCONNECTED:
					LogUtil.debug('Sending Video MODULE_STOPPED message to main');
					var info:Object = notification.getBody();
					info["moduleId"] = _module.moduleId;
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, info);
					break;
				case VideoModuleConstants.ADD_WINDOW:
					LogUtil.debug('Sending Video ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case VideoModuleConstants.REMOVE_WINDOW:
					LogUtil.debug('Sending Video REMOVE_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case VideoModuleConstants.ADD_BUTTON:
					LogUtil.debug('Sending Video ADD_BUTTON message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_BUTTON, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case VideoModuleConstants.STARTED_BROADCAST:
					LogUtil.debug('Sending Video STARTED_BROADCAST message to ViewersModule' + notification.getBody() as String);
					_endpoint.sendMessage(EndpointMessageConstants.STARTED_BROADCAST, 
							EndpointMessageConstants.TO_VIEWERS_MODULE, 
							{userid:_module.userid, streamName:notification.getBody() as String});
					break;
				case VideoModuleConstants.STOPPED_BROADCAST:
					LogUtil.debug('Sending Video STOPPED_BROADCAST message to ViewersModule ' + notification.getBody() as String);
					_endpoint.sendMessage(EndpointMessageConstants.STOPPED_BROADCAST, 
							EndpointMessageConstants.TO_VIEWERS_MODULE, 
							{userid:_module.userid, streamName:notification.getBody() as String});
					break;
			}
		}
	
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(VideoModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					//LogUtil.debug('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
				case 'VIEW_CAMERA':
					LogUtil.debug('Received VIEW_CAMERA message from ' + message.getHeader().SRC);
					facade.sendNotification(VideoModuleConstants.START_VIEW_CAMERA, message.getBody());
					break;
			}
		}
		
		private function playMessage(message:XML):void{

		}				
	}
}