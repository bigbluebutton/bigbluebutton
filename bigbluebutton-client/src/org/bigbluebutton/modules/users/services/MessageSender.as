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
  import org.bigbluebutton.core.connection.messages.breakoutrooms.CreateBreakoutRoomsCmdMsg;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.CreateBreakoutRoomsMsgBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.EndAllBreakoutRoomsMsg;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.EndAllBreakoutRoomsMsgBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.RequestBreakoutJoinURLReqBody;
  import org.bigbluebutton.core.connection.messages.breakoutrooms.RequestBreakoutJoinURLReqMsg;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.users.GuestWaiting;

  public class MessageSender {
	private static const LOGGER:ILogger = getClassLogger(MessageSender);

    public function queryForParticipants():void {
      var message:Object = {
        header: {name: "GetUsersMeetingReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x( 
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps"];
            logData.logCode = "error_sending_query_users";
            LOGGER.info(JSON.stringify(logData));
        }, message
      );
    }

    public function queryForGuestsWaiting():void {
      var message:Object = {
        header: {name: "GetGuestsWaitingApprovalReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID()}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x( 
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
            var logData:Object = UsersUtil.initLogData();
            logData.tags = ["apps"];
            logData.message = "Error occurred querying guests waiting.";
            LOGGER.info(JSON.stringify(logData));
        }, message
      );
    }

    public function joinMeeting(): void {
      var message:Object = {
        header: {name: "UserJoinMeetingReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: UsersUtil.getMyUserID(), authToken: LiveMeeting.inst().me.authToken}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(function(result:String):void { // On successful result
      }, function(status:String):void { // status - On error occurred
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["apps"];
				logData.logCode = "error_sending_join_meeting";
        LOGGER.info(JSON.stringify(logData));
      }, message);
    }

    public function joinMeetingAfterReconnect(): void {
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["apps"];
			logData.logCode = "joining_after_reconnect";
			LOGGER.info(JSON.stringify(logData));

      var message:Object = {
        header: {name: "UserJoinMeetingAfterReconnectReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: UsersUtil.getMyUserID(), authToken: LiveMeeting.inst().me.authToken}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(function(result:String):void { // On successful result
      }, function(status:String):void { // status - On error occurred
          logData.tags = ["apps"];
          logData.logCode = "error_sending_join_after_reconnect";
          LOGGER.info(JSON.stringify(logData));
      }, message);
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
        logData.logCode = "error_sending_assign_presenter";
        LOGGER.info(JSON.stringify(logData));
      }, message);
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
                logData.logCode = "error_sending_change_emoji";
                LOGGER.info(JSON.stringify(logData));
            },
          message
        );
		}

		public function createBreakoutRooms(meetingId:String, rooms:Array, durationInMinutes:int, record:Boolean):void {
			var body:CreateBreakoutRoomsMsgBody = new CreateBreakoutRoomsMsgBody(meetingId, durationInMinutes, record, rooms);
			var message:CreateBreakoutRoomsCmdMsg = new CreateBreakoutRoomsCmdMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_create_breakout";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}

		public function requestBreakoutJoinUrl(parentMeetingId:String, breakoutMeetingId:String, userId:String):void {
			var body:RequestBreakoutJoinURLReqBody = new RequestBreakoutJoinURLReqBody(parentMeetingId, breakoutMeetingId, userId);
			var message:RequestBreakoutJoinURLReqMsg = new RequestBreakoutJoinURLReqMsg(body);
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_request_breakout_url";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}
		
		public function listenInOnBreakout(fromMeetingId:String, toMeetingId:String, userId:String):void {
      var message:Object = {
        header: {name: "TransferUserToMeetingRequestMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {fromMeetingId: fromMeetingId, toMeetingId: toMeetingId, userId: UsersUtil.getMyUserID()}
      };
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_listen_on_breakout";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}

		public function endAllBreakoutRooms(meetingId:String):void {
			var body:EndAllBreakoutRoomsMsgBody = new EndAllBreakoutRoomsMsgBody(meetingId);
			var message:EndAllBreakoutRoomsMsg = new EndAllBreakoutRoomsMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_end_breakout";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}

		public function addStream(userID:String, streamName:String):void {
			var body:UserBroadcastCamStartMsgBody = new UserBroadcastCamStartMsgBody(streamName);
			var message:UserBroadcastCamStartMsg = new UserBroadcastCamStartMsg(body);

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.userId = userID;
				logData.streamId = streamName;
				logData.logCode = "error_sending_cam_broadcast_start";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}

		public function removeStream(userID:String, streamName:String):void {

			var body:UserBroadcastCamStopMsgBody = new UserBroadcastCamStopMsgBody(streamName);
			var message:UserBroadcastCamStopMsg = new UserBroadcastCamStopMsg(body);

			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webcam"];
			logData.streamId = streamName;
			logData.userId = userID;
			logData.logCode = "sending_cam_broadcast_stop";
			LOGGER.info(JSON.stringify(logData));


			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(function(result:String):void { // On successful result
			}, function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.streamId = streamName;
				logData.userId = userID;
				logData.logCode = "error_sending_cam_broadcast_stop";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}
    
    public function logoutEndMeeting(userID:String):void {
      var message:Object = {
        header: {name: "LogoutAndEndMeetingCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {userId: userID}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_logout_end_meeting";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );
    }

    public function queryForRecordingStatus():void {
      var message:Object = {
        header: {name: "GetRecordingStatusReqMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {requestedBy: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_get_recording_status";
                LOGGER.info(JSON.stringify(logData));
        },
        message
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
				logData.logCode = "error_sending_get_breakout_rooms";
				LOGGER.info(JSON.stringify(logData));
			}, message);
		}

    public function activityResponse():void {
      var message:Object = {
        header: {name: "MeetingActivityResponseCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {respondedBy: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_meeting_activity_response";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); //_netConnection.call
    }
		
		public function userInactivityAuditResponse():void {
			var message:Object = {
				header: {name: "UserInactivityAuditResponseMsg", meetingId: UsersUtil.getInternalMeetingID(), 
					userId: UsersUtil.getMyUserID()},
				body: {userId: UsersUtil.getMyUserID()}
			};
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage2x(
				function(result:String):void { // On successful result
				},
				function(status:String):void { // status - On error occurred
					var logData:Object = UsersUtil.initLogData();
					logData.tags = ["apps"];
					logData.message = "Error occured activity response.";
					LOGGER.info(JSON.stringify(logData));
				},
				JSON.stringify(message)
			); //_netConnection.call
		}

    public function changeRecordingStatus(userID:String, recording:Boolean):void {
      var message:Object = {
        header: {name: "SetRecordingStatusCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {recording: recording, setBy: userID}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_change_recording_status";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); //_netConnection.call
    }

	public function recordAndClearPreviousMarkers(userID:String, recording:Boolean):void {
		var message:Object = {
			header: {name: "RecordAndClearPreviousMarkersCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
				userId: UsersUtil.getMyUserID()},
			body: {recording: recording, setBy: userID}
		};

		var _nc:ConnectionManager = BBB.initConnectionManager();
		_nc.sendMessage2x(
			function(result:String):void { // On successful result
			},
			function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_change_recording_status";
				LOGGER.info(JSON.stringify(logData));
			},
			JSON.stringify(message)
		); //_netConnection.call
	}

    public function muteAllUsers(mute:Boolean):void {
      var message:Object = {
        header: {name: "MuteMeetingCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {mutedBy: UsersUtil.getMyUserID(), mute: mute}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_mute_all_users";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); 
    }
    
    public function muteAllUsersExceptPresenter(mute:Boolean):void {
      var message:Object = {
        header: {name: "MuteAllExceptPresentersCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {mutedBy: UsersUtil.getMyUserID(), mute: mute}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_mute_all_except_presenter";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); 
    }
    
    public function muteUnmuteUser(userid:String, mute:Boolean):void {
      var message:Object = {
        header: {name: "MuteUserCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {userId: userid, mutedBy: UsersUtil.getMyUserID(), mute: mute}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_mute_user";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );
     }

    public function ejectUserFromVoice(userid:String):void {
      var message:Object = {
        header: {name: "EjectUserFromVoiceCmdMsg", meetingId: UsersUtil.getInternalMeetingID(),
          userId: UsersUtil.getMyUserID()},
        body: {userId: userid, ejectedBy: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_eject_user_from_voice";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );    
    }

    public function kickUser(userID:String):void {
      var message:Object = {
        header: {name: "EjectUserFromMeetingCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: userID, ejectedBy: UsersUtil.getMyUserID()}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(function(result:String):void { // On successful result
      }, function(status:String):void { // status - On error occurred
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["apps"];
				logData.logCode = "error_sending_eject_user_from_meeting";
        LOGGER.info(JSON.stringify(logData));
      }, message);
    }

    public function addUserToPresenterGroup(userID:String):void {
      var message:Object = {
        header: {name: "AddUserToPresenterGroupCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: userID, requesterId: UsersUtil.getMyUserID()}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(function(result:String):void { // On successful result
      }, function(status:String):void { // status - On error occurred
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["apps"];
        logData.message = "Error occurred adding a user to presenter group.";
        LOGGER.info(JSON.stringify(logData));
      }, message);
    }

    public function removeUserFromPresenterGroup(userID:String):void {
      var message:Object = {
        header: {name: "RemoveUserFromPresenterGroupCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {userId: userID, requesterId: UsersUtil.getMyUserID()}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(function(result:String):void { // On successful result
      }, function(status:String):void { // status - On error occurred
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["apps"];
        logData.message = "Error occurred removing a user from presenter group.";
        LOGGER.info(JSON.stringify(logData));
      }, message);
    }

    public function handleRequestPresenterGroupEvent():void {
      var message:Object = {
        header: {name: "GetPresenterGroupReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID()}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { },
        function(status:String):void { LOGGER.error(status); },
          message
      );
    }

    public function getRoomMuteState():void{
      var message:Object = {
        header: {name: "IsMeetingMutedReqMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {}
      };
         
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_meeting_mute_state";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      ); 
    }    

    /**
     * Set lock state of all users in the room, except the users listed in second parameter
     * */
    public function setAllUsersLock(lock:Boolean, except:Array = null):void {
      var message:Object = {
        header: {name: "LockUsersInMeetingCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {lock: lock, lockedBy: UsersUtil.getMyUserID(), except: except}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
          var logData:Object = UsersUtil.initLogData();
          logData.tags = ["apps"];
					logData.logCode = "error_sending_lock_users_in_meeting";
          LOGGER.info(JSON.stringify(logData));
        },
        message
      );
    }
    
    /**
     * Set lock state of all users in the room, except the users listed in second parameter
     * */
    public function setUserLock(internalUserID:String, lock:Boolean):void {
      var message:Object = {
        header: {name: "LockUserInMeetingCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {userId: internalUserID, lock: lock, lockedBy: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
          var logData:Object = UsersUtil.initLogData();
          logData.tags = ["apps"];
					logData.logCode = "error_sending_lock_user_in_meeting";
          LOGGER.info(JSON.stringify(logData));
        },
        message
      );
    }
    
    
    public function getLockSettings():void{
      var message:Object = {
        header: {name: "GetLockSettingsReqMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {requesterId: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
          var logData:Object = UsersUtil.initLogData();
          logData.tags = ["apps"];
					logData.logCode = "error_sending_get_lock_settings";
          LOGGER.info(JSON.stringify(logData));
        },
        message
      );   
    }
    
    public function saveLockSettings(newLockSettings:Object):void{   
      
      var message:Object = {
        header: {name: "ChangeLockSettingsInMeetingCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {disableCam: newLockSettings.disableCam, 
          disableMic: newLockSettings.disableMic, 
          disablePrivChat: newLockSettings.disablePrivateChat,
          disablePubChat: newLockSettings.disablePublicChat, 
          lockedLayout: newLockSettings.lockedLayout, 
          lockOnJoin: newLockSettings.lockOnJoin, 
          lockOnJoinConfigurable: newLockSettings.lockOnJoinConfigurable, 
          setBy: UsersUtil.getMyUserID()}
      };
      
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
        },	                   
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_save_lock_settings";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );      
    }
	
	public function updateWebcamsOnlyForModerator(webcamsOnlyForModerator:Boolean, userID : String):void {
		var message:Object = {
			header: {name: "UpdateWebcamsOnlyForModeratorCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
				userId: UsersUtil.getMyUserID()},
			body: {webcamsOnlyForModerator: webcamsOnlyForModerator, setBy: userID}
		};
		
		var _nc:ConnectionManager = BBB.initConnectionManager();
		_nc.sendMessage2x(
			function(result:String):void { // On successful result
				LOGGER.debug(result);
			},
			function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_webcams_only_for_moderators";
				LOGGER.info(JSON.stringify(logData));
			},
			message
		);
	}

    public function changeRole(userID:String, role:String):void {
      var message:Object = {
        header: {name: "ChangeUserRoleCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {userId: userID, role: role, changedBy: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        function(result:String):void { // On successful result
          LOGGER.debug(result);
        },
        function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_change_user_role";
                LOGGER.info(JSON.stringify(logData));
        },
        message
      );
    }
	
	public function queryForWebcamsOnlyForModerator():void {
		var message:Object = {
			header: {name: "GetWebcamsOnlyForModeratorReqMsg", meetingId: UsersUtil.getInternalMeetingID(), 
				userId: UsersUtil.getMyUserID()},
			body: {requestedBy: UsersUtil.getMyUserID()}
		};
		
		var _nc:ConnectionManager = BBB.initConnectionManager();
		_nc.sendMessage2x(
			function(result:String):void { // On successful result
				LOGGER.debug(result);
			},
			function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_get_webcams_only_for_moderator";
				LOGGER.info(JSON.stringify(logData));
			},
			message
		);
	}

    public function queryForGuestPolicy():void {

      var message:Object = {
        header: {name: "GetGuestPolicyReqMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {requestedBy: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
         function(result:String):void { // On successful result
           LOGGER.debug(result);
         },
         function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_get_guest_policy";
                LOGGER.info(JSON.stringify(logData));
         },
         message
       );
    }

    public function setGuestPolicy(policy:String):void {

      var message:Object = {
        header: {name: "SetGuestPolicyCmdMsg", meetingId: UsersUtil.getInternalMeetingID(), 
          userId: UsersUtil.getMyUserID()},
        body: {policy: policy, setBy: UsersUtil.getMyUserID()}
      };
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
         function(result:String):void { // On successful result
           LOGGER.debug(result);
         },
         function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_set_guest_policy";
                LOGGER.info(JSON.stringify(logData));
         },
         message
       );
    }

    public function responseToGuest(userId:String, response:Boolean):void {

	  var _guests: Array = new Array();
	  _guests.push({guest: userId, approved: response});
	  
	  var message:Object = {
		  header: {name: "GuestsWaitingApprovedMsg", meetingId: UsersUtil.getInternalMeetingID(), 
			  userId: UsersUtil.getMyUserID()},
		  body: {guests: _guests, approvedBy: UsersUtil.getMyUserID()}
	  };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
         function(result:String):void { // On successful result
           LOGGER.debug(result);
         },
         function(status:String):void { // status - On error occurred
                var logData:Object = UsersUtil.initLogData();
                logData.tags = ["apps"];
								logData.logCode = "error_sending_guest_waiting_approved";
                LOGGER.info(JSON.stringify(logData));
         },
		 JSON.stringify(message)
       );
		}


    private function removeGuestsWaiting(userIds: Array): void {
      for (var i:int = 0; i < userIds.length; i++) {
        LiveMeeting.inst().guestsWaiting.remove(userIds[i]);
      }
    }
    
    public function approveGuestAccess(userIds: Array, approve:Boolean):void {
		var _guests: Array = new Array();
		var status: String = GuestWaiting.DENY;
    if (approve) status = GuestWaiting.ALLOW;
    
		for (var i:int = 0; i < userIds.length; i++) {
			_guests.push({guest: userIds[i], status: status});
		}
		
		var message:Object = {
			header: {name: "GuestsWaitingApprovedMsg", meetingId: UsersUtil.getInternalMeetingID(), 
				userId: UsersUtil.getMyUserID()},
			body: {guests: _guests, approvedBy: UsersUtil.getMyUserID()}
		};
		
		var _nc:ConnectionManager = BBB.initConnectionManager();
		_nc.sendMessage2x(
			function(result:String):void { // On successful result
				LOGGER.debug(result);
			},
			function(status:String):void { // status - On error occurred
				var logData:Object = UsersUtil.initLogData();
				logData.tags = ["apps"];
				logData.logCode = "error_sending_guest_waiting_approved";
				LOGGER.info(JSON.stringify(logData));
			},
			message
		);
    }
  }
}
