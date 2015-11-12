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
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.model.users.IMessageListener;

  public class MessageReceiver implements IMessageListener
  {
	private static const LOGGER:ILogger = getClassLogger(MessageReceiver);

	private var dispatcher:Dispatcher;
    
    public function MessageReceiver() {
      dispatcher = new Dispatcher();
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void {
      LOGGER.debug("Broadcast: received message {0}", [messageName]);
      
      switch (messageName) {
        case "BroadcastPlayStreamCommand":
            handleBroadcastPlayStreamCommand(message);
          break;
        case "BroadcastStopStreamCommand":
            handleBroadcastStopStreamCommand(message);
          break;
        case "BroadcastWhatIsTheCurrentStreamRequest":
            handleBroadcastWhatIsTheCurrentStreamRequest(message);
          break;    
        case "BroadcastWhatIsTheCurrentStreamReply":
          handleBroadcastWhatIsTheCurrentStreamReply(message);
          break;   				
        default:
          //          LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function handleBroadcastPlayStreamCommand(message:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastPlayStreamCommand");
      event.payload["messageID"] = "BroadcastPlayStreamCommand";
      event.payload["uri"] = message.uri;
      event.payload["streamID"] = message.streamID;
      event.payload["streamName"] = message.streamName;		
      
      dispatcher.dispatchEvent(event);
    }
    
    private function handleBroadcastStopStreamCommand(messsage:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastStopStreamCommand");
      event.payload["messageID"] = "BroadcastStopStreamCommand";      
      dispatcher.dispatchEvent(event);      
    }
    
    private function handleBroadcastWhatIsTheCurrentStreamRequest(message:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastWhatIsTheCurrentStreamRequest");
      event.payload["messageID"] = "BroadcastWhatIsTheCurrentStreamRequest";   
      event.payload["requestedBy"] = message.requestedBy;

      dispatcher.dispatchEvent(event);      
    }
    
    private function handleBroadcastWhatIsTheCurrentStreamReply(message:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastWhatIsTheCurrentStreamReply");
      event.payload["messageID"] = "BroadcastWhatIsTheCurrentStreamReply";   
      event.payload["requestedBy"] = message.requestedBy;
      event.payload["streamID"] = message.streamID;
      
      dispatcher.dispatchEvent(event);
    }
  }        
}