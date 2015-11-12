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
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.EventConstants;
  import org.bigbluebutton.core.events.CoreEvent;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.chat.events.PrivateChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.TranscriptEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  
  public class MessageReceiver implements IMessageListener
  {
    
	private static const LOGGER:ILogger = getClassLogger(MessageReceiver);      

    private var welcomed:Boolean = false;
    
    public var dispatcher:IEventDispatcher;
    
    public function MessageReceiver()
    {
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void
    {
      switch (messageName) {
        case "ChatReceivePublicMessageCommand":
          handleChatReceivePublicMessageCommand(message);
          break;			
        case "ChatReceivePrivateMessageCommand":
          handleChatReceivePrivateMessageCommand(message);
          break;	
        case "ChatRequestMessageHistoryReply":
          handleChatRequestMessageHistoryReply(message);
          break;	
        default:
          //   LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function handleChatRequestMessageHistoryReply(message:Object):void {
      LOGGER.debug("Handling chat history message [{0}]", [message.msg]);
      var chats:Array = JSON.parse(message.msg) as Array;
      
      for (var i:int = 0; i < chats.length; i++) {
        handleChatReceivePublicMessageCommand(chats[i], true);
      }

//      if (!welcomed) {
        var pcEvent:TranscriptEvent = new TranscriptEvent(TranscriptEvent.TRANSCRIPT_EVENT);
        dispatcher.dispatchEvent(pcEvent);
//        welcomed = true;
//      }
    }
        
    private function handleChatReceivePublicMessageCommand(message:Object, history:Boolean = false):void {
      LOGGER.debug("Handling public chat message [{0}]", [message.message]);
      
      var msg:ChatMessageVO = new ChatMessageVO();
      msg.chatType = message.chatType;
      msg.fromUserID = message.fromUserID;
      msg.fromUsername = message.fromUsername;
      msg.fromColor = message.fromColor;
      msg.fromTime = message.fromTime;
      msg.fromTimezoneOffset = message.fromTimezoneOffset;
      msg.toUserID = message.toUserID;
      msg.toUsername = message.toUsername;
      msg.message = message.message;
      
      var pcEvent:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
      pcEvent.message = msg;
      pcEvent.history = history;
      dispatcher.dispatchEvent(pcEvent);
      
      var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_PUBLIC_CHAT);
      pcCoreEvent.message = message;
      dispatcher.dispatchEvent(pcCoreEvent);
    }
    
    private function handleChatReceivePrivateMessageCommand(message:Object):void {
      LOGGER.debug("Handling private chat message");
      
      var msg:ChatMessageVO = new ChatMessageVO();
      msg.chatType = message.chatType;
      msg.fromUserID = message.fromUserID;
      msg.fromUsername = message.fromUsername;
      msg.fromColor = message.fromColor;
      msg.fromTime = message.fromTime;
      msg.fromTimezoneOffset = message.fromTimezoneOffset;
      msg.toUserID = message.toUserID;
      msg.toUsername = message.toUsername;
      msg.message = message.message;
      
      var pcEvent:PrivateChatMessageEvent = new PrivateChatMessageEvent(PrivateChatMessageEvent.PRIVATE_CHAT_MESSAGE_EVENT);
      pcEvent.message = msg;
      dispatcher.dispatchEvent(pcEvent);
      
      var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_PRIVATE_CHAT);
      pcCoreEvent.message = message;
      dispatcher.dispatchEvent(pcCoreEvent);      
    }
  }
}