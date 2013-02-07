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
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;

	public class BroadcastService {	
    private var sender:MessageSender;
    private var receiver:MessageReceiver;
    
    public function BroadcastService() {
      sender = new MessageSender();
      receiver = new MessageReceiver();
    }
    
		public function playStream(uri:String, streamID:String, streamName:String):void {
      trace("BroadcastService::playStream"); 
      if (sender == null) {
        trace("SENDER is NULL!!!!");
      }
//      sender.playStream(uri, streamID, streamName);
      
      var event:BBBEvent = new BBBEvent("BroadcastPlayStreamCommand");
      event.payload["messageID"] = "BroadcastPlayStreamCommand";
      event.payload["uri"] = uri;
      event.payload["streamID"] = streamID;
      event.payload["streamName"] = streamName;		
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(event);
      
		}
		
		public function stopStream():void {
      trace("BroadcastService::stopStream"); 
//			sender.stopStream();
      
      var event:BBBEvent = new BBBEvent("BroadcastStopStreamCommand");
      event.payload["messageID"] = "BroadcastStopStreamCommand";    
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(event);     
		}
		
		public function sendWhatIsTheCurrentStreamRequest():void {
			sender.sendWhatIsTheCurrentStreamRequest();
		}
		
		public function sendWhatIsTheCurrentStreamReply(requestedByUserID:Number, streamID:String):void {
			sender.sendWhatIsTheCurrentStreamReply(requestedByUserID, streamID);
		}
	}
}