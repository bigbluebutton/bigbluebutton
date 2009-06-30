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
package org.bigbluebutton.main
{
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	
	import mx.logging.Log;
	
	public class MainEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "MainEndpointMediator";

		private var _router : Router;
		private var _endpoint:Endpoint;
				
		public function MainEndpointMediator()
		{
			super(NAME);
			_router = new Router();
			_endpoint = new Endpoint(_router, EndpointMessageConstants.FROM_MAIN_APP, EndpointMessageConstants.TO_MAIN_APP, messageReceiver);		
		}
		
		public function get router():Router
		{
			return _router;
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
		
		private function get modulesProxy():ModulesProxy {
			return facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
		}
		
		override public function listNotificationInterests():Array
		{
			return [
				MainApplicationConstants.MODULE_START,
				MainApplicationConstants.MODULE_STOP,
				MainApplicationConstants.OPEN_WINDOW,
				MainApplicationConstants.CLOSE_WINDOW
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case MainApplicationConstants.MODULE_START:
					var startModule:String = notification.getBody() as String;
					LogUtil.debug(NAME + "::Request to start module " + startModule);
//					modulesProxy.startModule(startModule, _router);						
					break;
				case MainApplicationConstants.MODULE_STOP:
					var stopModule:String = notification.getBody() as String;
					LogUtil.debug(NAME + "::Request to stop module " + stopModule);
//					modulesProxy.stopModule(stopModule);						
					break;				
			}
		}

		private function messageReceiver(message : IPipeMessage) : void
		{			
			var msg:String = message.getHeader().MSG as String;	
							
			switch (msg)
			{
				case EndpointMessageConstants.USER_JOINED:
					LogUtil.debug(NAME + "::Got USER_JOINED from " + message.getHeader().SRC as String);
					modulesProxy.user = message.getBody();
					sendNotification(MainApplicationConstants.USER_JOINED, message.getBody());
					break;
					
				case EndpointMessageConstants.USER_LOGGED_IN:
					LogUtil.debug(NAME + "::Got USER_LOGGED_IN from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.USER_LOGGED_IN);
					break;
				case EndpointMessageConstants.USER_LOGGED_OUT:
					LogUtil.debug(NAME + "::Got USER_LOGGED_OUT from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.USER_LOGGED_OUT);
					break;
				case EndpointMessageConstants.MODULE_STARTED:
					LogUtil.debug(NAME + "::Got MODULE_STARTED from " + message.getBody() as String);
//					modulesProxy.moduleStarted(message.getBody() as String, true);
					break;
				case EndpointMessageConstants.MODULE_STOPPED:
					LogUtil.debug(NAME + "::Got MODULE_STOPPED from " + message.getBody() as String);					
					var info:Object = message.getBody();
//					modulesProxy.moduleStarted(info.moduleId, false);
					if ( (info.moduleId == "ChatModule") || (info.moduleId == "VideoModule") ||
							(info.moduleId == "ListenersModule") || (info.moduleId == "PresentationModule")){
						LogUtil.debug(info.moduleId + " has stopped [" + info.manual + "]");
						if (! info.manual)
						sendNotification(MainApplicationConstants.MODULE_STOPPED, message.getBody());
					}
					break;
				case EndpointMessageConstants.ADD_WINDOW:
					LogUtil.debug(NAME + "::Got ADD_WINDOW from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.ADD_WINDOW_MSG, message.getBody());
					break;
				case EndpointMessageConstants.ADD_BUTTON:
					LogUtil.debug(NAME + "::Got ADD_BUTTON from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.ADD_BUTTON, message.getBody());
					break;
				case EndpointMessageConstants.REMOVE_WINDOW:
					LogUtil.debug(NAME + "::Got REMOVE_WINDOW from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.REMOVE_WINDOW_MSG, message.getBody());
					break;		
				case EndpointMessageConstants.ASSIGN_PRESENTER:
					LogUtil.debug(NAME + "::Got ASSIGN_PRESENTER from " + message.getHeader().SRC as String);
					_endpoint.sendMessage(EndpointMessageConstants.ASSIGN_PRESENTER, 
							EndpointMessageConstants.TO_PRESENTATION_MODULE, message.getBody());
					break;			
				case EndpointMessageConstants.BECOME_VIEWER:
					LogUtil.debug(NAME + "::Got BECOME_VIEWER from " + message.getHeader().SRC as String);
					_endpoint.sendMessage(EndpointMessageConstants.BECOME_VIEWER, 
							EndpointMessageConstants.TO_PRESENTATION_MODULE, message.getBody());
					break;
			}
		}	
	}
}