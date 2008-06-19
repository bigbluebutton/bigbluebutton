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
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.Constants;
	import org.bigbluebutton.modules.chat.ChatFacade;
	import org.bigbluebutton.modules.chat.model.vo.*;
	import org.bigbluebutton.modules.chat.view.components.ChatWindow;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	
	
	
	/**
	 * 
	 * This class gets a NetConnection instance and a shared object which try to connect.
	 * 
	 */
	public class ChatProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "Chat Proxy";
		//public static const DEFAULT_RED5:String = "rtmp://134.117.58.103/chatServer";
		private var uri:String;		
		private var conn:Connection;
		private var nc:NetConnection;
		private var chatSO : SharedObject;
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		private var conf : Conference = ViewersFacade.getInstance().retrieveMediator(Conference.NAME) as Conference;
		private var me:String = conf.me.name;
		private var room:String = Constants.currentRoom;
		
		
		/**
		 * This method makes a new connection and adds event listeners to it 
		 * @param messageVO
		 * 
		 */
		public function ChatProxy(messageVO:MessageVO)
		{
			
			super(NAME, messageVO);
			conn = new Connection;
			this.uri = "rtmp://" + Constants.red5Host + "/chatServer/";
			conn.addEventListener(Connection.SUCCESS, handleSucessfulConnection);
			conn.addEventListener(Connection.DISCONNECTED, handleDisconnection);
			conn.setURI(this.uri);
			conn.connect();
			
			
			
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
		public function handleSucessfulConnection(e:ConnectionEvent):void{
			nc = conn.getConnection();
			chatSO = SharedObject.getRemote("chatSO", uri, false);
            chatSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
            chatSO.client = this;
            chatSO.connect(nc);
            log.debug("Chat is connected to Shared object");
            
		}
		public function handleDisconnection(e:ConnectionEvent):void {
			
		}
		
		public function closeConnection():void {
			
			conn.removeEventListener(Connection.SUCCESS, handleSucessfulConnection);
			conn.removeEventListener(Connection.DISCONNECTED, handleDisconnection);
			conn.close();
			log.debug("Chat module disconnected");
		}		
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
		public function sendMessageToSharedObject(message:MessageObject):void{
			//sendNotification(ChatFacade.NEW_MESSAGE, message);
			
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
			log.info("This is inside setChatLog(): " + messages);
			var face: ChatWindow = ChatFacade.getInstance().retrieveMediator("ChatMediator").getViewComponent() as ChatWindow;
			face.txtChatBox.htmlText = messages;
		}
	}
}