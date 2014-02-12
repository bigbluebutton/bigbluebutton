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
package org.bigbluebutton.modules.users.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.main.model.users.IMessageListener;
  
  public class MessageSender {
    private static const LOG:String = "Users::MessageSender - ";

    public function kickUser(userID:String):void {
      var message:Object = new Object();
      message["userID"] = userID;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.kickUser", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      );
    }
    
    public function queryForParticipants():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.getParticipants", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      );
    }
    
    public function assignPresenter(userid:String, name:String, assignedBy:Number):void {
      var message:Object = new Object();
      message["newPresenterID"] = userid;
      message["newPresenterName"] = name;
      message["assignedBy"] = assignedBy.toString();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.assignPresenter", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      );
    }
    
    public function raiseHand(userID:String, raise:Boolean):void {      
      if (raise) {
        var _nc:ConnectionManager = BBB.initConnectionManager();
        _nc.sendMessage("participants.userRaiseHand", 
          function(result:String):void { // On successful result
            LogUtil.debug(result); 
          },	                   
          function(status:String):void { // status - On error occurred
            LogUtil.error(status); 
          }
        );        
      } else {
        var message:Object = new Object();
        message["userID"] = userID;
        message["loweredBy"] = userID;
        var _nc:ConnectionManager = BBB.initConnectionManager();
        _nc.sendMessage("participants.lowerHand", 
          function(result:String):void { // On successful result
            LogUtil.debug(result); 
          },	                   
          function(status:String):void { // status - On error occurred
            LogUtil.error(status); 
          },
          message
        );        
      }  
    }
    
    public function addStream(userID:String, streamName:String):void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.shareWebcam", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        streamName
      );
    }
    
    public function removeStream(userID:String, streamName:String):void {      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.unshareWebcam", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      );
    }
  }
}