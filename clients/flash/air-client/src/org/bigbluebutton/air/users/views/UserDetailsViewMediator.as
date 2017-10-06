package org.bigbluebutton.air.users.views {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.common.TransitionAnimationEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.users.views.models.UserDetailsVM;
	import org.bigbluebutton.lib.main.commands.ClearUserStatusSignal;
	import org.bigbluebutton.lib.main.commands.LockUserSignal;
	import org.bigbluebutton.lib.main.commands.PresenterSignal;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.LockSettings2x;
	import org.bigbluebutton.lib.user.models.User2x;
	import org.bigbluebutton.lib.user.models.UserChangeEnum;
	import org.bigbluebutton.lib.user.models.UserRole;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UserDetailsViewMediator extends Mediator {
		
		[Inject]
		public var view:UserDetailsView;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var userUISession:IUISession;
		
		[Inject]
		public var clearUserStatusSignal:ClearUserStatusSignal;
		
		[Inject]
		public var presenterSignal:PresenterSignal;
		
		[Inject]
		public var lockUserSignal:LockUserSignal;
		
		protected var _user:User2x;
		
		protected var _viewModel:UserDetailsVM;
		
		override public function initialize():void {
			var selectedUserId:String = userUISession.currentPageDetails as String;
			meetingData.users.userChangeSignal.add(onUserChanged);
			_user = meetingData.users.getUser(selectedUserId);
			
			_viewModel = new UserDetailsVM();
			_viewModel.userName = _user.name;
			_viewModel.userModerator = _user.role == UserRole.MODERATOR;
			_viewModel.userPresenter = _user.presenter;
			_viewModel.userEmoji = _user.emoji;
			_viewModel.userLocked = _user.locked;
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
			view.lockButton.addEventListener(MouseEvent.CLICK, onLockUser);
			view.unlockButton.addEventListener(MouseEvent.CLICK, onUnlockUser);
		}
		
		protected function onLockUser(event:MouseEvent):void {
			//dispatch lock signal
			lockUserSignal.dispatch(_user.intId, true);
			userUISession.popPage();
		}
		
		protected function onUnlockUser(event:MouseEvent):void {
			//dispatch lock signal
			lockUserSignal.dispatch(_user.intId, false);
			userUISession.popPage();
		}
		
		protected function onShowCameraButton(event:MouseEvent):void {
			trace("onShowCameraButton clicked - Implementation missing");
			//userUISession.pushPage(PageEnum.VIDEO_CHAT, _user, TransitionAnimationEnum.APPEAR);
		}
		
		protected function onShowPrivateChatButton(event:MouseEvent):void {
			userUISession.pushPage(PageEnum.CHAT, {publicChat: false, intId: _user.intId}, TransitionAnimationEnum.APPEAR);
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
		
		private function onLockSettingsChange(lockSettings:LockSettings2x):void {
			_viewModel.roomLocked = lockSettings.isRoomLocked();
			view.update();
		}
		
		override public function destroy():void {
			super.destroy();
			view.clearStatusButton.removeEventListener(MouseEvent.CLICK, onClearStatusButton);
			view.makePresenterButton.removeEventListener(MouseEvent.CLICK, onMakePresenterButton);
			view.lockButton.removeEventListener(MouseEvent.CLICK, onLockUser);
			view.unlockButton.removeEventListener(MouseEvent.CLICK, onUnlockUser);
			view.showCameraButton.removeEventListener(MouseEvent.CLICK, onShowCameraButton);
			view.privateChatButton.removeEventListener(MouseEvent.CLICK, onShowPrivateChatButton);
			meetingData.users.userChangeSignal.remove(onUserChanged);
			meetingData.meetingStatus.lockSettingsChangeSignal.remove(onLockSettingsChange);
			view = null;
		}
	}
}
