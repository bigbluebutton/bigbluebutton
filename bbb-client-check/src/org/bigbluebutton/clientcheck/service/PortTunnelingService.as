/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.clientcheck.service
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.Socket;
	
	import org.bigbluebutton.clientcheck.model.CustomSocket;
	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.test.PortTest;
	
	public class PortTunnelingService implements IPortTunnelingService
	{
		[Inject]
		public var systemConfiguration:ISystemConfiguration;
		
		private var _socket:CustomSocket;
		
		private var _sockets:Array=new Array;
		
		public function init():void
		{	
			for (var i:int=0; i < systemConfiguration.ports.length; i++)
			{
				try
				{
					_socket=new CustomSocket();
					_sockets.push(_socket); 
					_socket.addEventListener(Event.CONNECT, socketConnectHandler);
					_socket.addEventListener(IOErrorEvent.IO_ERROR, socketIoErrorHandler);
					_socket.addEventListener(SecurityErrorEvent.SECURITY_ERROR, socketSecurityErrorHandler);
					_socket.connect(systemConfiguration.serverName, systemConfiguration.ports[i].portNumber);  
				}
				catch (error:Error)
				{
					// TODO: create a popup window here to notify user that error occured
				}
			}
		}
		
		private function getPortItemByPortName(port:String):PortTest
		{
			for (var i:int=0; i < systemConfiguration.ports.length; i++)
			{
				if (systemConfiguration.ports[i].portNumber == port)
					return systemConfiguration.ports[i];
			}
			return null;
		}
		
		private function getSocketItemByPortName(port:int):CustomSocket
		{
			for (var i:int=0; i < _sockets.length; i++)
			{
				if (_sockets[i].port == port)
					return _sockets[i];
			}
			return null;
		}
		
		protected function socketIoErrorHandler(event:IOErrorEvent):void
		{
			genericErrorHandler(event);
		}
		
		protected function socketConnectHandler(event:Event):void
		{
			var port:PortTest=getPortItemByPortName(event.currentTarget.port);
			port.testResult=event.type;
			port.testSuccessfull=true;
			
			getSocketItemByPortName(event.currentTarget.port).close();
		}

		protected function socketSecurityErrorHandler(event:SecurityErrorEvent):void {
			genericErrorHandler(event);
		}

		protected function genericErrorHandler(event:Event):void {
			var port:PortTest=getPortItemByPortName(event.currentTarget.port);
			port.testResult=event.type;
			port.testSuccessfull=false;
			
			getSocketItemByPortName(event.currentTarget.port).close();
		}
	}
}
