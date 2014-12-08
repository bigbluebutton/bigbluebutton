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
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.main.model.users.IMessageListener;
  
  public class MessageSender {
    private static const LOG:String = "Users::MessageSender - ";

    public function kickUser(userID:String):void {
      var message:Object = new Object();
      message["userId"] = userID;
      message["ejectedBy"] = UsersUtil.getMyUserID();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.ejectUserFromMeeting", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
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
      var _nc:ConnectionManager = BBB.initConnectionManager();
      if (raise) {
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
        message["userId"] = userID;
        message["loweredBy"] = userID;

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
    
    public function queryForRecordingStatus():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "participants.getRecordingStatus",// Remote function name
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      ); //_netConnection.call
    }
    
    public function changeRecordingStatus(userID:String, recording:Boolean):void {
      trace(LOG + "Sending setRecordingStatus. recording=[" + recording + "]");
      var message:Object = new Object();
      message["userId"] = userID;
      message["recording"] = recording;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "participants.setRecordingStatus",// Remote function name
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      ); //_netConnection.call
    }

    public function muteAllUsers(mute:Boolean):void {
      trace(LOG + "Sending muteAllUsers. mute=[" + mute + "]");
      var message:Object = new Object();
      message["mute"] = mute;
    
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.muteAllUsers",
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      ); 
    }
    
    public function muteAllUsersExceptPresenter(mute:Boolean):void {

      trace(LOG + "Sending muteAllUsersExceptPresenter. mute=[" + mute + "]");
      var message:Object = new Object();
      message["mute"] = mute;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.muteAllUsersExceptPresenter",
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      ); 
    }
    
    public function muteUnmuteUser(userid:String, mute:Boolean):void {
      trace(LOG + "Sending muteUnmuteUser. id=[" + userid + "], mute=[" + mute + "]");
      var message:Object = new Object();
      message["userId"] = userid;
      message["mute"] = mute;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.muteUnmuteUser",
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      );          
     } 
    
    public function ejectUser(userid:String):void {
      trace("Sending ejectUser. id=[" + userid + "]");
      var message:Object = new Object();
      message["userId"] = userid;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.ejectUserFromVoice",
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      );    
    }
    
    public function getRoomMuteState():void{
      trace("Sending getRoomMuteState.");
      var message:Object = new Object();
         
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.isRoomMuted",
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      ); 
    }
    
    public function getRoomLockState():void{
      trace("Sending getRoomLockState.");
      var message:Object = new Object();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "lock.isRoomLocked",
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      );    
    }    

    /**
     * Set lock state of all users in the room, except the users listed in second parameter
     * */
    public function setAllUsersLock(lock:Boolean, except:Array = null):void {
      
      return;
/*      
      if(except == null) except = [];
      var nc:NetConnection = _module.connection;
      nc.call(
        "lock.setAllUsersLock",// Remote function name
        new Responder(
          function(result:Object):void { 
            LogUtil.debug("Successfully locked all users except " + except.join(","));
          },	
          function(status:Object):void { 
            LogUtil.error("Error occurred:"); 
            for (var x:Object in status) { 
              LogUtil.error(x + " : " + status[x]); 
            } 
          }
        )//new Responder
        , lock, except
      ); //_netConnection.call
      
      _listenersSO.send("lockStateCallback", lock);
*/
    }
    
    /**
     * Set lock state of all users in the room, except the users listed in second parameter
     * */
    public function setUserLock(internalUserID:String, lock:Boolean):void {
      
      return;
/*      
      var nc:NetConnection = _module.connection;
      nc.call(
        "lock.setUserLock",// Remote function name
        new Responder(
          function(result:Object):void { 
            LogUtil.debug("Successfully locked user " + internalUserID);
          },	
          function(status:Object):void { 
            LogUtil.error("Error occurred:"); 
            for (var x:Object in status) { 
              LogUtil.error(x + " : " + status[x]); 
            } 
          }
        )//new Responder
        , lock, internalUserID
      ); //_netConnection.call
*/
    }
    
    
    public function getLockSettings():void{
      
      return;
/*      
      var nc:NetConnection = _module.connection;
      nc.call(
        "lock.getLockSettings",// Remote function name
        new Responder(
          function(result:Object):void {
            //						_conference.setLockSettings(new LockSettingsVO(result.allowModeratorLocking, result.disableCam, result.disableMic, result.disablePrivateChat, result.disablePublicChat));
          },	
          function(status:Object):void { 
            LogUtil.error("Error occurred:"); 
            for (var x:Object in status) { 
              LogUtil.error(x + " : " + status[x]); 
            } 
          }
        )//new Responder
      ); //_netConnection.call
*/
    }
    
    public function saveLockSettings(newLockSettings:Object):void{   
      trace("Sending setLockSettings.");
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "lock.setLockSettings",
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        newLockSettings
      );      
    }
  }
}