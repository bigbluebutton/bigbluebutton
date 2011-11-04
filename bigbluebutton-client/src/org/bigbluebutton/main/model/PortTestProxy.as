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
package org.bigbluebutton.main.model {
	import com.asfusion.mate.events.Dispatcher;
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.PortTestEvent;
	import org.bigbluebutton.main.model.modules.ModulesDispatcher;

	public class PortTestProxy {
		private var nc:NetConnection;
		private var protocol:String;
		private var port:String;
		private var hostname:String;
		private var application:String;
		private var uri:String;
		private var modulesDispatcher:ModulesDispatcher;
		
		public function PortTestProxy() {
			modulesDispatcher = new ModulesDispatcher();
		}
		
		public function connect(protocol:String = "", hostname:String = "", port:String = "", application:String = ""):void {
			var portTest:PortTest = new PortTest(protocol,hostname,port,application);
			portTest.addConnectionSuccessListener(connectionListener);
			portTest.connect();
		}
		
		private function connectionListener(status:String, protocol:String, hostname:String, port:String, application:String):void {
			uri = protocol + "://" + hostname + "/" + application;
			if (status == "SUCCESS") {				
				LogUtil.debug("Successfully connected to " + uri);
				modulesDispatcher.sendPortTestSuccessEvent(port, hostname, protocol, application);
				
			} else {
				LogUtil.error("Failed to connect to " + uri);
				
				modulesDispatcher.sendPortTestFailedEvent(port, hostname, protocol, application);
			}				 		
		}
					
		public function close():void {	
			nc.removeEventListener(NetStatusEvent.NET_STATUS, netStatusEventHandler);
			nc.close();
		}
	
		protected function netStatusEventHandler(event:NetStatusEvent):void  {
			var info:Object = event.info;
			var statusCode : String = info.code;
			
			if (statusCode == "NetConnection.Connect.Success") {
				LogUtil.debug("Successfully connected to " + uri);
				modulesDispatcher.sendPortTestSuccessEvent(port, hostname, protocol, application);
			} else if (statusCode == "NetConnection.Connect.Rejected" ||
				 	  statusCode == "NetConnection.Connect.Failed" || 
				 	  statusCode == "NetConnection.Connect.Closed" ) {
				LogUtil.error("Failed to connect to " + uri);
				modulesDispatcher.sendPortTestFailedEvent(port, hostname, protocol, application);
			} else {
				LogUtil.error("Failed to connect to " + uri + " due to " + statusCode);
			}
			// Close NetConnection.
			close();
		}
		
		/**
		 * The Red5 oflaDemo returns bandwidth stats.
		 */		
		public function onBWDone() : void {	}
	}
}