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
package org.bigbluebutton.modules.screenshare.services
{
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.modules.screenshare.services.red5.Connection;

    public class MessageSender
    {	
        private static const LOG:String = "SC::MessageSender - ";
        private static const LOGGER:ILogger = getClassLogger(MessageSender);
        private var conn: Connection;
        
        public function MessageSender(conn: Connection) {
          this.conn = conn;  
        }
        
        public function isScreenSharing(meetingId: String):void {
          conn.isScreenSharing(meetingId);
        }
        
        public function requestShareToken(meetingId: String, userId: String, record: Boolean, tunnel: Boolean):void {
          conn.requestShareToken(meetingId, userId, record, tunnel);
        }
        
        public function startShareRequest(meetingId: String, userId: String, session: String):void {
          conn.startShareRequest(meetingId, userId, session);
        }
        
        public function stopShareRequest(meetingId: String, streamId: String):void {
          conn.stopShareRequest(meetingId, streamId);
        }
        
        public function pauseShareRequest(meetingId: String, userId: String, streamId: String):void {
          conn.pauseShareRequest(meetingId, userId, streamId);
        }

        public function restartShareRequest(meetingId: String, userId: String):void {
          conn.restartShareRequest(meetingId, userId);
        }
        
        public function sendClientPongMessage(meetingId: String, session: String, timestamp: Number):void {
          conn.sendClientPongMessage(meetingId, session, timestamp);
        }

        public function queryForScreenshare():void {
            var message:Object = {
                header: {name: "GetScreenshareStatusReqMsg", meetingId: UsersUtil.getInternalMeetingID(),
                    userId: UsersUtil.getMyUserID()},
                body: {requestedBy: UsersUtil.getMyUserID()}
            };

            var _nc:ConnectionManager = BBB.initConnectionManager();
            _nc.sendMessage2x(
                    function(result:String):void { // On successful result
                    },
                    function(status:String):void { // status - On error occurred
                        var logData:Object = UsersUtil.initLogData();
                        logData.tags = ["apps"];
                        logData.logCode = "error_sending_get_screenshare_status";
                        LOGGER.info(JSON.stringify(logData));
                    },
                    message
            ); //_netConnection.call
        }

    }
}
