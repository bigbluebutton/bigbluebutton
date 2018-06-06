package org.bigbluebutton.air.user.views {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.chat.commands.StartPrivateChatSignal;
	import org.bigbluebutton.air.main.commands.ChangeUserRoleSignal;
	import org.bigbluebutton.air.main.commands.ClearUserStatusSignal;
	import org.bigbluebutton.air.main.commands.KickUserSignal;
	import org.bigbluebutton.air.main.commands.LockUserSignal;
	import org.bigbluebutton.air.main.commands.PresenterSignal;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.LockSettings2x;
	import org.bigbluebutton.air.user.models.User2x;
	import org.bigbluebutton.air.user.models.UserChangeEnum;
	import org.bigbluebutton.air.user.models.UserRole;
	import org.bigbluebutton.air.user.views.models.UserDetailsVM;
	import org.bigbluebutton.air.voice.commands.MicrophoneMuteSignal;
	import org.bigbluebutton.air.voice.models.VoiceUser;
	import org.bigbluebutton.air.voice.models.VoiceUserChangeEnum;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UserDetailsViewMediator extends Mediator {
		
		[Inject]
		public var view:UserDetailsView;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var userUISession:IUISession;
		
		[Inject]
		public var startPrivateChatSignal:StartPrivateChatSignal;
		
		[Inject]
		public var clearUserStatusSignal:ClearUserStatusSignal;
		
		[Inject]
		public var presenterSignal:PresenterSignal;
		
		[Inject]
		public var lockUserSignal:LockUserSignal;
		
		[Inject]
		public var changeUserRoleSignal:ChangeUserRoleSignal;
		
		[Inject]
		public var microphoneMuteSignal:MicrophoneMuteSignal;
		
		[Inject]
		public var kickUserSignal:KickUserSignal;
		
		protected var _user:User2x;
		
		protected var _viewModel:UserDetailsVM;
		
		override public function initialize():void {
			var selectedUserId:String = userUISession.currentPageDetails as String;
			meetingData.users.userChangeSignal.add(onUserChanged);
			meetingData.voiceUsers.userChangeSignal.add(onVoiceUserChange);
			_user = meetingData.users.getUser(selectedUserId);
			
			_viewModel = new UserDetailsVM();
			_viewModel.userName = _user.name;
			_viewModel.userModerator = _user.role == UserRole.MODERATOR;
			_viewModel.userPresenter = _user.presenter;
			_viewModel.userEmoji = _user.emoji;
			_viewModel.userLocked = _user.locked;
			
			var _voiceUser:VoiceUser = meetingData.voiceUsers.getUser(_user.intId);
			_viewModel.userVoiceJoined = _voiceUser != null;
			_viewModel.userMuted = _voiceUser != null && _voiceUser.muted;
			// user webcam, voicejoined, muted
			_viewModel.amIModerator = meetingData.users.me.role == UserRole.MODERATOR;
			_viewModel.me = _user.intId == meetingData.users.me.intId;
			_viewModel.roomLocked = meetingData.meetingStatus.lockSettings.isRoomLocked();
			view.setViewModel(_viewModel);
			view.update();
			
			meetingData.meetingStatus.lockSettingsChangeSignal.add(onLockSettingsChange);
			view.showCameraButton.addEventListener(MouseEvent.CLICK, onShowCameraButton);
			view.privateChatButton.addEventListener(MouseEvent.CLICK, onShowPrivateChatButton);
			view.clearStatusButton.addEventListener(MouseEvent.CLICK, onClearStatusButton);
			view.makePresenterButton.addEventListener(MouseEvent.CLICK, onMakePresenterButton);
			view.promoteButton.addEventListener(MouseEvent.CLICK, onPromoteButton);
			view.demoteButton.addEventListener(MouseEvent.CLICK, onDemoteButton);
			view.kickButton.addEventListener(MouseEvent.CLICK, onKickButton);
			view.lockButton.addEventListener(MouseEvent.CLICK, onLockButton);
			view.muteButton.addEventListener(MouseEvent.CLICK, onMuteUser);
			view.unmuteButton.addEventListener(MouseEvent.CLICK, onUnmuteUser);
			view.unlockButton.addEventListener(MouseEvent.CLICK, onUnlockUser);
		}
		
		protected function onLockButton(event:MouseEvent):void {
			//dispatch lock signal
			lockUserSignal.dispatch(_user.intId, true);
			userUISession.popPage();
		}
		
		protected function onUnlockUser(event:MouseEvent):void {
			//dispatch lock signal
			lockUserSignal.dispatch(_user.intId, false);
			userUISession.popPage();
		}
		
		protected function onMuteUser(event:MouseEvent):void {
			microphoneMuteSignal.dispatch(_user.intId);
			userUISession.popPage();
		}
		
		protected function onUnmuteUser(event:MouseEvent):void {
			microphoneMuteSignal.dispatch(_user.intId);
			userUISession.popPage();
		}
		
		protected function onShowCameraButton(event:MouseEvent):void {
			trace("onShowCameraButton clicked - Implementation missing");
			//userUISession.pushPage(PageEnum.VIDEO_CHAT, _user, TransitionAnimationEnum.APPEAR);
		}
		
		protected function onShowPrivateChatButton(event:MouseEvent):void {
			startPrivateChatSignal.dispatch(_user.intId);
			userUISession.popPage();
		}
		
		protected function onClearStatusButton(event:MouseEvent):void {
			clearUserStatusSignal.dispatch(_user.intId);
			view.clearStatusButton.includeInLayout = false;
			view.clearStatusButton.visible = false;
			userUISession.popPage();
		}
		
		protected function onMakePresenterButton(event:MouseEvent):void {
			presenterSignal.dispatch(_user);
			userUISession.popPage();
		}
		
		protected function onPromoteButton(event:MouseEvent):void {
			changeUserRoleSignal.dispatch(_user, UserRole.MODERATOR);
			userUISession.popPage();
		}
		
		protected function onDemoteButton(event:MouseEvent):void {
			changeUserRoleSignal.dispatch(_user, UserRole.VIEWER);
			userUISession.popPage();
		}
		
		protected function onKickButton(event:MouseEvent):void {
			kickUserSignal.dispatch(_user);
		}
		
		private function onUserChanged(user:User2x, prop:int):void {
			if (_user.intId == user.intId) {
				switch (prop) {
					case UserChangeEnum.LEAVE:
						userUISession.popPage();
						break;
					case UserChangeEnum.EMOJI:
						_viewModel.userEmoji = user.emoji;
						view.update();
						break;
					case UserChangeEnum.LOCKED:
						_viewModel.userLocked = user.locked;
						view.update();
						break;
					case UserChangeEnum.PRESENTER:
						_viewModel.userPresenter = user.presenter;
						view.update();
						break;
					case UserChangeEnum.ROLE:
						_viewModel.userModerator = user.role == UserRole.MODERATOR;
						view.update();
						break;
				}
			} else if (_user.intId == meetingData.users.me.intId) {
				if (prop == UserChangeEnum.ROLE) {
					_viewModel.amIModerator = user.role == UserRole.MODERATOR;
					view.update();
				}
			}
		}
		
		private function onVoiceUserChange(voiceUser:VoiceUser, enum:int):void {
			switch (enum) {
				case VoiceUserChangeEnum.JOIN:
					_viewModel.userVoiceJoined = true;
					view.update();
					break;
				case VoiceUserChangeEnum.LEAVE:
					_viewModel.userVoiceJoined = false;
					_viewModel.userMuted = true;
					view.update();
					break;
				case VoiceUserChangeEnum.MUTE:
					_viewModel.userMuted = voiceUser.muted;
					view.update();
					break;
				default:
					break;
			}
		}
		
		private function onLockSettingsChange(lockSettings:LockSettings2x):void {
			_viewModel.roomLocked = lockSettings.isRoomLocked();
			view.update();
		}
		
		override public function destroy():void {
			super.destroy();
			
			view.clearStatusButton.removeEventListener(MouseEvent.CLICK, onClearStatusButton);
			view.makePresenterButton.removeEventListener(MouseEvent.CLICK, onMakePresenterButton);
			view.lockButton.removeEventListener(MouseEvent.CLICK, onLockButton);
			view.unlockButton.removeEventListener(MouseEvent.CLICK, onUnlockUser);
			view.showCameraButton.removeEventListener(MouseEvent.CLICK, onShowCameraButton);
			view.privateChatButton.removeEventListener(MouseEvent.CLICK, onShowPrivateChatButton);
			view.promoteButton.removeEventListener(MouseEvent.CLICK, onPromoteButton);
			view.demoteButton.removeEventListener(MouseEvent.CLICK, onDemoteButton);
			view.kickButton.removeEventListener(MouseEvent.CLICK, onKickButton);
			view.muteButton.removeEventListener(MouseEvent.CLICK, onMuteUser);
			view.unmuteButton.removeEventListener(MouseEvent.CLICK, onUnmuteUser);
			meetingData.users.userChangeSignal.remove(onUserChanged);
			meetingData.voiceUsers.userChangeSignal.remove(onVoiceUserChange);
			meetingData.meetingStatus.lockSettingsChangeSignal.remove(onLockSettingsChange);
			view = null;
		}
	}
}
