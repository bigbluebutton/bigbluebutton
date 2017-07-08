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
  import org.bigbluebutton.core.connection.messages.UserBroadcastCamStartMsg;
  import org.bigbluebutton.core.connection.messages.UserBroadcastCamStartMsgBody;
  import org.bigbluebutton.core.connection.messages.UserBroadcastCamStopMsg;
  import org.bigbluebutton.core.connection.messages.UserBroadcastCamStopMsgBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.BreakoutRoomsListMsg;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.BreakoutRoomsListMsgBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.CreateBreakoutRoomsMsg;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.CreateBreakoutRoomsMsgBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.EndAllBreakoutRoomsMsg;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.EndAllBreakoutRoomsMsgBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.ListenInOnBreakoutMsg;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.ListenInOnBreakoutMsgBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.RequestBreakoutJoinURLMsg;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.RequestBreakoutJoinURLMsgBody;
  import org.bigbluebutton.core.managers.ConnectionManager;

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
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps"];
            logData.userId = userID;
            logData.message = "Error occured ejecting user.";
            LOGGER.info(JSON.stringify(logData));
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
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps"];
            logData.message = "Error occured querying users.";
            LOGGER.info(JSON.stringify(logData));
        }
      );
    }
    
    public function joinMeeting(): void {
      // TODO: Send joine meeting message to server.
    }
    
    public function assignPresenter(newPresenterUserId:String, newPresenterName:String, assignedBy:String):void {
      var message:Object = {
        header: {name: "AssignPresenterReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID(), newPresenterId: newPresenterUserId, newPresenterName: newPresenterName, assignedBy: assignedBy}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(function(result:String):void { // On successful result
      }, function(status:String):void { // status - On error occurred
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["apps"];
        logData.message = "Error occurred assigning a presenter.";
        LOGGER.info(JSON.stringify(logData));
      }, JSON.stringify(message));
    }

    public function emojiStatus(userID:String, emoji:String):void {
      var message:Object = {
        header: {name: "ChangeUserEmojiCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: userID, emoji: emoji}
      };
        
        var _nc:ConnectionManager = BBB.initConnectionManager();
        _nc.sendMessage2x(function(result:String):void {   
          // On successful result
            }, function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured setting emoji status.";
                LOGGER.info(JSON.stringify(logData));
            },
          JSON.stringify(message)
        );
		}

		public function createBreakoutRooms(meetingId:String, rooms:Array, durationInMinutes:int, record:Boolean):void {
			var body:CreateBreakoutRoomsMsgBody = new CreateBreakoutRoomsMsgBody(meetingId, durationInMinutes, record, rooms);
			var message:CreateBreakoutRoomsMsg = new CreateBreakoutRoomsMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured creating breakout rooms.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}

		public function requestBreakoutJoinUrl(parentMeetingId:String, breakoutMeetingId:String, userId:String):void {
			var body:RequestBreakoutJoinURLMsgBody = new RequestBreakoutJoinURLMsgBody(parentMeetingId, breakoutMeetingId, userId);
			var message:RequestBreakoutJoinURLMsg = new RequestBreakoutJoinURLMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured requesting breakout room join url.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}
		
		public function listenInOnBreakout(meetingId:String, targetMeetingId:String, userId:String):void {
			var body:ListenInOnBreakoutMsgBody = new ListenInOnBreakoutMsgBody(meetingId, targetMeetingId, userId);
			var message:ListenInOnBreakoutMsg = new ListenInOnBreakoutMsg(body);
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured listen on breakout room.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}

		public function endAllBreakoutRooms(meetingId:String):void {
			var body:EndAllBreakoutRoomsMsgBody = new EndAllBreakoutRoomsMsgBody(meetingId);
			var message:EndAllBreakoutRoomsMsg = new EndAllBreakoutRoomsMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured requesting breakout room join url.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}

		public function addStream(userID:String, streamName:String):void {
			var body:UserBroadcastCamStartMsgBody = new UserBroadcastCamStartMsgBody(streamName);
			var message:UserBroadcastCamStartMsg = new UserBroadcastCamStartMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured sharing webcam.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}

		public function removeStream(userID:String, streamName:String):void {

			var body:UserBroadcastCamStopMsgBody = new UserBroadcastCamStopMsgBody(streamName);
			var message:UserBroadcastCamStopMsg = new UserBroadcastCamStopMsg(body);

			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webcam"];
			logData.streamId = streamName;
			logData.message = "User stopped sharing webcam";
			LOGGER.info(JSON.stringify(logData));


			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured unsharing webcam.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}
    
    public function logoutEndMeeting(userID:String):void {
      var message:Object = new Object();
      message["userId"] = userID;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.logoutEndMeeting",
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured logout and end meeting.";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );
    }

    public function queryForRecordingStatus():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.getRecordingStatus",// Remote function name
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured getting recording status.";
                LOGGER.info(JSON.stringify(logData));
        }
      ); //_netConnection.call
	}

		public function queryForBreakoutRooms(meetingId:String):void {
			var body:BreakoutRoomsListMsgBody = new BreakoutRoomsListMsgBody(meetingId);
			var message:BreakoutRoomsListMsg = new BreakoutRoomsListMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.message = "Error occured querying breakout rooms.";
				LOGGER.info(JSON.stringify(logData));
			}, JSON.stringify(message));
		}

    public function activityResponse():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.activityResponse", // Remote function name
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured activity response.";
                LOGGER.info(JSON.stringify(logData));
        }
      ); //_netConnection.call
    }

    public function changeRecordingStatus(userID:String, recording:Boolean):void {
      var message:Object = new Object();
      message["userId"] = userID;
      message["recording"] = recording;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.setRecordingStatus",// Remote function name
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured change recording status.";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); //_netConnection.call
    }

    public function muteAllUsers(mute:Boolean):void {
      var message:Object = new Object();
      message["mute"] = mute;
    
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("voice.muteAllUsers",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured muting all users.";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); 
    }
    
    public function muteAllUsersExceptPresenter(mute:Boolean):void {
      var message:Object = new Object();
      message["mute"] = mute;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("voice.muteAllUsersExceptPresenter",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured muting all users except presenter.";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); 
    }
    
    public function muteUnmuteUser(userid:String, mute:Boolean):void {
      var message:Object = new Object();
      message["userId"] = userid;
      message["mute"] = mute;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("voice.muteUnmuteUser",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured muting user.";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );          
     }

    public function ejectUser(userid:String):void {
      var message:Object = new Object();
      message["userId"] = userid;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("voice.ejectUserFromVoice",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured ejecting user.";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );    
    }
    
    public function getRoomMuteState():void{
      var message:Object = new Object();
         
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("voice.isRoomMuted",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occuredget room mute state.";
                LOGGER.info(JSON.stringify(logData));
        }
      ); 
    }
    
    public function getRoomLockState():void{
      var message:Object = new Object();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("lock.isRoomLocked",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured getting lock state.";
                LOGGER.info(JSON.stringify(logData));
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
		_nc.sendMessage("lock.setUserLock",
			function(result:String):void { // On successful result
			},	                   
			function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured setting user lock status.";
                LOGGER.info(JSON.stringify(logData));
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
      _nc.sendMessage("lock.setLockSettings",
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured saving lock settings.";
                LOGGER.info(JSON.stringify(logData));
        },
        newLockSettings
      );      
    }

    public function changeRole(userID:String, role:String):void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      var message:Object = new Object();
      message["userId"] = userID;
      message["role"] = role;

      _nc.sendMessage("participants.setParticipantRole",// Remote function name
        function(result:String):void { // On successful result
          LOGGER.debug(result);
        },
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured change role.";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );
    }

    public function queryForGuestPolicy():void {
      LOGGER.debug("queryForGuestPolicy");
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.getGuestPolicy",
         function(result:String):void { // On successful result
           LOGGER.debug(result);
         },
         function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured query guest policy.";
                LOGGER.info(JSON.stringify(logData));
         }
       );
    }

    public function setGuestPolicy(policy:String):void {
      LOGGER.debug("setGuestPolicy - new policy:[" + policy + "]");
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.setGuestPolicy",
         function(result:String):void { // On successful result
           LOGGER.debug(result);
         },
         function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured set guest policy.";
                LOGGER.info(JSON.stringify(logData));
         },
         policy
       );
    }

    public function responseToGuest(userId:String, response:Boolean):void {
      LOGGER.debug("responseToGuest - userId:[" + userId + "] response:[" + response + "]");

      var message:Object = new Object();
      message["userId"] = userId;
      message["response"] = response;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("participants.responseToGuest",
         function(result:String):void { // On successful result
           LOGGER.debug(result);
         },
         function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
                logData.message = "Error occured response guest.";
                LOGGER.info(JSON.stringify(logData));
         },
         message
       );
    }

    public function responseToAllGuests(response:Boolean):void {
      responseToGuest(null, response);
    }
  }
}
