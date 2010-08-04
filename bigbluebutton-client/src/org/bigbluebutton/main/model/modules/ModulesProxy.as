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
package org.bigbluebutton.main.model.modules
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.controls.Alert;
	import mx.modules.ModuleManager;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.SuccessfulLoginEvent;
	import org.bigbluebutton.main.events.PortTestEvent;
	import org.bigbluebutton.modules.viewers.events.LoginSuccessEvent;
	import org.bigbluebutton.main.model.PortTestProxy;
	
	public class ModulesProxy {
		
		private var modulesManager:org.bigbluebutton.main.model.modules.ModuleManager;
		private var portTestProxy:PortTestProxy;
		
		private var _user:Object;
		
		private var dispatcher:Dispatcher;
		
		public function ModulesProxy() {
			dispatcher = new Dispatcher();
			portTestProxy = new PortTestProxy();
			modulesManager = new org.bigbluebutton.main.model.modules.ModuleManager();
			modulesManager.addInitializedListener(onInitializeComplete);
			modulesManager.initialize();
		}

		private function onInitializeComplete(initialized:Boolean):void {
			if (initialized){
				var e:PortTestEvent = new PortTestEvent(PortTestEvent.TEST_RTMP);
				dispatcher.dispatchEvent(e);
			}
		}
			
		public function initialize():void {
			modulesManager.initialize();			
		}
		
		public function get username():String {
			return _user.username;
		}

		public function portTestSuccess(e:PortTestEvent):void {
			modulesManager.useProtocol(e.protocol);
			modulesManager.startUserServices();
		}
						
		public function loadModule(name:String):void {
			LogUtil.debug('Loading ' + name);
			modulesManager.loadModule(name);
		}
		
		public function getVersion():String {
			return modulesManager.getAppVersion();
		}
		
		public function getLocaleVersion():String {
			return modulesManager.getLocaleVersion();
		}
		
		public function getNumberOfModules():int {
			Alert.show("" + modulesManager.getNumberOfModules());
			return modulesManager.getNumberOfModules();
		}
		
		public function getPortTestHost():String {
			return modulesManager.portTestHost;
		}
		
		public function getPortTestApplication():String {
			return modulesManager.portTestApplication;
		}
		
		public function testRTMP(e:PortTestEvent):void{
			portTestProxy.connect("RTMP", getPortTestHost(), "1935", getPortTestApplication());
		}
		
		public function testRTMPT(e:PortTestEvent):void{
			if (e.protocol == "RTMP") portTestProxy.connect("RTMPT", getPortTestHost(), "", getPortTestApplication());
			else dispatcher.dispatchEvent(new PortTestEvent(PortTestEvent.TUNNELING_FAILED));
		}
		
		public function loadAllModules(e:SuccessfulLoginEvent):void{
			modulesManager.loadAllModules(e.conferenceParameters);
		}
		
		public function handleLogout():void{
			//TODO
		}
	}
}