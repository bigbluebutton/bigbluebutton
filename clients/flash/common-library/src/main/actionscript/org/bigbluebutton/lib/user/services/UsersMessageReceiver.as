package org.bigbluebutton.lib.user.services {
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.LockSettings2x;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.user.models.User2x;
	
	public class UsersMessageReceiver implements IMessageListener {
		private const LOG:String = "UsersMessageReceiver::";
		
		public var userSession:IUserSession;
		
		public var meetingData:IMeetingData;
		
		public var conferenceParameters:IConferenceParameters;
		
		public var disconnectUserSignal:DisconnectUserSignal;
		
		public function UsersMessageReceiver() {
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "voiceUserTalking":
					handleVoiceUserTalking(message);
					break;
				case "userSharedWebcam":
					handleUserSharedWebcam(message);
					break;
				case "userUnsharedWebcam":
					handleUserUnsharedWebcam(message);
					break;
				case "user_listening_only":
				case "userListeningOnly":
					handleUserListeningOnly(message);
					break;
				case "voiceUserMuted":
					handleVoiceUserMuted(message);
					break;
				case "joinMeetingReply":
					handleJoinedMeeting(message);
					break
				case "meetingHasEnded":
				case "meetingEnded":
					handleMeetingHasEnded(message);
					break;
				case "userEmojiStatus":
					handleEmojiStatus(message);
					break;
				case "meetingState":
					handleMeetingState(message);
					break;
				case "meetingMuted":
					handleMeetingMuted(message);
					break;
				
				case "GetRecordingStatusRespMsg":
					handleGetRecordingStatusReply(message);
					break;
				case "RecordingStatusChangedEvtMsg":
					handleRecordingStatusChanged(message);
					break;
				
				case "UserJoinedVoiceConfToClientEvtMsg":
					handleUserJoinedVoiceConfToClientEvtMsg(message);
					break;
				case "UserLeftVoiceConfToClientEvtMsg":
					handleUserLeftVoiceConfToClientEvtMsg(message);
					break;
				
				case "GetUsersMeetingRespMsg":
					handleGetUsersMeetingRespMsg(message);
					break;
				case "UserJoinedMeetingEvtMsg":
					handleUserJoinedMeetingEvtMsg(message);
					break;
				case "UserLeftMeetingEvtMsg":
					handleUserLeftMeetingEvtMsg(message);
					break;
				case "UserLockedInMeetingEvtMsg":
					handleUserLockedInMeetingEvtMsg(message);
					break;
				case "PresenterAssignedEvtMsg":
					handlePresenterAssignedEvtMsg(message);
					break;
				case "PresenterUnassignedEvtMsg":
					handlePresenterUnassignedEvtMsg(message);
					break;
				case "LockSettingsInMeetingChangedEvtMsg":
					handleLockSettingsInMeetingChangedEvtMsg(message);
					break;
				case "GetLockSettingsRespMsg":
					handleGetLockSettingsRespMsg(message);
					break;
				case "LockSettingsNotInitializedRespMsg":
					handleLockSettingsNotInitializedRespMsg(message);
					break;
				case "ValidateAuthTokenRespMsg":
					handleValidateAuthTokenRespMsg(message);
					break;
				default:
					break;
			}
		}
		
		private function handleMeetingMuted(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("handleMeetingMuted: " + ObjectUtil.toString(msg));
			userSession.meetingMuted = msg.meetingMuted;
		}
		
		private function handleMeetingState(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			userSession.meetingMuted = msg.meetingMuted;
			updateLockSettings(msg.permissions);
		}
		
		private function handleEmojiStatus(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("UsersMessageReceiver::handleEmojiStatusHand() -- user [" + msg.userId + "," + msg.emojiStatus + "] ");
			userSession.userList.statusChange(msg.userId, msg.emojiStatus);
		}
		
		private function handleVoiceUserTalking(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			//trace(LOG + "handleVoiceUserTalking() -- user [" + +msg.voiceUserId + "," + msg.talking + "] ");
			userSession.userList.userTalkingChange(msg.voiceUserId, msg.talking);
		}
		
		private function handleUserJoinedVoice(m:Object):void {
		
		}
		
		private function handleUserSharedWebcam(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleUserSharedWebcam() -- user [" + msg.userId + "] has shared their webcam with stream [" + msg.webcamStream + "]");
			userSession.userList.userStreamChange(msg.userId, true, msg.webcamStream);
		}
		
		private function handleUserUnsharedWebcam(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleUserUnsharedWebcam() -- user [" + msg.userId + "] has unshared their webcam");
			userSession.userList.userStreamChange(msg.userId, false, msg.webcamStream);
		}
		
		private function handleUserListeningOnly(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleUserListeningOnly -- user [" + msg.userId + "] has listen only set to [" + userSession.userList.me.listenOnly + "]");
			userSession.userList.listenOnlyChange(msg.userId, userSession.userList.me.listenOnly);
		}
		
		private function handleVoiceUserMuted(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleVoiceUserMuted() -- user [" + msg.voiceUserId + ", muted: " + msg.muted + "]");
			userSession.userList.userMuteChange(msg.voiceUserId, msg.muted);
		}
		
		private function handleMeetingHasEnded(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleMeetingHasEnded() -- meeting has ended");
			userSession.logoutSignal.dispatch();
			disconnectUserSignal.dispatch(DisconnectEnum.CONNECTION_STATUS_MEETING_ENDED);
		}
		
		private function handleJoinedMeeting(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleJoinedMeeting() -- Joining meeting");
			userSession.joinMeetingResponse(msg);
		}
		
		private function handleRecordingStatusChanged(m:Object):void {
			trace(LOG + "handleRecordingStatusChanged() -- recording status changed");
			meetingData.meetingStatus.recording = m.body.recording;
		}
		
		private function handleGetRecordingStatusReply(m:Object):void {
			trace(LOG + "handleGetRecordingStatusReply() -- recording status");
			meetingData.meetingStatus.recording = m.body.recording;
		}
		
		private function handleUserJoinedVoiceConfToClientEvtMsg(msg:Object):void {
			var user:Object = msg.body as Object;
			
			// @todo : update lock value
			userSession.userList.userJoinAudio(user.intId, user.voiceUserId, user.muted, user.talking, false);
			
			// @fixme : to be used later
			meetingData.users.joinAudioConference(user.intId, user.muted);
		}
		
		private function handleUserLeftVoiceConfToClientEvtMsg(msg:Object):void {
			trace(LOG + "handleUserLeftVoiceConfToClientEvtMsg() -- user [" + msg.body.intId + "] has left the voice conference");
			
			userSession.userList.userLeaveAudio(msg.body.intId);
			
			// @fixme : to be used later
			meetingData.users.leaveAudioConference(msg.body.intId);
		}
		
		private function handleGetUsersMeetingRespMsg(msg:Object):void {
			var users:Array = msg.body.users as Array;
			
			for (var i:int; i < users.length; i++) {
				var newUser:Object = users[i];
				addUser(newUser);
			}
		}
		
		private function handleUserJoinedMeetingEvtMsg(msg:Object):void {
			addUser(msg.body);
		}
		
		private function addUser(newUser:Object):void {
			var user:User2x = new User2x();
			user.intId = newUser.intId;
			user.extId = newUser.extId;
			user.name = newUser.name;
			user.role = newUser.role;
			user.guest = newUser.guest;
			user.authed = newUser.authed;
			user.waitingForAcceptance = newUser.waitingForAcceptance;
			user.emoji = newUser.emoji;
			user.locked = newUser.locked;
			user.presenter = newUser.presenter;
			user.avatar = newUser.avatar;
			
			if (user.intId == conferenceParameters.internalUserID) {
				meetingData.users.me = user;
			}
			meetingData.users.add(user);
		}
		
		private function handleUserLeftMeetingEvtMsg(msg:Object):void {
			trace(LOG + "handleUserLeftMeetingEvtMsg() -- user [" + msg.body.intId + "] has left the meeting");
			meetingData.users.remove(msg.intId);
		}
		
		private function handleUserLockedInMeetingEvtMsg(msg:Object):void {
			trace(LOG + "handleUserLockedInMeetingEvtMsg: " + ObjectUtil.toString(msg));
			meetingData.users.changeUserLocked(msg.body.userId, msg.body.locked);
		}
		
		private function handlePresenterAssignedEvtMsg(msg:Object):void {
			trace(LOG + "handlePresenterAssignedEvtMsg() -- user [" + msg.body.presenterId + "] is now the presenter");
			meetingData.users.changePresenter(msg.body.presenterId, true);
		}
		
		private function handlePresenterUnassignedEvtMsg(msg:Object):void {
			trace(LOG + "handlePresenterUnassignedEvtMsg() -- user [" + msg.body.intId + "] is no longer the presenter");
			meetingData.users.changePresenter(msg.body.intId, false);
		}
		
		private function handleLockSettingsInMeetingChangedEvtMsg(msg:Object):void {
			trace(LOG + "handleLockSettingsInMeetingChangedEvtMsg: " + ObjectUtil.toString(msg));
			updateLockSettings(msg.body);
		}
		
		private function handleGetLockSettingsRespMsg(msg:Object):void {
			trace(LOG + "handleGetLockSettingsRespMsg: " + ObjectUtil.toString(msg));
			updateLockSettings(msg.body);
		}
		
		private function updateLockSettings(body:Object):void {
			var newLockSettings:LockSettings2x = new LockSettings2x();
			newLockSettings.disableCam = body.disableCam;
			newLockSettings.disableMic = body.disableMic;
			newLockSettings.disablePrivChat = body.disablePrivChat;
			newLockSettings.disablePubChat = body.disablePubChat;
			newLockSettings.lockedLayout = body.lockedLayout;
			newLockSettings.lockOnJoin = body.lockOnJoin;
			newLockSettings.lockOnJoinConfigurable = body.lockOnJoinConfigurable;
			meetingData.meetingStatus.changeLockSettings(newLockSettings);
		}
		
		private function handleLockSettingsNotInitializedRespMsg(msg:Object):void {
			trace(LOG + "handleLockSettingsNotInitializedRespMsg: " + ObjectUtil.toString(msg));
			trace("***** NEED TO ACTUALLY HANDLE THE LOCK INITIALIZATION *****");
		}
		
		private function handleValidateAuthTokenRespMsg(msg:Object):void {
			var tokenValid:Boolean = msg.body.valid as Boolean;
			trace(LOG + "handleValidateAuthTokenReply() valid=" + tokenValid);
			meetingData.users.me.intId = msg.body.userId;
			userSession.userId = msg.body.userId;
			userSession.authTokenSignal.dispatch(tokenValid);
		}
	}
}
