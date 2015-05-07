package org.bigbluebutton.lib.user.services {
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.commands.AuthenticationSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	public class UsersMessageReceiver implements IMessageListener {
		private const LOG:String = "UsersMessageReceiver::";
		
		public var userSession:IUserSession;
		
		public var authenticationSignal:AuthenticationSignal;
		
		public function UsersMessageReceiver() {
		}
		
		public function onMessage(messageName:String, message:Object):void {
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
					handleUserListeningOnly(message);
					break;
				case "assignPresenterCallback":
					handleAssignPresenterCallback(message);
					break;
				case "voiceUserMuted":
					handleVoiceUserMuted(message);
					break;
				case "userRaisedHand":
					handleUserRaisedHand(message);
					break;
				case "userLoweredHand":
					handleUserLoweredHand(message);
					break;
				case "recordingStatusChanged":
					handleRecordingStatusChanged(message);
					break;
				case "joinMeetingReply":
					handleJoinedMeeting(message);
					break;
				case "getUsersReply":
					handleGetUsersReply(message);
					break;
				case "getRecordingStatusReply":
					handleGetRecordingStatusReply(message);
					break;
				case "meetingHasEnded":
					handleMeetingHasEnded(message);
					break;
				case "meetingEnded":
					handleLogout(message);
					break;
				case "validateAuthTokenTimedOut":
					handleValidateAuthTokenTimedOut(message);
					break;
				case "validateAuthTokenReply":
					handleValidateAuthTokenReply(message);
					break;
				default:
					break;
			}
		}
		
		private function handleVoiceUserTalking(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleVoiceUserTalking() -- user [" + +msg.voiceUserId + "," + msg.talking + "] ");
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
			var user:User = new User();
			user.hasStream = newUser.hasStream;
			user.streamName = newUser.webcamStream;
			user.locked = newUser.locked;
			user.name = newUser.name;
			user.phoneUser = newUser.phoneUser;
			user.presenter = newUser.presenter;
			user.raiseHand = newUser.raiseHand;
			user.role = newUser.role;
			user.userID = newUser.userId;
			user.voiceJoined = newUser.voiceUser.joined;
			user.voiceUserId = newUser.voiceUser.userId;
			user.isLeavingFlag = false;
			user.listenOnly = newUser.listenOnly;
			user.muted = newUser.voiceUser.muted;
			userSession.userList.addUser(user);
			// The following properties are 'special', in that they have view changes associated with them.
			// The UserList changes the model appropriately, then dispatches a signal to the views.
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
			trace(LOG + "handleUserJoinedVoice() -- user [" + msg.user.externUserID + "] has joined voice with voiceId [" + voiceUser.userId + "]");
			userSession.userList.userJoinAudio(msg.user.externUserID, voiceUser.userId, voiceUser.muted, voiceUser.talking, voiceUser.locked);
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
			userSession.userList.userStreamChange(msg.userId, false, "");
		}
		
		private function handleUserListeningOnly(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			//It seems that listenOnly keeps to be true
			//Temp solution to set listenOnly to false when user drop listen only mode.
			trace(LOG + "handleUserListeningOnly -- user [" + msg.userId + "] has listen only set to [" + !userSession.userList.me.listenOnly + "]");
			userSession.userList.listenOnlyChange(msg.userId, !userSession.userList.me.listenOnly);
		}
		
		private function handleVoiceUserMuted(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleVoiceUserMuted() -- user [" + msg.voiceUserId + ", muted: " + msg.muted + "]");
			userSession.userList.userMuteChange(msg.voiceUserId, msg.muted);
		}
		
		private function handleUserRaisedHand(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleUserRaisedHand() -- user [" + msg.userId + "]'s hand was raised");
			userSession.userList.raiseHandChange(msg.userId, true);
		}
		
		private function handleUserLoweredHand(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleUserLoweredHand() -- user [" + msg.userId + "]'s hand was lowered");
			userSession.userList.raiseHandChange(msg.userId, false);
		}
		
		private function handleMeetingHasEnded(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleMeetingHasEnded() -- meeting has ended");
			userSession.logoutSignal.dispatch();
		}
		
		private function handleLogout(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleLogout() -- logging out!");
			userSession.logoutSignal.dispatch();
		}
		
		private function handleJoinedMeeting(m:Object):void {
			var msg:Object = JSON.parse(m.msg);
			trace(LOG + "handleJoinedMeeting()");
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
			}
		}
	}
}