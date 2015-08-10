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
package org.bigbluebutton.modules.broadcast.services
{
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;

	public class BroadcastService {	
		private static const LOGGER:ILogger = getClassLogger(BroadcastService);      

		private var sender:MessageSender;
    	private var receiver:MessageReceiver;
    
    public function BroadcastService() {
      sender = new MessageSender();
      receiver = new MessageReceiver();
    }
    
		public function playStream(uri:String, streamID:String, streamName:String):void {
      LOGGER.debug("BroadcastService::playStream"); 
      if (sender == null) {
        LOGGER.warn("SENDER is NULL!!!!");
      }
      sender.playStream(uri, streamID, streamName);
		}
		
		public function stopStream():void {
      LOGGER.debug("BroadcastService::stopStream"); 
			sender.stopStream();
		}
		
		public function sendWhatIsTheCurrentStreamRequest():void {
			sender.sendWhatIsTheCurrentStreamRequest();
		}
		
		public function sendWhatIsTheCurrentStreamReply(requestedByUserID:String, streamID:String):void {
			sender.sendWhatIsTheCurrentStreamReply(requestedByUserID, streamID);
		}
	}
}