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
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.PortTestEvent;

	public class PortTestProxy
	{
		
		private var nc:NetConnection;
		private var protocol:String;
		private var port:String;
		private var hostname:String;
		private var application:String;
		private var uri:String;
		private var dispatcher:Dispatcher;
		
		public function PortTestProxy()
		{
			dispatcher = new Dispatcher();
		}
		
		public function connect(protocol:String = "",
								  hostname:String = "",
								  port:String = "",
								  application:String = ""):void
		{
			var portTest:PortTest = new PortTest(protocol,hostname,port,application);
			portTest.addConnectionSuccessListener(connectionListener);
			portTest.connect();
		}
		
		private function connectionListener(status:String, protocol:String, hostname:String, port:String, application:String):void {
			uri = protocol + "://" + hostname + "/" + application;
			if (status == "SUCCESS") {				
				LogUtil.debug("Successfully connected to " + uri);
				
				var portEvent:PortTestEvent = new PortTestEvent(PortTestEvent.PORT_TEST_SUCCESS);
				portEvent.port = port;
				portEvent.hostname = hostname;
				portEvent.protocol = protocol;
				portEvent.app = application;
				dispatcher.dispatchEvent(portEvent);
				
			} else {
				LogUtil.error("Failed to connect to " + uri);
				var portFailEvent:PortTestEvent = new PortTestEvent(PortTestEvent.PORT_TEST_FAILED);
				portFailEvent.port = port;
				portFailEvent.hostname = hostname;
				portFailEvent.protocol = protocol;
				portFailEvent.app = application;
				dispatcher.dispatchEvent(portFailEvent);
			}				 		
		}
		
		public function connect1(protocol:String = "",
								  hostname:String = "",
								  port:String = "",
								  application:String = ""):void
		{
			this.protocol = protocol;
			this.hostname = hostname;
			this.port = port;
			this.application = application;
			
			nc = new NetConnection();
			nc.client = this;
			nc.addEventListener( NetStatusEvent.NET_STATUS, netStatusEventHandler );

			uri = protocol + "://" + hostname + "/" + application;
			LogUtil.debug("Testing connection to " + uri);
			try 
			{
				nc.connect( uri );
			}
			catch(e:ArgumentError) 
			{
				LogUtil.error("Incorrect arguments on connecting wiht port testing");
				//facade.sendNotification(MainApplicationConstants.PORT_TEST_FAILED, 
				// 		{protocol:protocol, hostname:hostname, port:port, application:application});
			}	
		}
			
		public function close() : void
		{	
			nc.removeEventListener(NetStatusEvent.NET_STATUS, netStatusEventHandler);
			nc.close();
		}
	
		protected function netStatusEventHandler(event:NetStatusEvent):void 
		{
			var info:Object = event.info;
			var statusCode : String = info.code;
			
			if ( statusCode == "NetConnection.Connect.Success" )
			{
				LogUtil.debug("Successfully connected to " + uri);
				var portEvent:PortTestEvent = new PortTestEvent(PortTestEvent.PORT_TEST_SUCCESS);
				portEvent.port = port;
				portEvent.hostname = hostname;
				portEvent.protocol = protocol;
				portEvent.app = application;
				dispatcher.dispatchEvent(portEvent);
			}
			else if ( statusCode == "NetConnection.Connect.Rejected" ||
				 	  statusCode == "NetConnection.Connect.Failed" || 
				 	  statusCode == "NetConnection.Connect.Closed" ) 
			{
				LogUtil.error("Failed to connect to " + uri);

				var portFailEvent:PortTestEvent = new PortTestEvent(PortTestEvent.PORT_TEST_FAILED);
				portFailEvent.port = port;
				portFailEvent.hostname = hostname;
				portFailEvent.protocol = protocol;
				portFailEvent.app = application;
				dispatcher.dispatchEvent(portFailEvent);
				
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