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
package org.bigbluebutton.modules.chat.model.business
{
	import mx.rpc.IResponder;
	import flash.net.NetConnection;
	import flash.events.*;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.chat.view.components.ChatWindow;
	import org.bigbluebutton.modules.chat.ChatFacade;

		
	public class NetConnectionDelegate
	{
		public static const ID : String = "Chat.NetConnectionDelegate";
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		private var _proxy : ChatProxy;
		private var netConnection : NetConnection;	
		private var _connUri : String;
		private var connectionId : Number;
		private var connected : Boolean = false;
		
				
		public function NetConnectionDelegate(proxy : ChatProxy) : void
		{
			_proxy = proxy;
		}
		
		
		public function setNetConnection(nc:NetConnection):void{
			this.netConnection = nc;
		}

		
		public function connect(host : String , room : String) : void
		{		
			netConnection = new NetConnection();			
			netConnection.client = this;
			netConnection.addEventListener( NetStatusEvent.NET_STATUS, netStatus );
			netConnection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
			netConnection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
			netConnection.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
			
			try {
//				if (uri.charAt(uri.length) == "/")
//				{
//					_connUri = uri + room;
//				} else {
//					_connUri = uri + "/" + room;
//				}	
				
				_connUri = "rtmp://" + host + "/oflaDemo/" + room;
				
				log.chat( "Connecting to <b>" + _connUri + "</b>");
								
				netConnection.connect(_connUri );
				
			} catch( e : ArgumentError ) {
				// Invalid parameters.
				switch ( e.errorID ) 
				{
					case 2004 :						
						log.chat("Error! Invalid server location: <b>" + _connUri + "</b>");											   
						break;						
					default :
					   break;
				}
			}	
		}
		
		public function get connUri() : String
		{
			return _connUri;
		}	
		
		public function disconnect() : void
		{
			netConnection.close();
		}
					
		protected function netStatus( event : NetStatusEvent ) : void 
		{
			handleResult( event );
		}
		
		public function handleResult(  event : Object  ) : void {
			var info : Object = event.info;
			var statusCode : String = info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					_proxy.connectionSuccess();
					
					// find out if it's a secure (HTTPS/TLS) connection
					if ( event.target.connectedProxyType == "HTTPS" || event.target.usingTLS ) {
						log.chat("Connected to secure chat server");
					} else {
						log.chat("Connected to chat server");
					}
					break;
			
				case "NetConnection.Connect.Failed" :
					
					_proxy.connectionFailed(event.info.application);
					
					_proxy.connectionFailed("Connection to server failed.");
					
					log.chat("Connection to chat server failed");
					break;
					
				case "NetConnection.Connect.Closed" :					
					_proxy.connectionFailed("Connection to chat server closed.");					
					log.chat("Connection to chat server closed");
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					_proxy.connectionFailed("Chat application not found on server")
					log.chat("Chat application not found on server");
					break;
					
				case "NetConnection.Connect.AppShutDown" :
				
					_proxy.connectionFailed("Chat application has been shutdown");
					log.chat("Chat application has been shutdown");
					break;
					
				case "NetConnection.Connect.Rejected" :
					_proxy.connectionFailed(event.info.application);
					log.chat("No permissions to connect to the chat application" );
					break;
					
				default :
				   // statements
				   break;
			}
		}
		
			
		protected function netSecurityError( event : SecurityErrorEvent ) : void 
		{
		    handleFault( new SecurityErrorEvent ( SecurityErrorEvent.SECURITY_ERROR, false, true,
		    										  "Security error - " + event.text ) );
		}
		
		protected function netIOError( event : IOErrorEvent ) : void 
		{
			handleFault( new IOErrorEvent ( IOErrorEvent.IO_ERROR, false, true, 
							 "Input/output error - " + event.text ) );
		}
			
		protected function netASyncError( event : AsyncErrorEvent ) : void 
		{
			handleFault( new AsyncErrorEvent ( AsyncErrorEvent.ASYNC_ERROR, false, true,
							 "Asynchronous code error - <i>" + event.error + "</i>" ) );
		}
	
		public function handleFault(  event : Object  ) : void 
		{			
			_proxy.connectionFailed(event.text);
		}
		
		public function getConnection() : NetConnection
		{
			return netConnection;
		}

		public function setId(id:Number ) : *
		{
			log.debug( ID + "::setConnectionId: id=[" + id + "]");
			if( isNaN( id ) ) return "FAILED";
			
			return "OK";			
		}
		public function setChatLog (messages:String) : void {
			//log.info("This is inside setChatLog(): " + messages);
			var face: ChatWindow = ChatFacade.getInstance().retrieveMediator("ChatMediator").getViewComponent() as ChatWindow;
			face.txtChatBox.htmlText = messages;
			//log.info("Here is the chat history: " + messages + " end of chat history");
		}			
	}
}