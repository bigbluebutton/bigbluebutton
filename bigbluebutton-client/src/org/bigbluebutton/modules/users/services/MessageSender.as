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
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.main.api.JSLog;
  
  public class MessageSender {
	private static const LOGGER:ILogger = getClassLogger(MessageSender);      

    public function kickUser(userID:String):void {
      var message:Object = new Object();
      message["userId"] = userID;
      message["ejectedBy"] = UsersUtil.getMyUserID();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.ejectUserFromMeeting", 
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );
    }
    
    public function queryForParticipants():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.getParticipants", 
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
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
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );
		}
		
		public function emojiStatus(userID:String, emoji:String):void {
			var message:Object = new Object();
			message["emojiStatus"] = emoji;
			message["userId"] = userID;
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("participants.userEmojiStatus", function(result:String):void
			{ // On successful result
			}, function(status:String):void
			{ // status - On error occurred
				LOGGER.error(status);
			},
			message
			);
		}
		
		public function createBreakoutRooms(meetingId:String, rooms:Array, durationInMinutes:int):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["rooms"] = rooms;
			message["durationInMinutes"] = durationInMinutes;
			var jsonMsg:String = JSON.stringify(message);
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("breakoutroom.createBreakoutRooms", function(result:String):void
			{
				// On successful result
			}, function(status:String):void
			{ // status - On error occurred
				LOGGER.error(status);
			},
			jsonMsg
			);
		}
		
		public function requestBreakoutJoinUrl(meetingId:String, breakoutId:String, userId:String):void {
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			message["breakoutId"] = breakoutId;
			message["userId"] = userId;
			
			var jsonMsg:String = JSON.stringify(message);
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("breakoutroom.requestBreakoutJoinUrl", function(result:String):void
			{
				// On successful result
			}, function(status:String):void
			{ // status - On error occurred
				LOGGER.error(status);
			},
			jsonMsg
			);
		}

		public function listenInOnBreakout(meetingId:String, breakoutId:String, userId:String, listen:Boolean):void {
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("breakoutroom.listenInOnBreakout", function(result:String):void
			{
				// On successful result
			}, function(status:String):void
			{ // status - On error occurred
				LOGGER.error(status);
			},
			JSON.stringify({meetingId:meetingId, breakoutId:breakoutId, userId:userId, listen:listen})
			);
		}

		public function endAllBreakoutRooms(meetingId:String):void{
			var message:Object = new Object();
			message["meetingId"] = meetingId;
			
			var jsonMsg:String = JSON.stringify(message);
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("breakoutroom.endAllBreakoutRooms", function(result:String):void
			{
				// On successful result
			}, function(status:String):void
			{ // status - On error occurred
				LOGGER.error(status);
			},
			jsonMsg
			);
		}
    
    public function addStream(userID:String, streamName:String):void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.shareWebcam", 
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        streamName
      );
    }
    
    public function removeStream(userID:String, streamName:String):void {
	  
	  var logData:Object = new Object();
	  logData.user = UsersUtil.getUserData();
	  
	  JSLog.warn("User stopped sharing webcam event.", logData);
	  
	  logData.streamId = streamName;
	  logData.message = "User stopped sharing webcam";
	  LOGGER.info(JSON.stringify(logData));
	  
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.unshareWebcam", 
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status);  
        },
        streamName
      );
    }
    
    public function queryForRecordingStatus():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "participants.getRecordingStatus",// Remote function name
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        }
      ); //_netConnection.call
    }
    
    public function changeRecordingStatus(userID:String, recording:Boolean):void {
      var message:Object = new Object();
      message["userId"] = userID;
      message["recording"] = recording;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "participants.setRecordingStatus",// Remote function name
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      ); //_netConnection.call
    }

    public function muteAllUsers(mute:Boolean):void {
      var message:Object = new Object();
      message["mute"] = mute;
    
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.muteAllUsers",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      ); 
    }
    
    public function muteAllUsersExceptPresenter(mute:Boolean):void {
      var message:Object = new Object();
      message["mute"] = mute;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.muteAllUsersExceptPresenter",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      ); 
    }
    
    public function muteUnmuteUser(userid:String, mute:Boolean):void {
      var message:Object = new Object();
      message["userId"] = userid;
      message["mute"] = mute;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.muteUnmuteUser",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );          
     } 
    
    public function ejectUser(userid:String):void {
      var message:Object = new Object();
      message["userId"] = userid;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.ejectUserFromVoice",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );    
    }
    
    public function getRoomMuteState():void{
      var message:Object = new Object();
         
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "voice.isRoomMuted",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        }
      ); 
    }
    
    public function getRoomLockState():void{
      var message:Object = new Object();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "lock.isRoomLocked",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
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
		var message:Object = new Object();
		message["userId"] = internalUserID;
		message["lock"] = lock;
		
		var _nc:ConnectionManager = BBB.initConnectionManager();
		_nc.sendMessage(
			"lock.setUserLock",
			function(result:String):void { // On successful result
			},	                   
			function(status:String):void { // status - On error occurred
			  LOGGER.error(status); 
			},
			message
		);
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
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "lock.setLockSettings",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        newLockSettings
      );      
    }
  }
}
