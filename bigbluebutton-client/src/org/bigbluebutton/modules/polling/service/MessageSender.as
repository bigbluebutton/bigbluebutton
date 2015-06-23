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
	import flash.net.NetConnection;
	import flash.net.Responder;	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.modules.polling.vo.CreatePollVO;
	import org.bigbluebutton.modules.polling.vo.PollResponseVO;
	import org.bigbluebutton.modules.polling.vo.UpdatePollVO;
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardPresenterEvent;

	public class MessageSender
	{	
    private static const LOG:String = "Poll::MessageSender - ";
    
    public function getPolls():void
    {     
      trace(LOG + "getPolls ");
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.getPolls", 
        function(result:String):void { 
          LogUtil.debug(result); 
        },	                   
        function(status:String):void {
          LogUtil.error(status); 
        }
      );      
    }
    
    public function createPoll(poll:CreatePollVO):void
    {
      var jsonMsg:String = JSON.stringify(poll.toMap());
      
      trace(LOG + "createPoll [" + jsonMsg + "]");
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.createPoll", 
        function(result:String):void { 
          LogUtil.debug(result); 
        },	                   
        function(status:String):void {
          LogUtil.error(status); 
        },
        jsonMsg
      );
    }	
    
    public function updatePoll(poll:UpdatePollVO):void
    {
      var jsonMsg:String = JSON.stringify(poll.toMap());
      
      trace(LOG + "updatePoll [" + jsonMsg + "]");
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.updatePoll", 
        function(result:String):void { 
          LogUtil.debug(result); 
        },	                   
        function(status:String):void {
          LogUtil.error(status); 
        },
        jsonMsg
      );
    }	
    
    public function startPoll(pollId:String, pollType: String):void
    {
      var map:Object = new Object();
      map["pollId"] = pollId;
      map["pollType"] = pollType;
      
      var jsonMsg:String = JSON.stringify(map);
      
      trace(LOG + "startPoll [" + jsonMsg + "]");
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.startPoll", 
        function(result:String):void { 
          LogUtil.debug(result); 
        },	                   
        function(status:String):void {
          LogUtil.error(status); 
        },
        map
      );
    }
    
    public function stopPoll(pollID:String):void
    {
      var map:Object = new Object();
      map.pollID = pollID;
      
      var jsonMsg:String = JSON.stringify(map);
      
      trace(LOG + "stopPoll [" + jsonMsg + "]");
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.stopPoll", 
        function(result:String):void { 
          LogUtil.debug(result); 
        },	                   
        function(status:String):void {
          LogUtil.error(status); 
        },
        jsonMsg
      );
    }
    
    public function removePoll(pollID:String):void
    {
      var map:Object = new Object();
      map.pollID = pollID;
      
      var jsonMsg:String = JSON.stringify(map);
      
      trace(LOG + "removePoll [" + jsonMsg + "]");
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.removePoll", 
        function(result:String):void { 
          LogUtil.debug(result); 
        },	                   
        function(status:String):void {
          LogUtil.error(status); 
        },
        jsonMsg
      );
    }
    
    public function respondPoll(resp:PollResponseVO):void {
      var jsonMsg:String = JSON.stringify(resp.toMap());
      
      trace(LOG + "respondPoll [" + jsonMsg + "]");
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("poll.respondPoll", 
        function(result:String):void { 
          LogUtil.debug(result); 
        },	                   
        function(status:String):void {
          LogUtil.error(status); 
        },
        jsonMsg
      );      
    }
	}
}