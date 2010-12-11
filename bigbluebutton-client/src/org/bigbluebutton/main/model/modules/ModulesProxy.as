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
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.PortTestEvent;
	import org.bigbluebutton.main.events.SuccessfulLoginEvent;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.PortTestProxy;
	import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
	import org.bigbluebutton.modules.chat.events.StartChatModuleEvent;
	import org.bigbluebutton.modules.chat.events.StopChatModuleEvent;
	import org.bigbluebutton.modules.present.events.PresentModuleEvent;
	import org.bigbluebutton.modules.videoconf.events.OpenPublishWindowEvent;
	
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
		
		public function loadAllModules(params:ConferenceParameters):void
		{
			modulesManager.loadAllModules(params);
		}
		
		public function commandReceived(params:String):void
		{
			if(params == "CHAT_START")
			{
				modulesManager.startModule("ChatModule");
			}
			else if(params == "CHAT_STOP")
			{
				modulesManager.stopModule("ChatModule");
			}
			else if(params == "PRESENT_START")
			{
				modulesManager.startModule("PresentModule");
			}
			else if(params == "PRESENT_STOP")
			{
				modulesManager.stopModule("PresentModule");
			}
			else if(params == "VIDEO_START")
			{
				modulesManager.startModule("VideoconfModule");
			}
			else if(params == "VIDEO_STOP")
			{
				modulesManager.stopModule("VideoconfModule");
			}
			else if(params == "VIDEO1_START")
			{
				var globalDispatcher:Dispatcher = new Dispatcher();
				globalDispatcher.dispatchEvent(new OpenPublishWindowEvent());
			}
			else if(params == "VIDEO1_STOP")
			{
				modulesManager.stopModule("VideoconfModule");
			}
			else if(params == "PHONE_START")
			{
				modulesManager.startModule("PhoneModule");
			}
			else if(params == "PHONE_STOP")
			{
				modulesManager.stopModule("PhoneModule");
			}
			else if(params == "VIEWERS_START")
			{
				modulesManager.startModule("ViewersModule");
			}
			else if(params == "VIEWERS_STOP")
			{
				modulesManager.stopModule("ViewersModule");
			}
		}
	}
}