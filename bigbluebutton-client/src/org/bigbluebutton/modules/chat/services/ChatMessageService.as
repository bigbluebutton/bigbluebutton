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
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.IEventDispatcher;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.modules.chat.events.CreateGroupChatReqEvent;
  import org.bigbluebutton.modules.chat.events.OpenChatBoxEvent;
  import org.bigbluebutton.modules.chat.events.SendGroupChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.UserTypingEvent;
  import org.bigbluebutton.modules.chat.model.GroupChat;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  
  public class ChatMessageService
  {
    private static const LOGGER:ILogger = getClassLogger(ChatMessageService);      
    
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    public var dispatcher:IEventDispatcher;
    private var globalDispatcher:Dispatcher = new Dispatcher();
    
    public function sendPublicMessageFromApi(event:SendGroupChatMessageEvent):void
    {
      //sendPublicMessage(event.chatId, msgVO);
    }
    
    public function sendPublicMessage(event:SendGroupChatMessageEvent):void {
      LOGGER.debug("sendPublicMessageFromApi");
      var msgVO:ChatMessageVO = new ChatMessageVO();
      msgVO.fromUserId = event.chatMessage.fromUserId;
      msgVO.fromUsername = event.chatMessage.fromUsername;
      msgVO.fromColor = event.chatMessage.fromColor;
      
      msgVO.message = event.chatMessage.message;
      sender.sendPublicMessage(event.chatId, msgVO);
    }
    
    public function handleCreateGCReqEvent(event:CreateGroupChatReqEvent):void {
      // Right now we only support one-to-one private chats)
      if (event.access == GroupChat.PRIVATE && event.users.length > 0) {
        var chatWith: String = event.users[0] as String;
        var gc: GroupChat = LiveMeeting.inst().chats.findChatWithUser(chatWith)
        if (gc != null) {
          // Already chatting with this user. Open the chat box.
          globalDispatcher.dispatchEvent(new OpenChatBoxEvent(gc.id));
        } else {
          // Not chatting yet with this user.
          sender.createGroupChat(event.name, event.access, event.users);
        }
      } else {
        sender.createGroupChat(event.name, event.access, event.users);
      }
    }
	
	public function handleUserTypingMessage(event:UserTypingEvent):void{
	  sender.userTyping(event.chatId);
	}
    
    public function getGroupChats():void {
      sender.getGroupChats();
    }
    
    public function getGroupChatHistoryMessages(chatId: String):void {
      sender.getGroupChatMsgHistory(chatId);
    }
    
    public function handleReceivedGroupChatsEvent():void {
      var gcIds: Array = LiveMeeting.inst().chats.getGroupChatIds();
      for (var i:int = 0; i < gcIds.length; i++) {
        var gcId: String = gcIds[i];
        sender.getGroupChatMsgHistory(gcId);
      }
    }
    
    public function clearPublicChatMessages():void {
      sender.clearPublicChatMessages();
    }
  }
}
