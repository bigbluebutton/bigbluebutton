package org.bigbluebutton.air.user.views {
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.LockSettings2x;
	import org.bigbluebutton.air.user.events.UserItemSelectedEvent;
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.user.models.UserChangeEnum;
	import org.bigbluebutton.air.user.views.models.UsersVMCollection;
	import org.bigbluebutton.air.video.models.WebcamChangeEnum;
	import org.bigbluebutton.air.video.models.WebcamStreamInfo;
	import org.bigbluebutton.air.voice.models.VoiceUser;
	import org.bigbluebutton.air.voice.models.VoiceUserChangeEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UsersViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:UsersViewBase;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Bindable]
		private var _userCollection:UsersVMCollection;
		
		override public function initialize():void {
			initializeUserCollection();
			view.userList.dataProvider = _userCollection;
			
			meetingData.users.userChangeSignal.add(onUserChange);
			meetingData.meetingStatus.lockSettingsChangeSignal.add(onLockSettingsChange);
			meetingData.voiceUsers.userChangeSignal.add(onVoiceUserChange);
			meetingData.webcams.webcamChangeSignal.add(onWebcamChange);
			
			view.userList.addEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
		}
		
		private function initializeUserCollection():void {
			_userCollection = new UsersVMCollection();
			_userCollection.setRoomLockState(meetingData.meetingStatus.lockSettings.isRoomLocked());
			_userCollection.addUsers(meetingData.users.getUsers());
			_userCollection.addVoiceUsers(meetingData.voiceUsers.getAll());
			_userCollection.addWebcams(meetingData.webcams.getAll());
			
			_userCollection.refresh();
		}
		
		private function onUserChange(user:User2x, property:int):void {
			switch (property) {
				case UserChangeEnum.JOIN:
					_userCollection.addUser(user);
					break;
				case UserChangeEnum.LEAVE:
					_userCollection.removeUser(user);
					break;
				case UserChangeEnum.ROLE:
					_userCollection.updateRole(user);
					break;
				case UserChangeEnum.PRESENTER:
					_userCollection.updatePresenter(user);
					break;
				case UserChangeEnum.LOCKED:
					_userCollection.updateUserLock(user);
					break;
				case UserChangeEnum.EMOJI:
					_userCollection.updateEmoji(user);
					break;
			}
		}
		
		private function onLockSettingsChange(newLockSettings:LockSettings2x):void {
			_userCollection.setRoomLockState(newLockSettings.isRoomLocked());
		}
		
		private function onVoiceUserChange(voiceUser:VoiceUser, enum:int):void {
			switch (enum) {
				case VoiceUserChangeEnum.JOIN:
					_userCollection.addVoiceUser(voiceUser);
					break;
				case VoiceUserChangeEnum.LEAVE:
					_userCollection.removeVoiceUser(voiceUser);
					break;
				case VoiceUserChangeEnum.MUTE:
					_userCollection.updateMute(voiceUser);
					break;
				case VoiceUserChangeEnum.TALKING:
					_userCollection.updateTalking(voiceUser);
					break;
			}
		}
		
		private function onWebcamChange(webcam:WebcamStreamInfo, enum:int):void {
			switch (enum) {
				case WebcamChangeEnum.ADD:
					_userCollection.addWebcam(webcam);
					break
				case WebcamChangeEnum.REMOVE:
					_userCollection.removeWebcam(webcam);
					break;
			}
		}
		
		protected function onUserItemSelected(e:UserItemSelectedEvent):void {
			// leave the implementation to the specific client
		}
		
		override public function destroy():void {
			meetingData.users.userChangeSignal.remove(onUserChange);
			meetingData.meetingStatus.lockSettingsChangeSignal.remove(onLockSettingsChange);
			meetingData.voiceUsers.userChangeSignal.remove(onVoiceUserChange);
			meetingData.webcams.webcamChangeSignal.remove(onWebcamChange);
			
			view.userList.removeEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
			
			super.destroy();
			view = null;
		}
	}
}
