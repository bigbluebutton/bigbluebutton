package org.bigbluebutton.air.user.services {
	
	import org.bigbluebutton.air.chat.models.IChatMessagesSession;
	import org.bigbluebutton.air.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.user.models.EmojiStatus;
	
	public class UsersService implements IUsersService {
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
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
			usersMessageReceiver.meetingData = meetingData;
			usersMessageReceiver.chatMessagesSession = chatMessagesSession;
			usersMessageReceiver.conferenceParameters = conferenceParameters;
			usersMessageReceiver.disconnectUserSignal = disconnectUserSignal;
			usersMessageSender.userSession = userSession;
			usersMessageSender.conferenceParameters = conferenceParameters;
			userSession.mainConnection.addMessageListener(usersMessageReceiver);
			userSession.logoutSignal.add(logout);
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
		
		public function emojiStatus(userId:String, status:String):void {
			usersMessageSender.emojiStatus(userId, status);
		}
		
		public function clearUserStatus(userId:String):void {
			usersMessageSender.emojiStatus(userId, EmojiStatus.NO_STATUS);
		}
		
		public function kickUser(userId:String):void {
			usersMessageSender.kickUser(userId);
		}
		
		public function queryForParticipants():void {
			usersMessageSender.queryForParticipants();
		}
		
		public function assignPresenter(userId:String, name:String):void {
			usersMessageSender.assignPresenter(userId, name, meetingData.users.me.intId);
		}
		
		public function queryForRecordingStatus():void {
			usersMessageSender.queryForRecordingStatus();
		}
		
		public function changeRecordingStatus(userId:String, recording:Boolean):void {
			usersMessageSender.changeRecordingStatus(userId, recording);
		}
		
		public function muteAllUsers(mute:Boolean):void {
			usersMessageSender.muteAllUsers(mute);
		}
		
		public function muteAllUsersExceptPresenter(mute:Boolean):void {
			usersMessageSender.muteAllUsersExceptPresenter(mute);
		}
		
		public function ejectUser(userId:String):void {
			usersMessageSender.ejectUser(userId);
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
		
		public function setUserLock(internalUserId:String, lock:Boolean):void {
			usersMessageSender.setUserLock(internalUserId, lock);
		}
		
		public function getLockSettings():void {
			usersMessageSender.getLockSettings();
		}
		
		public function saveLockSettings(newLockSettings:Object):void {
			usersMessageSender.saveLockSettings(newLockSettings);
		}
		
		public function validateToken():void {
			usersMessageSender.validateToken(conferenceParameters.internalUserID, conferenceParameters.authToken);
		}
		
		public function joinMeeting():void {
			usersMessageSender.joinMeeting();
		}
		
		public function changeRole(userId:String, role:String):void {
			usersMessageSender.changeRole(userId, role);
		}
	}
}
