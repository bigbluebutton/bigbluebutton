/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
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
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.model.PortTestProxy;
	
	public class ModulesProxy {
		private static const LOGGER:ILogger = getClassLogger(ModulesProxy);      

		private var modulesManager:ModuleManager;
		private var portTestProxy:PortTestProxy;
		private var modulesDispatcher:ModulesDispatcher;
		
    	private var _user:Object;
    
		public function ModulesProxy() {
			modulesDispatcher = new ModulesDispatcher();
			portTestProxy = new PortTestProxy(modulesDispatcher);
			modulesManager = new ModuleManager(modulesDispatcher);
		}
		
		public function get username():String {
			return _user.username;
		}

		public function portTestSuccess(tunnel:Boolean):void {
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["initialization"];
            logData.tunnel = tunnel;
            logData.message = "Successfully tested connection to server.";
            LOGGER.info(JSON.stringify(logData));
                
			modulesManager.useProtocol(tunnel);
			modulesManager.startUserServices();
		}
						
		public function loadModule(name:String):void {
			modulesManager.loadModule(name);
		}
		
		public function getPortTestHost():String {
			return modulesManager.portTestHost;
		}
		
		public function getPortTestApplication():String {
			return modulesManager.portTestApplication;
		}

		public function getPortTestTimeout():Number {
			return modulesManager.portTestTimeout;
		}
		
		public function handleConfigLoaded():void {
			modulesManager.configLoaded();	
		}
		
		public function handleLoadConfig():void {
			modulesManager.loadConfig();
		}
		
		public function testRTMP():void{
			portTestProxy.connect(false /*"RTMP"*/, getPortTestHost(), "1935", getPortTestApplication(), getPortTestTimeout());
		}

		public function testRTMPT(tunnel:Boolean):void {
			if (!tunnel) {
				// Try to test using rtmpt as rtmp failed.
				portTestProxy.connect(true /*"RTMPT"*/, getPortTestHost(), "", getPortTestApplication(), getPortTestTimeout());
			} else {
				modulesDispatcher.sendTunnelingFailedEvent(getPortTestHost(), getPortTestApplication());
			}
		}

		public function loadAllModules():void{
			modulesManager.loadAllModules();
		}
		
		public function handleLogout():void {
			modulesManager.handleLogout();
		}

	    public function startLayoutModule():void{
	      modulesManager.startLayoutModule();
	    }
    
		public function startAllModules():void{
			modulesManager.startAllModules();
		}
	}
}
