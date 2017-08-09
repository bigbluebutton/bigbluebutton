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
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;

  public class MessageSender {
	  private static const LOGGER:ILogger = getClassLogger(MessageSender);

	  public function playStream(uri:String, streamId:String, streamName:String):void {
      var message:Object = new Object();
      message["messageID"] = "BroadcastPlayStreamCommand";
      message["uri"] = uri;
      message["streamID"] = streamId;
      message["streamName"] = streamName;				
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("bigbluebutton.sendMessage", 
        function(result:String):void { // On successful result
		  LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LOGGER.error(status); 
        },
        message
      );
    }
    
    public function stopStream():void {
      var message:Object = new Object();
      message["messageID"] = "BroadcastStopStreamCommand";			
        
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("bigbluebutton.sendMessage", 
        function(result:String):void { // On successful result
		  LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );
    }
       
    public function sendWhatIsTheCurrentStreamRequest():void {
      var message:Object = new Object();
      message["messageID"] = "BroadcastWhatIsTheCurrentStreamRequest";	
      message["requestedBy"] = UsersUtil.getMyUserID();
        
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("bigbluebutton.sendMessage", 
        function(result:String):void { // On successful result
		  LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );
    }
    
    public function sendWhatIsTheCurrentStreamReply(requestedByUserID:String, streamID:String):void {
      var message:Object = new Object();
      message["messageID"] = "BroadcastWhatIsTheCurrentStreamReply";	
      message["requestedBy"] = requestedByUserID;
      message["streamID"] = streamID;

	  LOGGER.debug("MessageSender:: sendWhatIsTheCurrentStreamReply [{0},{1}]", [message["requestedBy"], message["streamID"]]);
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("bigbluebutton.sendMessage", 
        function(result:String):void { // On successful result
		  LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );        
    }
  }
}