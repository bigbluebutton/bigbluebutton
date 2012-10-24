/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/
package org.bigbluebutton.main.model.modules
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.PortTestEvent;
	import org.bigbluebutton.main.events.SuccessfulLoginEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.PortTestProxy;
	
	public class ModulesProxy {
		
		private var modulesManager:ModuleManager;
		private var portTestProxy:PortTestProxy;
		
		private var _user:Object;
		
		private var modulesDispatcher:ModulesDispatcher;
		
		public function ModulesProxy() {
			modulesDispatcher = new ModulesDispatcher();
			portTestProxy = new PortTestProxy();
			modulesManager = new ModuleManager();
		}
		
		public function get username():String {
			return _user.username;
		}

		public function portTestSuccess(protocol:String):void {
			modulesManager.useProtocol(protocol);
			modulesManager.startUserServices();
		}
						
		public function loadModule(name:String):void {
			LogUtil.debug('Loading ' + name);
			modulesManager.loadModule(name);
		}
		
		public function getPortTestHost():String {
			return modulesManager.portTestHost;
		}
		
		public function getPortTestApplication():String {
			return modulesManager.portTestApplication;
		}
		
		public function testRTMP():void{
			portTestProxy.connect("RTMP", getPortTestHost(), "1935", getPortTestApplication());
		}
		
		public function testRTMPT(protocol:String):void{
			if (protocol == "RTMP") portTestProxy.connect("RTMPT", getPortTestHost(), "", getPortTestApplication());
			else modulesDispatcher.sendTunnelingFailedEvent();
		}
		
		public function loadAllModules(params:ConferenceParameters):void{
			modulesManager.loadAllModules(params);
		}
		
		public function handleLogout():void {
			modulesManager.handleLogout();
		}
		
		public function startAllModules():void{
			modulesManager.startAllModules();
		}
	}
}