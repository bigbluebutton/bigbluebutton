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
  import org.bigbluebutton.modules.chat.events.ClearPublicChatEvent;
  import org.bigbluebutton.modules.chat.events.PrivateChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.ChatHistoryEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  
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
        case "SendPublicMessageEvtMsg":
          handleSendPublicMessageEvtMsg(message);
          break;			
        case "SendPrivateMessageEvtMsg":
          handleSendPrivateMessageEvtMsg(message);
          break;	
        case "GetChatHistoryRespMsg":
          handleGetChatHistoryRespMsg(message);
          break;	
        case "ClearPublicChatHistoryEvtMsg":
          handleClearPublicChatHistoryEvtMsg(message);
          break;
        default:
          //   LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function handleGetChatHistoryRespMsg(message:Object):void {
      LOGGER.debug("Handling chat history message [{0}]", [message.body.history]);
      var rawMessages:Array = message.body.history as Array;
      var processedMessages:Array = new Array();
      
      for (var i:int = 0; i < rawMessages.length; i++) {
        processedMessages.push(processIncomingChatMessage(rawMessages[i]));
      }

      var chEvent:ChatHistoryEvent = new ChatHistoryEvent(ChatHistoryEvent.RECEIVED_HISTORY);
	  chEvent.history = processedMessages;
      dispatcher.dispatchEvent(chEvent);
    }
    
    private function handleSendPublicMessageEvtMsg(message:Object, history:Boolean = false):void {
      LOGGER.debug("Handling public chat message [{0}]", [message.message]);
      
      var msg:ChatMessageVO = processIncomingChatMessage(message.body.message);
      
      var pcEvent:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
      pcEvent.message = msg;
      dispatcher.dispatchEvent(pcEvent);
      
      var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_PUBLIC_CHAT);
      pcCoreEvent.message = message;
      dispatcher.dispatchEvent(pcCoreEvent);
    }
    
    private function handleSendPrivateMessageEvtMsg(message:Object):void {
      LOGGER.debug("Handling private chat message");
      
      var msg:ChatMessageVO = processIncomingChatMessage(message.body.message);
      
      var pcEvent:PrivateChatMessageEvent = new PrivateChatMessageEvent(PrivateChatMessageEvent.PRIVATE_CHAT_MESSAGE_EVENT);
      pcEvent.message = msg;
      dispatcher.dispatchEvent(pcEvent);
      
      var pcCoreEvent:CoreEvent = new CoreEvent(EventConstants.NEW_PRIVATE_CHAT);
      pcCoreEvent.message = message;
      dispatcher.dispatchEvent(pcCoreEvent);      
    }

    private function handleClearPublicChatHistoryEvtMsg(message:Object):void {
      LOGGER.debug("Handling clear chat history message");

      var clearChatEvent:ClearPublicChatEvent = new ClearPublicChatEvent(ClearPublicChatEvent.CLEAR_PUBLIC_CHAT_EVENT);
      dispatcher.dispatchEvent(clearChatEvent);
    }
    
    private function processIncomingChatMessage(rawMessage:Object):ChatMessageVO {
      var msg:ChatMessageVO = new ChatMessageVO();
      msg.fromUserId = rawMessage.fromUserId;
      msg.fromUsername = rawMessage.fromUsername;
      msg.fromColor = rawMessage.fromColor;
      msg.fromTime = rawMessage.fromTime;
      msg.fromTimezoneOffset = rawMessage.fromTimezoneOffset;
      msg.toUserId = rawMessage.toUserId;
      msg.toUsername = rawMessage.toUsername;
      msg.message = rawMessage.message;
	  return msg;
    }
  }
}