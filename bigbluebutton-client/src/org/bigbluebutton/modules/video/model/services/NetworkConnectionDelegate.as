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
	import flash.events.*;
	import flash.net.*;
	
	import org.bigbluebutton.modules.video.model.business.PublisherModel;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 *  The NetworkConnectionDelegate class is a proxy class for the red5 server
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class NetworkConnectionDelegate extends Proxy implements IProxy
	{	
		public static const NAME:String = "NetworkConnectionDelegate";
			
		private var netConnection : NetConnection;
			
		/**
		 * Creates a new NetworkConnectionDelegate 
		 * 
		 */		
		public function NetworkConnectionDelegate()
		{			
			super(NAME);
		}
		
		public function get connection() : NetConnection
		{
			return netConnection;
		}	
		
		private function get model():PublisherModel{
			return facade.retrieveProxy(PublisherModel.NAME) as PublisherModel;
		}
		
		/**
		 * Creates a new NetConnection object and registers listeners for it 
		 * @param uri
		 * @param proxy
		 * @param encoding
		 * 
		 */		
		public function connect( uri:String, proxy:String, encoding:uint ) : void
		{			
			netConnection = new NetConnection();			
			netConnection.client = this;			
			netConnection.objectEncoding = encoding;
			netConnection.proxyType = proxy;
			
			netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			
			try {				
				//log.debug("NetConnection::Connecting to <b>" + uri + "</b>");
				netConnection.connect( uri );
			}
			catch( e : ArgumentError ) 
			{
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :
						//log.error( "NetConnection::Invalid server location: <b>" + uri + "</b>");
						break;
						
					default :
					   //
					   break;
				}
			}	
		}
			
		/**
		 * Closes the NetConnection 
		 * 
		 */		
		public function close() : void
		{
			netConnection.close();
		}
					
		/**
		 * Called when the NetConnection generates a net_status event. Redirects to the handleResult method
		 * @param event
		 * 
		 */		
		protected function netStatus( event : NetStatusEvent ) : void 
		{
			handleResult( event );
		}
			
		/**
		 * Called when the NetConnection generates a security_error_event 
		 * @param event
		 * 
		 */		
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
		    handleFault( new SecurityErrorEvent ( SecurityErrorEvent.SECURITY_ERROR, false, true,
		    										  "Security error - " + event.text ) );
		}
			
		/**
		 * Called when the NetConnection generates a net_io_error event 
		 * @param event
		 * 
		 */		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			handleFault( new IOErrorEvent ( IOErrorEvent.IO_ERROR, false, true, 
							 "Input/output error - " + event.text ) );
		}
			
		/**
		 * Called when the NetConnection generates an async_error_event 
		 * @param event
		 * 
		 */		
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			handleFault( new AsyncErrorEvent ( AsyncErrorEvent.ASYNC_ERROR, false, true,
							 "Asynchronous code error - <i>" + event.error + "</i>" ) );
		}
	
		/**
		 * Called when the NetConnection generates a net_status event
		 * @param event
		 * 
		 */		
		public function handleResult(  event : Object  ) : void {
			var info : Object = event.info;
			var statusCode : String = info.code;
			
			//log.debug( "NetworkConnectionDelegate::" + statusCode );
			
			model.connected = false;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					
					model.connected = true;
					
					// find out if it's a secure (HTTPS/TLS) connection
					if ( event.target.connectedProxyType == "HTTPS" || event.target.usingTLS ) {
						//log.info( "NetworkConnectionDelegate::Connected to secure server");
					} else {
						//log.info("NetworkConnectionDelegate::Connected to server");
					}
					break;
			
				case "NetConnection.Connect.Failed" :
					
					serverDisconnect();
					
					//log.warn("NetworkConnectionDelegate::Connection to server failed" );
					break;
					
				case "NetConnection.Connect.Closed" :
					
					serverDisconnect();
					
					//log.warn("NetworkConnectionDelegate::Connection to server closed");
					break;
					
				case "NetConnection.Connect.InvalidApp" :
					//log.warn("NetworkConnectionDelegate::Application not found on server" );
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					//log.warn("NetworkConnectionDelegate::Application has been shutdown");
					break;
					
				case "NetConnection.Connect.Rejected" :
					//log.warn("NetworkConnectionDelegate::No permissions to connect to the application" );
					break;
					
				default :
				   // statements
				   break;
			}
		}
			
		/**
		 * Handles a fault from the server 
		 * @param event
		 * 
		 */		
		public function handleFault(  event : Object  ) : void {
			//log.warn("NetworkConnectionDelegate::" + event.text );
		}
		
		/**
		 * The Red5 oflaDemo returns bandwidth stats.
		 */		
		public function onBWDone() : void {
			
		}
			
		private function serverDisconnect() : void 
		{
			model.connected = false;
		}


    }
}