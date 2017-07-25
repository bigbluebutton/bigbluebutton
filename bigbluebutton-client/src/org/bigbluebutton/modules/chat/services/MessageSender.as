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
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class MessageSender
  {
    private static const LOGGER:ILogger = getClassLogger(MessageSender);
    
    public var dispatcher:IEventDispatcher;
    
    public function getPublicChatMessages():void {
      LOGGER.debug("Sending [chat.getPublicMessages] to server.");
      var message:Object = {
        header: {name: "GetChatHistoryReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
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
    
    public function sendPublicMessage(cm:ChatMessageVO):void {
      LOGGER.debug("Sending [chat.sendPublicMessage] to server. [{0}]", [cm.message]);
      var message:Object = {
        header: {name: "SendPublicMessagePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {message: cm}
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
      var message:Object = {
        header: {name: "SendPrivateMessagePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {message: cm}
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
  }
}