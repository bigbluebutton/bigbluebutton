/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.modules.chat.services
{
  import flash.events.IEventDispatcher;
  import mx.collections.ArrayCollection;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.chat.model.GroupChat;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  import org.bigbluebutton.modules.chat.vo.GroupChatUser;
  
  public class MessageReceiver implements IMessageListener
  {
    
    private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
    
    public var dispatcher:IEventDispatcher;
    
    public function MessageReceiver()
    {
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void
    {
      switch (messageName) {
        case "GetGroupChatsRespMsg":
          handleGetGroupChatsRespMsg(message);
          break;
        case "GetGroupChatMsgsRespMsg":
          handleGetChatHistoryRespMsg(message);
          break;	
        case "ClearPublicChatHistoryEvtMsg":
          handleClearPublicChatHistoryEvtMsg(message);
          break;
        case "GroupChatMessageBroadcastEvtMsg":
          handleGroupChatMessageBroadcastEvtMsg(message);
          break;
        case "GroupChatCreatedEvtMsg":
          handleGroupChatCreatedEvtMsg(message);
          break;
        default:
          //   LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function toGroupChat(chatInfo: Object):GroupChat {
      var id: String = chatInfo.id as String;
      var name: String = chatInfo.name as String;
      var access: String = chatInfo.access as String;
      var createdBy: GroupChatUser = new GroupChatUser(
        chatInfo.createdBy.id as String, 
        chatInfo.createdBy.name as String);
      var users: Array = chatInfo.users as Array;
      
      var chatUsers:Array = new Array();
      if (users.length > 0) {
        for (var i:int = 0; i < users.length; i++) {
          var u: Object = users[i] as Object;
          chatUsers.push(new GroupChatUser(u.id, u.name));
        }
      }
      
      var emptyChatMsgs: Array = new Array();
      var gc: GroupChat = new GroupChat(id, name, access,
        createdBy, new ArrayCollection(chatUsers), 
        new ArrayCollection(emptyChatMsgs));
      return gc;
    }
    
    private function handleGetGroupChatsRespMsg(msg: Object):void {
      var body: Object = msg.body as Object;
      var allChats: Array = msg.body.chats as Array;

      var chats: Array = new Array();
      if (allChats.length > 0) {
        for (var i:int = 0; i < allChats.length; i++) {
          var chatInfo: Object = allChats[i] as Object;
          var groupChat: GroupChat = toGroupChat(chatInfo);
          chats.push(groupChat);
        }
      }
      
      LiveMeeting.inst().chats.addGroupChatsList(chats);
    }
    
    private function handleGroupChatCreatedEvtMsg(msg:Object):void {
      var body: Object = msg.body as Object;
      var corrId: String = body.correlationId as String;
      var chatId: String = body.chatId as String;
      var createdBy: GroupChatUser = new GroupChatUser(body.createdBy.id, 
        body.createdBy.name);
      var name: String = body.name as String;
      var access: String = body.access as String;
      var users: Array = body.users as Array;
      var msgs: Array = body.msg as Array;
      
      var chatUsers:Array = new Array();
      if (users.length > 0) {
        for (var i:int = 0; i < users.length; i++) {
          var u: Object = users[i] as Object;
          chatUsers.push(new GroupChatUser(u.id, u.name));
        }
      }
      
      var groupChat: GroupChat = new GroupChat(chatId, name, access,
        createdBy, new ArrayCollection(chatUsers), new ArrayCollection());
      
      LiveMeeting.inst().chats.addGroupChat(groupChat);
      
      if (msgs.length > 0) {
        for (var j: int = 0; j < msgs.length; j++) {
          var m: Object = msgs[i] as Object;
          var chatMsg:ChatMessageVO = processNewChatMessage(m);
          groupChat.addMessage(chatMsg);
        }
      }
	  
	  var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_GROUP_CHAT);
	  pcCoreEvent.message = msg;
	  dispatcher.dispatchEvent(pcCoreEvent);
    }
    
    private function handleGetChatHistoryRespMsg(message:Object):void {
      LOGGER.debug("Handling chat history message [{0}]", [JSON.stringify(message)]);
      var chatId: String = message.body.chatId as String;
      var rawMessages:Array = message.body.msgs as Array;
      var processedMessages:Array = new Array();
      
      for (var i:int = 0; i < rawMessages.length; i++) {
        var rawMsg: Object = rawMessages[i] as Object;
        processedMessages.push(processNewChatMessage(rawMsg));
      }
      
      var groupChat: GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
      if (groupChat != null) {
        groupChat.addMessageHistory(processedMessages);
      } 
    }
    
    private function handleGroupChatMessageBroadcastEvtMsg(message: Object):void {
      LOGGER.debug("onMessageFromServer2x - " + JSON.stringify(message));
      var header: Object = message.header as Object;
      var body: Object = message.body as Object;
      var chatId: String = body.chatId as String;
      
      var msg: ChatMessageVO = processNewChatMessage(body.msg as Object);
      
      var groupChat: GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
      if (groupChat != null) {
        groupChat.addMessage(msg);
      }
      
      var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_PUBLIC_CHAT);
      pcCoreEvent.message = message;
      dispatcher.dispatchEvent(pcCoreEvent);
    }
    

    
    private function handleClearPublicChatHistoryEvtMsg(message:Object):void {
      LOGGER.debug("Handling clear chat history message");
      var header: Object = message.header as Object;
      var body: Object = message.body as Object;
      var chatId: String = body.chatId as String;
      
      var groupChat: GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
      if (groupChat != null) {
        groupChat.clearPublicChat();
      }
    }
    
    private function processNewChatMessage(message:Object):ChatMessageVO {
      var msg:ChatMessageVO = new ChatMessageVO();
      msg.fromUserId = message.sender.id as String;
      msg.fromUsername = message.sender.name as String;
      msg.fromColor = message.color as String;
      msg.fromTime = message.timestamp as Number;
      msg.message = message.message as String;
      return msg;
    }
  }
}
