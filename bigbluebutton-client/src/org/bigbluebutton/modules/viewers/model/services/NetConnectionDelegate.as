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
package org.bigbluebutton.modules.viewers.model.services
{
	import mx.rpc.IResponder;
	import flash.net.NetConnection;
	import flash.events.*;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	
	/**
	 * The NetConnectionDelegate class has the job of communicating with the server on behalf
	 * of the viewers module
	 * @author 
	 * 
	 */	
	public class NetConnectionDelegate
	{
		public static const ID : String = "CONFERENCE::NetConnectionDelegate";
		
		private var _confDelegate : SharedObjectConferenceDelegate;
				
		private var _netConnection : NetConnection;	
		private var log:LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		

					
		/**
		 * The constructor. Received a SharedObjectConferenceDelegate Object 
		 * @param confDelegate
		 * 
		 */		
		public function NetConnectionDelegate(confDelegate : SharedObjectConferenceDelegate) : void
		{
			_confDelegate = confDelegate;
		}
		
		/**
		 * Connect to the server using the specified parameters 
		 * @param host
		 * @param room
		 * @param username
		 * @param password
		 * 
		 */		
		public function connect(host : String , room : String, 
					username : String, password : String) : void
		{		
			_netConnection = _confDelegate.netConnection;
			
			_netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			_netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			_netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			_netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			
			try {
				log.viewer( "Connecting to <b>" + host + "</b>");
				
				_netConnection.connect(host, room, username, password );
				
			} catch( e : ArgumentError ) {
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :						
						log.viewer( "Invalid server location: <b>" + host + "</b>");											   
						break;						
					default :
					   break;
				}
			}	
		}
			
		/**
		 * Disconnect from the server 
		 * 
		 */		
		public function disconnect() : void
		{
			_netConnection.close();
		}
					
		/**
		 * Method is called when a net_status_event is received 
		 * @param event
		 * 
		 */		
		protected function netStatus( event : NetStatusEvent ) : void 
		{
			handleResult( event );
		}
		
		/**
		 * Method is called when a result is received from the server 
		 * @param event
		 * 
		 */		
		public function handleResult(  event : Object  ) : void {
			var info : Object = event.info;
			var statusCode : String = info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					_confDelegate.connected();
					
					// find out if it's a secure (HTTPS/TLS) connection
					if ( event.target.connectedProxyType == "HTTPS" || event.target.usingTLS ) {
						log.viewer( 	"Connected to secure server");
					} else {
						log.viewer(	"Connected to server");
					}
					break;
			
				case "NetConnection.Connect.Failed" :
					_confDelegate.disconnected("The connection to the server failed.");
					
					log.viewer("Connection to server failed");
					break;
					
				case "NetConnection.Connect.Closed" :					
					_confDelegate.disconnected("The connection to the server closed.");					
					log.viewer("Connection to server closed");
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					_confDelegate.disconnected("The application was not found on the server.")
					log.viewer("Application not found on server");
					break;
					
				case "NetConnection.Connect.AppShutDown" :				
					_confDelegate.disconnected("The application has been shutdown.");
					log.viewer("Application has been shutdown");
					break;
					
				case "NetConnection.Connect.Rejected" :
					_confDelegate.disconnected("No permission to connect to the application.");
					log.viewer("No permissions to connect to the application" );
					_confDelegate.sendNotification(ViewersFacade.LOGIN_FAILED);
					break;
					
				default :
				   // statements
				   break;
			}
		}
		
			
		/**
		 * Method is called when a net_security_error is received 
		 * @param event
		 * 
		 */		
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
		    handleFault( "Security error - " + event.text );
		}
		
		/**
		 * Method is called when a net_io_error is received 
		 * @param event
		 * 
		 */		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			handleFault( "Input/output error - " + event.text );
		}
			
		/**
		 * Method is called when a net_async_error is received 
		 * @param event
		 * 
		 */		
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			handleFault( "Asynchronous code error - " + event.error );
		}
	
		/**
		 * Method is called when a fault is received from the server 
		 * @param reason
		 * 
		 */		
		public function handleFault(  reason : String  ) : void 
		{			
			_confDelegate.disconnected(reason);
		}
	}
}