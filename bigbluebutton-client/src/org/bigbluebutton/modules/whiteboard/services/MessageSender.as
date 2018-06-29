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
package org.bigbluebutton.modules.whiteboard.services
{
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardAccessEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	
	public class MessageSender {
		private static const LOGGER:ILogger = getClassLogger(MessageSender);
		
		public function modifyAccess(e:WhiteboardAccessEvent):void {
			var message:Object = {
				header: {name: "ModifyWhiteboardAccessPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {whiteboardId: e.whiteboardId, multiUser: e.multiUser}
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
		
		/**
		 * Sends a call out to the red5 server to notify the clients to undo a GraphicObject
		 * 
		 */
		public function undoGraphic(wbId:String):void{
			var message:Object = {
				header: {name: "UndoWhiteboardPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {whiteboardId: wbId}
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
		
		/**
		 * Sends a call out to the red5 server to notify the clients that the board needs to be cleared
		 * 
		 */
		public function clearBoard(wbId:String):void {
			var message:Object = {
				header: {name: "ClearWhiteboardPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {whiteboardId: wbId}
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
		
		public function requestAnnotationHistory(wbId:String):void {
			var message:Object = {
				header: {name: "GetWhiteboardAnnotationsReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {whiteboardId: wbId}
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
		
		/**
		 * Sends a shape to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */
		public function sendShape(e:WhiteboardDrawEvent):void {
			var message:Object = {
				header: {name: "SendWhiteboardAnnotationPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: { annotation: {
					id: e.annotation.id,
					status: e.annotation.annotation.status,
					annotationType: e.annotation.type,
					annotationInfo: e.annotation.annotation,
					wbId: e.annotation.whiteboardId,
					userId: UsersUtil.getMyUserID(),
					position: -1}
				}
			};
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(
				function(result:String):void { // On successful result
					// LogUtil.debug(result);
				},
				function(status:String):void { // status - On error occurred
					LOGGER.error(status);
				},
				message
			);
		}
		
		/**
		 * Send an event to the server to update the user's cursor position
		 * @param xPercent
		 * @param yPercent
		 * 
		 */
		public function sendCursorPosition(whiteboardId: String, xPercent:Number, yPercent:Number):void {
			var message:Object = {
				header: {name: "SendCursorPositionPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
				body: {whiteboardId: whiteboardId, xPercent: xPercent, yPercent: yPercent}
			};
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(
				function(result:String):void { // On successful result
					//LOGGER.debug(result);
				},
				function(status:String):void { // status - On error occurred
					LOGGER.error(status);
				},
				message
			);
      
		}
    
    public function sendClientToServerLatencyTracerMsg():void {
      var lastTraceSentOn: Date = LiveMeeting.inst().whiteboardModel.lastTraceSentOn;
      var now: Date = new Date();
      
      var rtt: Number = LiveMeeting.inst().whiteboardModel.latencyInSec;
      LiveMeeting.inst().whiteboardModel.sentLastTrace(now);
      
      var message:Object = {
        header: {name: "ClientToServerLatencyTracerMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {timestampUTC: now.time, rtt: rtt, senderId: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
          //LOGGER.debug(result);
        },
        function(status:String):void { // status - On error occurred
          //LOGGER.error(status);
        },
        message
      );
    }
  }
}
