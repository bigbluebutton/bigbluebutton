/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.modules.polling.service
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;

  public class MessageSender {
    private static const LOGGER:ILogger = getClassLogger(MessageSender);

    public function startCustomPoll(pollId:String, pollType: String, answers:Array):void {
      var message:Object = {
        header: {name: "StartCustomPollReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID(), pollId: pollId, pollType: pollType, answers: answers}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        message
      );
    }

    public function startPoll(pollId:String, pollType: String):void {
      var message:Object = {
        header: {name: "StartPollReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID(), pollId: pollId, pollType: pollType}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        message
      );
    }
    
    public function stopPoll(pollId:String):void {
      // note: we do not pass pollId, we stop the currentPoll
      var message:Object = {
        header: {name: "StopPollReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID()}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        message
      );
    }
    
    public function votePoll(pollId:String, answerId:Number):void {
      var questionId: int = 0; // assume only one question per poll

      var message:Object = {
        header: {name: "RespondToPollReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID(), pollId: pollId, questionId: questionId, answerId: answerId}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        message
      );
    }
    
    public function showPollResult(pollId:String):void {
      var messageName:String = "ShowPollResultReqMsg";

      var message:Object = {
        header: {name: messageName, meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID(), pollId: pollId}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
          LOGGER.error(status);
        },
        message
      );
    }
  }
}
