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
package org.bigbluebutton.modules.present.services.messaging
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;
  
  public class MessageSender {
    
	private static const LOGGER:ILogger = getClassLogger(MessageSender);
    
    /**
     * Sends an event to the server to update the clients with the new slide position 
     * 
     */		
    public function move(presentationId:String, pageId:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
      var message:Object = {
        header: {name: "ResizeAndMovePagePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {presentationId: presentationId, pageId: pageId, xOffset: xOffset, yOffset: yOffset, widthRatio: widthRatio, heightRatio: heightRatio}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        JSON.stringify(message)
      );
    }
    
    public function sharePresentation(presentationId:String):void {
      var message:Object = {
        header: {name: "SetCurrentPresentationPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {presentationId: presentationId}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        JSON.stringify(message)
      );
    }
    
    public function goToPage(presentationId: String, pageId: String):void {
      var message:Object = {
        header: {name: "SetCurrentPagePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {presentationId: presentationId, pageId: pageId}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        JSON.stringify(message)
      );
    }
    
    public function getPresentationInfo():void {
      var message:Object = {
        header: {name: "GetPresentationInfoReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        JSON.stringify(message)
      );
    }
    
    public function removePresentation(presentationId:String):void {
      var message:Object = {
        header: {name: "RemovePresentationPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {presentationId: presentationId}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        JSON.stringify(message)
      );
    }
  }
}