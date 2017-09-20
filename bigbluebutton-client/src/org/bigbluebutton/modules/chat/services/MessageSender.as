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
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.modules.chat.ChatUtil;
  import org.bigbluebutton.modules.chat.model.ChatModel;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  import org.bigbluebutton.modules.chat.vo.GroupChatMsgFromUser;
  import org.bigbluebutton.modules.chat.vo.GroupChatUser;

  public class MessageSender
  {
    private static const LOGGER:ILogger = getClassLogger(MessageSender);
    
    public var dispatcher:IEventDispatcher;
    
    public function getPublicChatMessages():void {
      LOGGER.debug("Sending [chat.getPublicMessages] to server.");
      var message:Object = {
        header: {name: "GetGroupChatMsgsReqMsg", 
          meetingId: UsersUtil.getInternalMeetingID(), 
            userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID(),
            chatId: ChatModel.MAIN_PUBLIC_CHAT}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        JSON.stringify(message)
      );
      
      createGroupChat();
    }
    
    public function sendPublicMessage(cm:ChatMessageVO):void {
      LOGGER.debug("Sending [chat.sendPublicMessage] to server. [{0}]", [cm.message]);
      var sender: GroupChatUser = new GroupChatUser(UsersUtil.getMyUserID(), 
        UsersUtil.getMyUsername());
      var corrId: String = ChatUtil.genCorrelationId();
      var font: String = "arial"; 
      var fontSize: Number = 10;
      
      var msgFromUser: GroupChatMsgFromUser = new GroupChatMsgFromUser(corrId,
        sender, font, fontSize, cm.fromColor, cm.message);
      
      var message:Object = {
        header: {name: "SendGroupChatMessageMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {chatId: ChatModel.MAIN_PUBLIC_CHAT, msg: msgFromUser}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        JSON.stringify(message)
      );
    }
    
    public function sendPrivateMessage(cm:ChatMessageVO):void {
      LOGGER.debug("Sending [chat.sendPrivateMessage] to server.");
      LOGGER.debug("Sending fromUserID [{0}] to toUserID [{1}]", [cm.fromUserId, cm.toUserId]);
      sendPublicMessage(cm);
    }

    public function clearPublicChatMessages():void {
      LOGGER.debug("Sending [chat.clearPublicChatMessages] to server.");
      var message:Object = {
        header: {name: "ClearPublicChatHistoryPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        JSON.stringify(message)
      );
    }
    
    public function createGroupChat():void {
      LOGGER.debug("Sending [chat.CreateGroupChatReqMsg] to server.");
      
      var corrId: String = "my-correlation-id";
      var requesterId: String = UsersUtil.getMyUserID();
      var name: String = "TEST GROUP CHAT";
      var access: String = "PRIVATE_ACCESS";
      var users: Array = new Array();
      var msg: Array = new Array();
      
      var message:Object = {
        header: {name: "CreateGroupChatReqMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {correlationId: corrId, requesterId: requesterId,
          name: name, access: access, users: users, msg: msg}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        JSON.stringify(message)
      );
    }
  }
}