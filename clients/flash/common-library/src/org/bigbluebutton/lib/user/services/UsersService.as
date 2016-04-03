package org.bigbluebutton.lib.user.services {
	
	import org.bigbluebutton.lib.common.models.IMessageListener;
	import org.bigbluebutton.lib.main.commands.AuthenticationSignal;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	public class UsersService implements IUsersService {
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var authenticationSignal:AuthenticationSignal;
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		public var usersMessageSender:UsersMessageSender;
		
		public var usersMessageReceiver:UsersMessageReceiver;
		
		public function UsersService() {
			usersMessageSender = new UsersMessageSender;
			usersMessageReceiver = new UsersMessageReceiver;
		}
		
		public function setupMessageSenderReceiver():void {
			usersMessageReceiver.userSession = userSession;
			usersMessageReceiver.authenticationSignal = authenticationSignal;
			usersMessageReceiver.disconnectUserSignal = disconnectUserSignal;
			usersMessageSender.userSession = userSession;
			userSession.mainConnection.addMessageListener(usersMessageReceiver as IMessageListener);
			userSession.logoutSignal.add(logout);
		}
		
		public function muteMe():void {
			mute(userSession.userList.me);
		}
		
		public function unmuteMe():void {
			unmute(userSession.userList.me);
		}
		
		public function mute(user:User):void {
			muteUnmute(user, true);
		}
		
		public function unmute(user:User):void {
			muteUnmute(user, false);
		}
		
		private function muteUnmute(user:User, mute:Boolean):void {
			if (user.voiceJoined) {
				usersMessageSender.muteUnmuteUser(user.userID, mute);
			}
		}
		
		public function addStream(userId:String, streamName:String):void {
			usersMessageSender.addStream(userId, streamName);
		}
		
		public function removeStream(userId:String, streamName:String):void {
			usersMessageSender.removeStream(userId, streamName);
		}
		
		public function logout():void {
			userSession.logoutSignal.remove(logout);
			disconnect(true);
		}
		
		public function disconnect(onUserAction:Boolean):void {
			userSession.mainConnection.disconnect(onUserAction);
		}
		
		public function changeMood(mood:String):void {
			usersMessageSender.changeMood(userSession.userList.me.userID, mood);
			if (mood == User.RAISE_HAND) {
				usersMessageSender.raiseHand();
			} else if (mood == User.NO_STATUS) {
				usersMessageSender.lowerHand(userSession.userList.me.userID, userSession.userList.me.userID);
			}
		}
		
		public function clearUserStatus(userID:String):void {
			usersMessageSender.changeMood(userID, User.NO_STATUS);
		}
		
		public function kickUser(userID:String):void {
			usersMessageSender.kickUser(userID);
		}
		
		public function queryForParticipants():void {
			usersMessageSender.queryForParticipants();
		}
		
		public function assignPresenter(userid:String, name:String, assignedBy:String):void {
			usersMessageSender.assignPresenter(userid, name, assignedBy);
		}
		
		public function queryForRecordingStatus():void {
			usersMessageSender.queryForRecordingStatus();
		}
		
		public function changeRecordingStatus(userID:String, recording:Boolean):void {
			usersMessageSender.changeRecordingStatus(userID, recording);
		}
		
		public function muteAllUsers(mute:Boolean):void {
			usersMessageSender.muteAllUsers(mute);
		}
		
		public function muteAllUsersExceptPresenter(mute:Boolean):void {
			usersMessageSender.muteAllUsersExceptPresenter(mute);
		}
		
		public function muteUnmuteUser(userid:String, mute:Boolean):void {
			usersMessageSender.muteUnmuteUser(userid, mute);
		}
		
		public function ejectUser(userid:String):void {
			usersMessageSender.ejectUser(userid);
		}
		
		public function getRoomMuteState():void {
			usersMessageSender.getRoomMuteState();
		}
		
		public function getRoomLockState():void {
			usersMessageSender.getRoomLockState();
		}
		
		public function setAllUsersLock(lock:Boolean, except:Array = null):void {
			usersMessageSender.setAllUsersLock(lock, except);
		}
		
		public function setUserLock(internalUserID:String, lock:Boolean):void {
			usersMessageSender.setUserLock(internalUserID, lock);
		}
		
		public function getLockSettings():void {
			usersMessageSender.getLockSettings();
		}
		
		public function saveLockSettings(newLockSettings:Object):void {
			usersMessageSender.saveLockSettings(newLockSettings);
		}
		
		public function sendJoinMeetingMessage():void {
			usersMessageSender.sendJoinMeetingMessage(conferenceParameters.internalUserID);
		}
		
		public function getGuestPolicy():void {
			usersMessageSender.getGuestPolicy();
		}
		
		public function responseToGuest(userId:String, response:Boolean):void {
			usersMessageSender.responseToGuest(userId, response);
		}
		
		public function lowerHand(userID:String, loweredBy:String):void {
			usersMessageSender.lowerHand(userID, loweredBy);
		}
		
		public function responseToAllGuests(response:Boolean):void {
			usersMessageSender.responseToAllGuests(response);
		}
		
		public function validateToken():void {
			usersMessageSender.validateToken(conferenceParameters.internalUserID, conferenceParameters.authToken);
		}
		
		public function changeRole(userID:String, role:String):void {
			usersMessageSender.changeRole(userID, role)
		}
	}
}
