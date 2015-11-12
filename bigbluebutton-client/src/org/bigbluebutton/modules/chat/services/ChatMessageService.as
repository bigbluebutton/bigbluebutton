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
  import flash.external.ExternalInterface;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.MeetingModel;
  import org.bigbluebutton.modules.chat.ChatConstants;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class ChatMessageService
  {
	private static const LOGGER:ILogger = getClassLogger(ChatMessageService);      
    
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    public var dispatcher:IEventDispatcher;
    
    public function sendPublicMessageFromApi(message:Object):void
    {
      LOGGER.debug("sendPublicMessageFromApi");
      var msgVO:ChatMessageVO = new ChatMessageVO();
      msgVO.chatType = ChatConstants.PUBLIC_CHAT;
      msgVO.fromUserID = message.fromUserID;
      msgVO.fromUsername = message.fromUsername;
      msgVO.fromColor = message.fromColor;
      msgVO.fromTime = message.fromTime;
      msgVO.fromTimezoneOffset = message.fromTimezoneOffset;

      msgVO.message = message.message;
      
      sendPublicMessage(msgVO);
    }    
    
    public function sendPrivateMessageFromApi(message:Object):void
    {
	  LOGGER.debug("sendPrivateMessageFromApi");
      var msgVO:ChatMessageVO = new ChatMessageVO();
      msgVO.chatType = ChatConstants.PUBLIC_CHAT;
      msgVO.fromUserID = message.fromUserID;
      msgVO.fromUsername = message.fromUsername;
      msgVO.fromColor = message.fromColor;
      msgVO.fromTime = message.fromTime;
      msgVO.fromTimezoneOffset = message.fromTimezoneOffset;
      
      msgVO.toUserID = message.toUserID;
      msgVO.toUsername = message.toUsername;
      
      msgVO.message = message.message;
      
      sendPrivateMessage(msgVO);

    }
    
    public function sendPublicMessage(message:ChatMessageVO):void {
      sender.sendPublicMessage(message);
    }
    
    public function sendPrivateMessage(message:ChatMessageVO):void {
      sender.sendPrivateMessage(message);
    }
    
    public function getPublicChatMessages():void {
      sender.getPublicChatMessages();
    }
    
    private static const SPACE:String = " ";
    
    public function sendWelcomeMessage():void {
	  LOGGER.debug("sendWelcomeMessage");
      var welcome:String = BBB.initUserConfigManager().getWelcomeMessage();
      if (welcome != "") {
        var welcomeMsg:ChatMessageVO = new ChatMessageVO();
        welcomeMsg.chatType = ChatConstants.PUBLIC_CHAT;
        welcomeMsg.fromUserID = SPACE;
        welcomeMsg.fromUsername = SPACE;
        welcomeMsg.fromColor = "86187";
        welcomeMsg.fromTime = new Date().getTime();
        welcomeMsg.fromTimezoneOffset = new Date().getTimezoneOffset();
        welcomeMsg.toUserID = SPACE;
        welcomeMsg.toUsername = SPACE;
        welcomeMsg.message = welcome;
        
        var welcomeMsgEvent:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
        welcomeMsgEvent.message = welcomeMsg;
        welcomeMsgEvent.history = false;
        dispatcher.dispatchEvent(welcomeMsgEvent);
        
        //Say that client is ready when sending the welcome message
        ExternalInterface.call("clientReady", ResourceUtil.getInstance().getString('bbb.accessibility.clientReady'));
      }	
      
      if (UsersUtil.amIModerator()) {
        if (MeetingModel.getInstance().modOnlyMessage != null) {
          var moderatorOnlyMsg:ChatMessageVO = new ChatMessageVO();
          moderatorOnlyMsg.chatType = ChatConstants.PUBLIC_CHAT;
          moderatorOnlyMsg.fromUserID = SPACE;
          moderatorOnlyMsg.fromUsername = SPACE;
          moderatorOnlyMsg.fromColor = "86187";
          moderatorOnlyMsg.fromTime = new Date().getTime();
          moderatorOnlyMsg.fromTimezoneOffset = new Date().getTimezoneOffset();
          moderatorOnlyMsg.toUserID = SPACE;
          moderatorOnlyMsg.toUsername = SPACE;
          moderatorOnlyMsg.message = MeetingModel.getInstance().modOnlyMessage;
          
          var moderatorOnlyMsgEvent:PublicChatMessageEvent = new PublicChatMessageEvent(PublicChatMessageEvent.PUBLIC_CHAT_MESSAGE_EVENT);
          moderatorOnlyMsgEvent.message = moderatorOnlyMsg;
          moderatorOnlyMsgEvent.history = false;
          dispatcher.dispatchEvent(moderatorOnlyMsgEvent);
        }
      }
    }
  }
}