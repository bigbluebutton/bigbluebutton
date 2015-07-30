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
	import org.bigbluebutton.core.managers.ConnectionManager;

	public class MessageSender
	{	
	private static const LOGGER:ILogger = getClassLogger(MessageSender);      
    public function startPoll(pollId:String, pollType: String):void
    {
      var map:Object = new Object();
      map["pollId"] = pollId;
      map["pollType"] = pollType;
      
      LOGGER.debug("startPoll [{0}]", [jsonXify(map)]);
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.startPoll", 
        function(result:String):void { 
			LOGGER.debug(result); 
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
      
      LOGGER.debug("stopPoll [{0}]", [jsonXify(map)]);
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.stopPoll", 
        function(result:String):void { 
			LOGGER.debug(result); 
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
      
      LOGGER.debug("votePoll [{0}]", [jsonXify(map)]);
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.votePoll", 
        function(result:String):void { 
			LOGGER.debug(result); 
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
      
	  LOGGER.debug("showPollResult [{0}]", [jsonXify(map)]);
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.showPollResult", 
        function(result:String):void { 
			LOGGER.debug(result); 
        },	                   
        function(status:String):void {
			LOGGER.error(status); 
        },
        map
      );      
    }
	}
}