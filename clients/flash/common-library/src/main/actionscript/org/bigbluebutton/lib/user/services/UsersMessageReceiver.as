package org.bigbluebutton.lib.user.services {
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.commands.AuthenticationSignal;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.user.models.User;
	
	public class UsersMessageReceiver implements IMessageListener {
		private const LOG:String = "UsersMessageReceiver::";
		
		public var userSession:IUserSession;
		
		public var authenticationSignal:AuthenticationSignal;
		
		public var disconnectUserSignal:DisconnectUserSignal;
		
		private var lastSipEvent:Object = null;
		
		public function UsersMessageReceiver() {
		}
		
		public function onMessage(messageName:String, message:Object):void {
			trace(LOG + "RECEIVED MESSAGE: [" + messageName + "]");
			switch (messageName) {
				case "voiceUserTalking":
					handleVoiceUserTalking(message);
					break;
				case "participantJoined":
					handleParticipantJoined(message);
					break;
				case "participantLeft":
					handleParticipantLeft(message);
					break;
				case "userJoinedVoice":
					handleUserJoinedVoice(message);
					break;
				case "userLeftVoice":
					handleUserLeftVoice(message);
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
				case "assignPresenterCallback":
					handleAssignPresenterCallback(message);
					break;
				case "voiceUserMuted":
					handleVoiceUserMuted(message);
					break;
				case "recordingStatusChanged":
					handleRecordingStatusChanged(message);
					break;
				case "joinMeetingReply":
					handleJoinedMeeting(message);
					break
				case "getUsersReply":
					handleGetUsersReply(message);
					break;
				case "getRecordingStatusReply":
					handleGetRecordingStatusReply(message);
					break;
				case "meetingHasEnded":
				case "meetingEnded":
					handleMeetingHasEnded(message);
					break;
				case "userEmojiStatus":
					handleEmojiStatus(message);
					break;
				case "validateAuthTokenTimedOut":
					handleValidateAuthTokenTimedOut(message);
					break;
				case "validateAuthTokenReply":
					handleValidateAuthTokenReply(message);
					break;
				case "meetingState":
					handleMeetingState(message);
					break;
				case "permissionsSettingsChanged":
					handlePermissionsSettingsChanged(message);
					break;
				case "meetingMuted":
					handleMeetingMuted(message);
					break;
				case "userLocked":
					handleUserLocked(message);
					break;
				default:
					break;
			}
		}
		
		private function handleUserLocked(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("handleUserLocked: " + ObjectUtil.toString(msg));
			trace("your id: " + userSession.userList.me.userId);
			var user:User = userSession.userList.getUserByUserId(msg.user);
			user.locked = msg.lock;
			if (userSession.userList.me.userId == msg.user) {
				userSession.dispatchLockSettings();
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
		
		private function handlePermissionsSettingsChanged(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace("permissionsSettingsChanged: " + ObjectUtil.toString(msg));
			updateLockSettings(msg);
		}
		
		private function updateLockSettings(msg:Object):void {
			userSession.lockSettings.disableCam = msg.disableCam;
			userSession.lockSettings.disableMic = msg.disableMic;
			// bbb 1.0 compatibility: different variable names
			userSession.lockSettings.disablePrivateChat = msg.hasOwnProperty("disablePrivChat") ? msg.disablePrivChat : msg.disablePrivateChat;
			userSession.lockSettings.disablePublicChat = msg.hasOwnProperty("disablePubChat") ? msg.disablePubChat : msg.disablePublicChat;
			userSession.lockSettings.lockedLayout = msg.lockedLayout;
			userSession.lockSettings.lockOnJoin = msg.lockOnJoin;
			userSession.lockSettings.lockOnJoinConfigurable = msg.lockOnJoinConfigurable;
			userSession.dispatchLockSettings();
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
		
		private function handleGetUsersReply(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			for (var i:int; i < msg.users.length; i++) {
				var newUser:Object = msg.users[i];
				addParticipant(newUser);
			}
			userSession.userList.allUsersAddedSignal.dispatch();
		}
		
		private function handleParticipantJoined(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			var newUser:Object = msg.user;
			addParticipant(newUser);
		}
		
		private function addParticipant(newUser:Object):void {
			var user:User = new User;
			user.hasStream = newUser.hasStream;
			user.streamName = newUser.webcamStream;
			user.locked = newUser.locked;
			user.name = newUser.name;
			user.phoneUser = newUser.phoneUser;
			user.presenter = newUser.presenter;
			user.role = newUser.role;
			user.userId = newUser.userId;
			user.voiceJoined = newUser.voiceUser.joined;
			user.voiceUserId = newUser.voiceUser.userId;
			user.isLeavingFlag = false;
			user.listenOnly = newUser.listenOnly;
			user.muted = newUser.voiceUser.muted;
			user.status = newUser.status;
			userSession.userList.addUser(user);
		}
		
		private function handleParticipantLeft(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleParticipantLeft() -- user [" + msg.user.userId + "] has left the meeting");
			userSession.userList.removeUser(msg.user.userId);
		}
		
		private function handleAssignPresenterCallback(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleAssignPresenterCallback() -- user [" + msg.newPresenterID + "] is now the presenter");
			userSession.userList.assignPresenter(msg.newPresenterID);
		}
		
		private function handleUserJoinedVoice(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			var voiceUser:Object = msg.user.voiceUser;
			trace(LOG + "handleUserJoinedVoice() -- user [" + msg.user.userId + "] has joined voice with voiceId [" + voiceUser.userId + "]");
			userSession.userList.userJoinAudio(msg.user.userId, voiceUser.userId, voiceUser.muted, voiceUser.talking, voiceUser.locked);
		}
		
		private function handleUserLeftVoice(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleUserLeftVoice() -- user [" + msg.user.userId + "] has left voice");
			userSession.userList.userLeaveAudio(msg.user.userId);
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
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleRecordingStatusChanged() -- recording status changed");
			userSession.recordingStatusChanged(msg.recording);
		}
		
		private function handleGetRecordingStatusReply(m:Object):void {
			trace(LOG + "handleGetRecordingStatusReply() -- recording status");
			var msg:Object = JSON.parse(m.msg);
			userSession.recordingStatusChanged(msg.recording);
		}
		
		private function handleValidateAuthTokenTimedOut(msg:Object):void {
			trace(LOG + "handleValidateAuthTokenTimedOut() " + msg.msg);
			authenticationSignal.dispatch("timedOut");
		}
		
		private function handleValidateAuthTokenReply(msg:Object):void {
			trace(LOG + "*** handleValidateAuthTokenReply " + msg.msg);
			var map:Object = JSON.parse(msg.msg);
			var tokenValid:Boolean = map.valid as Boolean;
			var userId:String = map.userId as String;
			trace(LOG + "handleValidateAuthTokenReply() valid=" + tokenValid);
			if (!tokenValid) {
				authenticationSignal.dispatch("invalid");
			} else {
				// why 2 different signals for authentication??  
				//userUISession.loading = false; in authentication command can break order of functions
				trace(LOG + "got here!");
				if (userSession == null)
					trace(LOG + "User Session is NULL!!!!");
				userSession.authTokenSignal.dispatch(true);
			}
		}
	}
}
