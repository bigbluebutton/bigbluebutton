/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.video.model.services
{
	import mx.collections.ArrayCollection;
	import mx.rpc.IResponder;
	
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	public class PublisherSharedObject extends Proxy implements IResponder, IProxy
	{
		public static const NAME:String = "PublisherSharedObject";
		private var log : ILogger = LoggerModelLocator.getInstance().log;
		
		private var streams : ArrayCollection;		
		
		[Bindable] public var connected : Boolean;
				
		public function PublisherSharedObject() 
		{
			super(NAME);
			streams = new ArrayCollection();
		}
		
		public function fault(  event : Object  ) : void {
			
		}
				
		public function addStream(name : String) : void
		{
			streams.addItem(name);
		}
		
		public function get numberOfStreams() : Number
		{
			return streams.length;
		}
		
		public function hasStream(name : String) : Boolean
		{
			return streams.contains(name);
		}
		
		public function removeStream(name : String) : void
		{
			var index : Number = streams.getItemIndex(name);
			if (index != -1) streams.removeItemAt(index);
		}

		public function result(  event : Object  ) : void {
			var info : Object = event.info;
			var statusCode : String = info.code;
			
			connected = false;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					
					connected = true;

					// find out if it's a secure (HTTPS/TLS) connection
					if ( event.target.connectedProxyType == "HTTPS" || event.target.usingTLS ) {
						log.info( 	"Connected to secure server" );
					} else {
						log.info(	"Connected to server");
					}
					break;
			
				case "NetConnection.Connect.Failed" :

					log.info(	"Connection to server failed");
					break;
					
				case "NetConnection.Connect.Closed" :

					log.info(	"Connection to server closed" );
					break;
					
				case "NetConnection.Connect.InvalidApp" :
					
					log.info(	"Application not found on server");
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					
					log.info(	"Application has been shutdown");
					break;
					
				case "NetConnection.Connect.Rejected" :
					
					log.info(	"No permissions to connect to the application");
					break;
					
				default :
				   // statements
				   break;
			}
		}
	}
}