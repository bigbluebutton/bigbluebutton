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
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class MainApplicationMediator extends Mediator implements IMediator
	{
		public static const NAME:String = 'MainApplicationMediator';
		
		private var chatLoaded:Boolean = false;
		private var presentLoaded:Boolean = false;
		private var listenerLoaded:Boolean = false;
		private var viewerLoaded:Boolean = false;
		private var videoLoaded:Boolean = false;
		private var loginLoaded:Boolean = false;
		private var joinLoaded:Boolean = false;
		private var phoneLoaded:Boolean = false;
		
		public function MainApplicationMediator(mediatorName:String=null, viewComponent:Object=null)
		{
			super(NAME, viewComponent);
		}
		
		override public function listNotificationInterests():Array
		{
			return [
					MainApplicationConstants.PORT_TEST_SUCCESS,
					MainApplicationConstants.ALL_MODULES_LOADED,
					MainApplicationConstants.RESTART_MODULE,
					MainApplicationConstants.USER_LOGGED_IN,
					MainApplicationConstants.USER_JOINED,
					MainApplicationConstants.LOGOUT
					];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case MainApplicationConstants.PORT_TEST_SUCCESS:
					var portTestResult:Object = notification.getBody();
					if (portTestResult["protocol"] == "RTMP") {
						proxy.useProtocol("RTMP");
					} else {
						proxy.useProtocol("RTMPT");
					}
					proxy.moduleEventHandler(MainApplicationConstants.APP_MODEL_INITIALIZED);
					break;
				case MainApplicationConstants.ALL_MODULES_LOADED:
					LogUtil.debug(NAME + "::Received ALL_MODULES_LOADED");
					proxy.moduleEventHandler(MainApplicationConstants.APP_START);
					break;
				case MainApplicationConstants.LOGOUT:
					LogUtil.debug(NAME + '::Received LOGOUT');
					proxy.moduleEventHandler(MainApplicationConstants.LOGOUT);		
					break;
				case MainApplicationConstants.RESTART_MODULE:
					LogUtil.debug(NAME + '::Received RESTART_MODULE for ' + notification.getBody() as String);
//					proxy.stopModule(notification.getBody() as String);
					facade.sendNotification(MainApplicationConstants.MODULE_START, notification.getBody());
					break;	
				case MainApplicationConstants.USER_LOGGED_IN:
					LogUtil.debug(NAME + '::Received USER_LOGGED_IN');
					proxy.moduleEventHandler(MainApplicationConstants.USER_LOGGED_IN);
					facade.sendNotification(MainApplicationConstants.MODULE_START, "WhiteboardModule");
					break;
				case MainApplicationConstants.USER_JOINED:
					LogUtil.debug(NAME + '::Received USER_JOINED');
					proxy.moduleEventHandler(MainApplicationConstants.USER_JOINED);
					break;
			}
		}		
		
		private function get proxy():ModulesProxy {
			return facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
		}		
	}
}