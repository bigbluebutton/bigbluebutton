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
package org.bigbluebutton.modules.polling.service
{
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.as3commons.logging.util.jsonXify;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.ConnectionManager;

	public class MessageSender
	{	
	private static const LOGGER:ILogger = getClassLogger(MessageSender);      
	
	public function startCustomPoll(pollId:String, pollType: String, answers:Array):void
	{

		
		var header:Object = new Object();		
		header["timestamp"] = (new Date()).time;
		header["name"] = "start_custom_poll_request_message";
		header["version"] = "0.0.1";
		
		var payload:Object = new Object();
		payload["pollType"] = pollType;
		payload["answers"] = answers;
		payload["meetingId"] = UsersUtil.getInternalMeetingID();
		payload["pollId"] = pollId;
		payload["requesterId"] = UsersUtil.getMyUserID();
		
		var map:Object = new Object();
		map["header"] = header;
		map["payload"] = payload;
		
		var _nc:ConnectionManager = BBB.initConnectionManager();
		_nc.sendMessage("poll.sendPollingMessage", 
			function(result:String):void { 
			},	                   
			function(status:String):void {
				LOGGER.error(status); 
			},
			JSON.stringify(map)
		);
	}
	
    public function startPoll(pollId:String, pollType: String):void
    {
      var map:Object = new Object();
      map["pollId"] = pollId;
      map["pollType"] = pollType;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.startPoll", 
        function(result:String):void { 
        },	                   
        function(status:String):void {
			LOGGER.error(status); 
        },
        map
      );
    }
    
    public function stopPoll(pollId:String):void
    {
      var map:Object = new Object();
      map["pollId"] = pollId;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.stopPoll", 
        function(result:String):void { 
        },	                   
        function(status:String):void {
			LOGGER.error(status); 
        },
        map
      );
    }
    
    public function votePoll(pollId:String, answerId:Number):void
    {
      var map:Object = new Object();
      map["pollId"] = pollId;
      map["answerId"] = answerId;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.votePoll", 
        function(result:String):void { 
        },	                   
        function(status:String):void {
			LOGGER.error(status); 
        },
        map
      );
    }
    
    public function showPollResult(pollId:String, show:Boolean):void {
      var map:Object = new Object();
      map["pollId"] = pollId;
      map["show"] = show;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.showPollResult", 
        function(result:String):void { 
        },	                   
        function(status:String):void {
			LOGGER.error(status); 
        },
        map
      );      
    }
	}
}
