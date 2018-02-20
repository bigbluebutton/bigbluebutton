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
	import org.bigbluebutton.lib.video.models.WebcamStreamInfo;
	
	public class UsersMessageReceiver implements IMessageListener {
		private const LOG:String = "UsersMessageReceiver::";
		
		private const flashWebcamPattern:RegExp = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9]+)(-recorded)?$/;
		
		public var userSession:IUserSession;
		
		public var meetingData:IMeetingData;
		
		public var conferenceParameters:IConferenceParameters;
		
		public var disconnectUserSignal:DisconnectUserSignal;
		
		public function UsersMessageReceiver() {
		}
		
		public function onMessage(messageName:String, message:Object):void {
			switch (messageName) {
				case "recordingStatusChanged":
					handleRecordingStatusChanged(message);
					break;
				case "joinMeetingReply":
					handleJoinedMeeting(message);
					break
				case "getRecordingStatusReply":
					handleGetRecordingStatusReply(message);
					break;
				case "meetingHasEnded":
				case "meetingEnded":
					handleMeetingHasEnded(message);
					break;
				case "meetingState":
					handleMeetingState(message);
					break;
				case "meetingMuted":
					handleMeetingMuted(message);
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
				case "GetWebcamStreamsMeetingRespMsg":
					handleGetWebcamStreamsMeetingRespMsg(message);
					break;
				case "UserBroadcastCamStartedEvtMsg":
					handleUserBroadcastCamStartedEvtMsg(message);
					break;
				case "UserBroadcastCamStoppedEvtMsg":
					handleUserBroadcastCamStoppedEvtMsg(message);
					break;
				case "UserEmojiChangedEvtMsg":
					handleUserEmojiChangedEvtMsg(message);
					break;
				case "UserRoleChangedEvtMsg":
					handleUserRoleChangedEvtMsg(message);
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
			userSession.userId = msg.body.userId;
			userSession.authTokenSignal.dispatch(tokenValid);
		}
		
		private function handleGetWebcamStreamsMeetingRespMsg(msg:Object):void {
			var body:Object = msg.body as Object
			var streams:Array = body.streams as Array;
			trace("Num streams = " + streams.length);
			
			for (var i:int = 0; i < streams.length; i++) {
				var stream:Object = streams[i] as Object;
				var streamId:String = stream.streamId as String;
				var media:Object = stream.stream as Object;
				var url:String = media.url as String;
				var userId:String = media.userId as String;
				var attributes:Object = media.attributes as Object;
				var viewers:Array = media.viewers as Array;
				
				
				if (isValidFlashWebcamStream(streamId)) {
					var user:User2x = meetingData.users.getUser(userId);
					if (user) {
						var webcamStream:WebcamStreamInfo = new WebcamStreamInfo(streamId, userId, user.name);
						webcamStream.streamId = streamId;
						webcamStream.userId = userId;
						
						trace("STREAM = " + JSON.stringify(webcamStream));
						meetingData.webcams.add(webcamStream);
					}
				}
			}
		}
		
		private function handleUserBroadcastCamStartedEvtMsg(msg:Object):void {
			var userId:String = msg.body.userId as String;
			var streamId:String = msg.body.stream as String;
			
			if (isValidFlashWebcamStream(streamId)) {
				var user:User2x = meetingData.users.getUser(userId);
				if (user) {
					var webcamStream:WebcamStreamInfo = new WebcamStreamInfo(streamId, userId, user.name)
					meetingData.webcams.add(webcamStream);
				}
			}
		}
		
		private function isValidFlashWebcamStream(streamId:String):Boolean {
			return flashWebcamPattern.test(streamId);
		}
		
		private function handleUserBroadcastCamStoppedEvtMsg(msg:Object):void {
			var userId:String = msg.body.userId as String;
			var stream:String = msg.body.stream as String;
			
			meetingData.webcams.remove(stream);
		}
		
		private function handleUserEmojiChangedEvtMsg(msg:Object):void {
			var userId:String = msg.body.userId as String;
			var emoji:String = msg.body.emoji as String;
			
			meetingData.users.changeUserStatus(userId, emoji);
		}
		
		public function handleUserRoleChangedEvtMsg(msg:Object):void {
			var userId: String = msg.body.userId as String;
			var role: String = msg.body.role as String;
			
			meetingData.users.changeUserRole(userId, role);
		}
	}
}
