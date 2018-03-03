package org.bigbluebutton.air.user.services {
	
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	public class UsersMessageSender {
		public var userSession:IUserSession;
		public var conferenceParameters:IConferenceParameters;
		
		// The default callbacks of userSession.mainconnection.sendMessage
		private var defaultSuccessResponse:Function = function(result:String):void {
			trace(result);
		};
		
		private var defaultFailureResponse:Function = function(status:String):void {
			trace(status);
		};
		
		public function UsersMessageSender() {
		}
		
		public function joinMeeting():void {
			var message:Object = {
				header: {name: "UserJoinMeetingReqMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {userId: conferenceParameters.internalUserID, authToken: conferenceParameters.authToken}
			};
			
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function kickUser(userID:String):void {
			trace("UsersMessageSender::kickUser() -- Sending [participants.kickUser] message to server.. with message [userID:" + userID + "]");
			var message:Object = {
				header: {name: "EjectUserFromMeetingCmdMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {userId: userID, ejectedBy: conferenceParameters.internalUserID}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function queryForParticipants():void {
			trace("UsersMessageSender::queryForParticipants() -- Sending [GetUsersMeetingReqMsg] message to server");
			
			var message:Object = {
				header: {name: "GetUsersMeetingReqMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {userId: conferenceParameters.internalUserID}
			};
			
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function assignPresenter(newPresenterUserId:String, newPresenterName:String, assignedBy:String):void {
			trace("UsersMessageSender::assignPresenter() -- Sending [participants.assignPresenter] message to server with message " 
				+ "[newPresenterID:" + newPresenterUserId + ", newPresenterName:" + newPresenterName + ", assignedBy:" + assignedBy + "]");
			var message:Object = {
				header: {name: "AssignPresenterReqMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {requesterId: conferenceParameters.internalUserID, 
					newPresenterId: newPresenterUserId, 
					newPresenterName: newPresenterName, assignedBy: assignedBy}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function emojiStatus(userID:String, emoji:String):void {
			var message:Object = {
				header: {name: "ChangeUserEmojiCmdMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {userId: userID, emoji: emoji}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function addStream(userID:String, streamName:String):void {
			trace("UsersMessageSender::addStream() -- Sending [participants.shareWebcam] message to server with message [streamName:" + streamName + "]");
			var message:Object = {
				header: {name: "UserBroadcastCamStartMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {stream: streamName}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function removeStream(userID:String, streamName:String):void {
			trace("UsersMessageSender::removeStream() -- Sending [participants.unshareWebcam] message to server");
			var message:Object = {
				header: {name: "UserBroadcastCamStopMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {stream: streamName}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function queryForRecordingStatus():void {
			trace("UsersMessageSender::queryForRecordingStatus() -- Sending [queryForRecordingStatus] message to server")
			var message:Object = {
				header: {name: "GetRecordingStatusReqMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {requestedBy: conferenceParameters.internalUserID}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function changeRecordingStatus(userId:String, recording:Boolean):void {
			trace("UsersMessageSender::changeRecordingStatus() -- Sending [changeRecordingStatus] message to server with message [userId:" + userId + ", recording:" + recording + "]");
			var message:Object = {
				header: {name: "SetRecordingStatusCmdMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {recording: recording, setBy: userId}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function muteAllUsers(mute:Boolean):void {
			trace("UsersMessageSender::muteAllUsers() -- Sending [voice.muteAllUsers] message to server. mute=[" + mute + "]");
			var message:Object = {
				header: {name: "MuteMeetingCmdMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {mutedBy: conferenceParameters.internalUserID, mute: mute}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function muteAllUsersExceptPresenter(mute:Boolean):void {
			trace("UsersMessageSender::muteAllUsers() -- Sending [voice.muteAllUsersExceptPresenter] message to server. mute=[" + mute + "]");
			var message:Object = {
				header: {name: "MuteAllExceptPresentersCmdMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {mutedBy: conferenceParameters.internalUserID, mute: mute}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function ejectUser(userid:String):void {
			trace("UsersMessageSender::ejectUser() -- Sending [voice.kickUSer] message to server with message [userId:" + userid + "]");
			var message:Object = {
				header: {name: "EjectUserFromVoiceCmdMsg", meetingId: conferenceParameters.meetingID,
					userId: conferenceParameters.internalUserID},
				body: {userId: userid, ejectedBy: conferenceParameters.internalUserID}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function getRoomMuteState():void {
			trace("UsersMessageSender::getRoomMuteState() -- Sending [voice.isRoomMuted] message to server");
			var message:Object = {
				header: {name: "IsMeetingMutedReqMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function getRoomLockState():void {
			trace("UsersMessageSender::getRoomLockState() -- Sending [lock.isRoomLocked] message to server");
			userSession.mainConnection.sendMessage("lock.isRoomLocked", defaultSuccessResponse, defaultFailureResponse);
		}
		
		public function setAllUsersLock(lock:Boolean, except:Array = null):void {
			trace("UsersMessageSender::setAllUsersLock() -- Sending [setAllUsersLock] message to server");
			var message:Object = {
				header: {name: "LockUsersInMeetingCmdMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {lock: lock, lockedBy: conferenceParameters.internalUserID, except: except}
			};
			
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function setUserLock(internalUserID:String, lock:Boolean):void {
			trace("UsersMessageSender::setUserLock() -- Sending [setUserLock] message to server - userId: [" + internalUserID + "] lock: [" + lock + "]");
			var message:Object = {
				header: {name: "LockUserInMeetingCmdMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {userId: internalUserID, lock: lock, lockedBy: conferenceParameters.internalUserID}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function getLockSettings():void {
			trace("UsersMessageSender::getLockSettings() -- Sending [getLockSettings] message to server");
			var message:Object = {
				header: {name: "GetLockSettingsReqMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {requesterId: conferenceParameters.internalUserID}
			};
			
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function saveLockSettings(newLockSettings:Object):void {
			var message:Object = {
				header: {name: "ChangeLockSettingsInMeetingCmdMsg", meetingId: conferenceParameters.meetingID, 
					userId: conferenceParameters.internalUserID},
				body: {disableCam: newLockSettings.disableCam, 
					disableMic: newLockSettings.disableMic, 
					disablePrivChat: newLockSettings.disablePrivateChat,
					disablePubChat: newLockSettings.disablePublicChat, 
					lockedLayout: newLockSettings.lockedLayout, 
					lockOnJoin: newLockSettings.lockOnJoin, 
					lockOnJoinConfigurable: newLockSettings.lockOnJoinConfigurable, 
					setBy: conferenceParameters.internalUserID}
			};
			trace("UsersMessageSender::saveLockSettings() -- Sending [saveLockSettings] message to server");
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function validateToken(internalUserID:String, authToken:String):void {
			trace("UsersMessageSender::validateToken() -- Sending [ValidateAuthTokenReqMsg] message to server");
			var message:Object = {
				header: {name: "ValidateAuthTokenReqMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {userId: internalUserID, authToken: authToken}
			};
			
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}

		public function changeRole(userId:String, role:String):void {
			trace("UsersMessageSender::changeRole() -- Sending [ChangeUserRoleCmdMsg] message to server");
			var message:Object = {
				header: {name: "ChangeUserRoleCmdMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {userId: userId, role: role, changedBy: conferenceParameters.internalUserID}
			};
			
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
	}
}
