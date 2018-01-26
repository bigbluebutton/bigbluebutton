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
package org.bigbluebutton.modules.screenshare.services {
    import com.asfusion.mate.events.Dispatcher;

    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.core.UsersUtil;
    import org.bigbluebutton.modules.screenshare.services.red5.Connection;
    import org.bigbluebutton.core.BBB;
    
    /**
     * The DeskShareProxy communicates with the Red5 deskShare server application
     * @author Snap
     *
     */
    public class ScreenshareService {
        private static const LOG:String = "SC::ScreenshareService - ";
        private static const LOGGER:ILogger = getClassLogger(ScreenshareService);
        
        private var conn:Connection;
        
        private var module:ScreenshareModule;
        private var dispatcher:Dispatcher;

        private var sender:MessageSender;
        private var receiver:MessageReceiver;
        
        public function ScreenshareService() {
            this.dispatcher = new Dispatcher();
        }
        
        public function handleStartModuleEvent(module:ScreenshareModule):void {
            LOGGER.debug("Screenshare Module starting");
            this.module = module;
            connect();
        }
        
        public function connect():void {
            conn = new Connection();
            sender = new MessageSender(conn);
            receiver = new MessageReceiver(conn);
            
            conn.connect();
        }
        
        public function getConnection():Connection {
            return conn;
        }
        
        public function disconnect():void {
            if (conn) conn.disconnect();
        }
        
        public function checkIfPresenterIsSharingScreen():void {
            LOGGER.debug("check if presenter is sharing screen");
            sender.isScreenSharing(UsersUtil.getInternalMeetingID());
        }
        
        public function requestShareToken():void {
            sender.requestShareToken(UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID(), UsersUtil.isRecorded(), 
                BBB.initConnectionManager().isTunnelling);
        }
        
        public function sharingStartMessage(session: String):void {
            sender.startShareRequest(UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID(), session);
        }
        
        public function requestStopSharing(streamId:String):void {
            sender.stopShareRequest(UsersUtil.getInternalMeetingID(), streamId);
        }
        
        public function requestPauseSharing(streamId:String):void {
            sender.pauseShareRequest(UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID(), streamId);
        }
        
        public function requestRestartSharing():void {
            sender.restartShareRequest(UsersUtil.getInternalMeetingID(), UsersUtil.getMyUserID());
        }
        
        public function sendClientPongMessage(session: String, timestamp: Number):void {
            sender.sendClientPongMessage(UsersUtil.getInternalMeetingID(), session, timestamp);
        }    
    }
}