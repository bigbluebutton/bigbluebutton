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
package org.bigbluebutton.main.model
{
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	public class ModulesProxy extends Proxy implements IProxy
	{
		public static const NAME:String = 'ModulesProxy';
		
		private var modulesManager:BbbModuleManager;
		
		private var _user:Object;
		private var _router:Router;
		private var _mode:String;
		
		public function ModulesProxy(router:Router, mode:String)
		{
			super(NAME);
			_router = router;
			_mode = mode;
			modulesManager = new BbbModuleManager(_router, _mode);
			modulesManager.addInitializedListener(onInitializeComplete);
			modulesManager.addModuleLoadedListener(onModuleLoadedListener);
			modulesManager.initialize();
		}

		private function onInitializeComplete(initialized:Boolean):void {
			if (initialized)
			facade.sendNotification(MainApplicationConstants.APP_MODEL_INITIALIZED);
		}
			
		public function initialize():void {
			modulesManager.initialize();			
		}
		
		public function set user(loggedInUser:Object):void {
			_user = loggedInUser;
			modulesManager.loggedInUser(_user);
		}
		
		public function get username():String {
			return _user.username;
		}

		public function useProtocol(protocol:String):void {
			modulesManager.useProtocol(protocol);
		}

//		public function startModule(name:String, router:Router):void {
//			LogUtil.debug('Request to start module ' + name);
//			modulesManager.startModule(name, router);
//		}

//		public function stopModule(name:String):void {
//			modulesManager.stopModule(name);
//		}
						
		public function loadModule(name:String):void {
			LogUtil.debug('Loading ' + name);
			modulesManager.loadModule(name);
		}
				
		private function onModuleLoadedListener(event:String, name:String, progress:Number=0):void {
			switch(event) {
				case MainApplicationConstants.MODULE_LOAD_PROGRESS:
					facade.sendNotification(MainApplicationConstants.MODULE_LOAD_PROGRESS, {name:name, progress:progress});
				break;	
				case MainApplicationConstants.MODULE_LOAD_READY:
					facade.sendNotification(MainApplicationConstants.LOADED_MODULE, name);
				break;
				case MainApplicationConstants.ALL_MODULES_LOADED:
					LogUtil.debug(NAME + " All modules have been loaded.");
					facade.sendNotification(MainApplicationConstants.ALL_MODULES_LOADED);					
				break;				
			}			
		}		
		
		public function moduleEventHandler(event:String):void {
			switch (event) {
				case MainApplicationConstants.APP_MODEL_INITIALIZED:
					modulesManager.handleAppModelInitialized();
					break;
				case MainApplicationConstants.APP_START:
					modulesManager.handleAppStart();
					break;
				case MainApplicationConstants.USER_LOGGED_IN:
					modulesManager.handleUserLoggedIn();
					break;
				case MainApplicationConstants.USER_JOINED:
					modulesManager.handleUserJoined();
					break;
				case MainApplicationConstants.LOGOUT:
					modulesManager.handleLogout();
					break;
			}
		}
		
		public function getVersion():String {
			return modulesManager.getAppVersion();
		}
		
		public function getNumberOfModules():int {
			return modulesManager.getNumberOfModules();
		}
		
		public function getPortTestHost():String {
			return modulesManager.portTestHost;
		}
		
		public function getPortTestApplication():String {
			return modulesManager.portTestApplication;
		}
	}
}