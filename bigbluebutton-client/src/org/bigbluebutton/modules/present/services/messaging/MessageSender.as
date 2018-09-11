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
    public function move(podId: String, presentationId:String, pageId:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
      var message:Object = {
        header: {name: "ResizeAndMovePagePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {podId: podId, presentationId: presentationId, pageId: pageId, xOffset: xOffset, yOffset: yOffset, widthRatio: widthRatio, heightRatio: heightRatio}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        message
      );
    }
    
    public function sharePresentation(podId: String, presentationId:String):void {
      var message:Object = {
        header: {name: "SetCurrentPresentationPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {podId: podId, presentationId: presentationId}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        message
      );
    }
    
    public function goToPage(podId: String, presentationId: String, pageId: String):void {
      var message:Object = {
        header: {name: "SetCurrentPagePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {podId: podId, presentationId: presentationId, pageId: pageId}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        message
      );
    }

    public function requestAllPodsEvent():void {
      var message:Object = {
        header: {name: "GetAllPresentationPodsReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        message
      );
    }

    public function removePresentation(podId: String, presentationId:String):void {
      var message:Object = {
        header: {name: "RemovePresentationPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {podId: podId, presentationId: presentationId}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
        message
      );
    }
	
	public function setPresentationDownloadable(podId: String, presentationId:String, downloadable:Boolean):void {
		var message:Object = {
			header: {name: "SetPresentationDownloadablePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
			body: {podId: podId, presentationId: presentationId, downloadable: downloadable}
		};
		
		var _nc:ConnectionManager = BBB.initConnectionManager();
		_nc.sendMessage2x(
			function(result:String):void { },
			function(status:String):void { LOGGER.error(status); },
			message
		);
	}

    public function requestPresentationUploadPermission(podId: String, filename: String):void {
      var message:Object = {
        header: {name: "PresentationUploadTokenReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {podId: podId, filename: filename}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error("Error while requesting token for presentation upload." + status); },
        message
      );
    }

    public function requestNewPresentationPod():void {
      var message:Object = {
        header: {name: "CreateNewPresentationPodPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error("Error while requesting a new presentation pod." + status); },
        message
      );
    }

    public function requestClosePresentationPod(podId: String):void {
      var message:Object = {
        header: {name: "RemovePresentationPodPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {podId: podId}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error("Error while closing a presentation pod." + status); },
        message
      );
    }

    public function handleSetPresenterInPodReqEvent(podId: String, nextPresenterId: String):void {
      var message:Object = {
        header: {name: "SetPresenterInPodReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {podId: podId, nextPresenterId: nextPresenterId}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error("Error while setting presenter for pod." + status); },
        message
      );
    }
  }
}
