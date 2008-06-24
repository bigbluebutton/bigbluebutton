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
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.chat.ChatFacade;
	import org.bigbluebutton.modules.chat.model.vo.*;
	import org.bigbluebutton.modules.chat.view.components.ChatWindow;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	import org.bigbluebutton.common.Constants;
	
	
	
	
	/**
	 * 
	 * This class gets a NetConnection instance and a shared object which try to connect.
	 * 
	 */
	public class ChatProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "Chat Proxy";
		private var uri:String;		
		private var conn:Connection;
		private var nc:NetConnection;
		private var chatSO : SharedObject;
		private var netConnectionDelegate: NetConnectionDelegate;
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		private var conf : Conference = ViewersFacade.getInstance().retrieveMediator(Conference.NAME) as Conference;
		private var me:String = conf.me.name;
		private var messageObject = MessageObject
		private var room:String;

		
		
		/**
		 * This method makes a new connection and adds event listeners to it 
		 * @param messageVO
		 * 
		 */
		public function ChatProxy(messageVO:MessageVO, nc:NetConnection)
		{
			
			super(NAME, messageVO);
			netConnectionDelegate = new NetConnectionDelegate(this);
			netConnectionDelegate.setNetConnection(nc);

		}
	    public function connectionSuccess() : void
		{
			var conf:Conference = ViewersFacade.getInstance().retrieveMediator(Conference.NAME) as Conference;
			room = conf.room;
			joinConference();
		}
		/**
		 * The event is called when a connection could not be established 
		 * @param message - the reason the connection was not established
		 * 
		 */			
		public function connectionFailed(message : String) : void 
		{
			if (chatSO != null) chatSO.close();
		}	
	    public function join(userid: String, host : String, room : String):void
	    {
	    	this.messageVO.message.setUserid(userid);
			this.messageVO.message.host = host;
			this.messageVO.message.room = room;
			netConnectionDelegate.connect(host, room);
		}
	    private function joinConference() : void
		{
			chatSO = SharedObject.getRemote("chatSO", netConnectionDelegate.connUri, false);
			chatSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			chatSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			chatSO.client = this;
			chatSO.connect(netConnectionDelegate.getConnection());
			log.chat("Chat is connected to Shared object");
			
		}
	    public function leave():void
	    {
	    	
	    }
		/**
		 * 
		 * @return the messageVO containig the message Object
		 * 
		 */
		public function get messageVO():MessageVO{
			return this.data as MessageVO;
		}
		
		/**
		 * Handles the event of successful connection
		 * @param e:ConnectionEvent
		 * 
		 */		
		/*public function handleSucessfulConnection(e:ConnectionEvent):void{
			nc = conn.getConnection();
			chatSO = SharedObject.getRemote("chatSO", uri, false);
            chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
            chatSO.client = this;
            chatSO.connect(nc);
            log.debug("Chat is connected to Shared object");
            
		}*/
		public function handleDisconnection(e:ConnectionEvent):void {
			
		}
		
		/*public function closeConnection():void {
			
			conn.removeEventListener(Connection.SUCCESS, handleSucessfulConnection);
			conn.removeEventListener(Connection.DISCONNECTED, handleDisconnection);
			conn.close();
			log.debug("Chat module disconnected");
		}*/		
		/**
		 * SyncHandler for Shared Object
		 * @param e:SyncEvent
		 * 
		 */
		public function sharedObjectSyncHandler(e:SyncEvent):void{
			
		}
		
		
		
		/**
		 * Sends the message to the shared object 
		 * @param message of type MessageVO
		 * 
		 */
		public function sendMessageToSharedObject(message:MessageObject):void
		{
			chatSO.send("receiveNewMessage", me, message.getMessage(), message.getColor());
		}
		
		/**
		 * Updates the message VO according to the new message received
		 * and sends a notification for update the view
		 * @param message
		 * @param color
		 * 
		 */		
		public function receiveNewMessage(userid:String, message:String , color:uint):void{
			var m:MessageObject = new MessageObject(message, color);
			m.setUserid(userid);
			this.messageVO.message = m;
			sendNotification(ChatFacade.NEW_MESSAGE, m);
		   
		}
		/**
		 * 
		 * @return SharedObject
		 * 
		 */		
		public function getSharedObject(): SharedObject {
			return chatSO;
		}
		
		public function setChatLog (messages:String) : void {
			//log.chat("This is inside setChatLog(): " + messages);
			var face: ChatWindow = ChatFacade.getInstance().retrieveMediator("ChatMediator").getViewComponent() as ChatWindow;
			face.txtChatBox.htmlText = messages;
		}
		/**
		 * Method is called when a new NetStatusEvent is received 
		 * @param event
		 * 
		 */		
		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			log.chat( "netStatusHandler " + event.info.code );
		}
		
		/**
		 * Method is called when a new AsyncErrorEvent is received 
		 * @param event
		 * 
		 */		
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			log.chat( "asyncErrorHandler " + event.error);
		}
	}
}