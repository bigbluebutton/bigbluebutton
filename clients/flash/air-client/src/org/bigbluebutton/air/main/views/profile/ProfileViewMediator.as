package org.bigbluebutton.air.main.views.profile {
	
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.lib.main.commands.ClearUserStatusSignal;
	import org.bigbluebutton.lib.main.commands.MuteAllUsersExpectPresenterSignal;
	import org.bigbluebutton.lib.main.commands.MuteAllUsersSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ProfileViewMediator extends Mediator {
		
		[Inject]
		public var view:IProfileView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		[Inject]
		public var clearUserStatusSignal:ClearUserStatusSignal;
		
		[Inject]
		public var muteAllUsersSignal:MuteAllUsersSignal;
		
		[Inject]
		public var muteAllUsersExpectPresenterSignal:MuteAllUsersExpectPresenterSignal;
		
		private var navigateToCameraSettings:Function = navigateTo(PageEnum.CAMERASETTINGS);
		
		private var navigateToAudioSettings:Function = navigateTo(PageEnum.AUDIOSETTINGS);
		
		private var navigateToLockSettings:Function = navigateTo(PageEnum.LOCKSETTINGS);
		
		override public function initialize():void {
			var userMe:User = userSession.userList.me;
			disableCamButton(userSession.lockSettings.disableCam && !userMe.presenter && userMe.locked && userMe.role != User.MODERATOR);
			userSession.lockSettings.disableCamSignal.add(disableCamButton);
			if (userMe.role != User.MODERATOR) {
				displayManagementButtons(false);
			} else {
				setMuteState(userSession.meetingMuted);
				view.clearAllStatusButton.addEventListener(MouseEvent.CLICK, onClearAllButton);
				view.unmuteAllButton.addEventListener(MouseEvent.CLICK, onUnmuteAllButton);
				view.muteAllButton.addEventListener(MouseEvent.CLICK, onMuteAllButton);
				view.muteAllExceptPresenterButton.addEventListener(MouseEvent.CLICK, onMuteAllExceptPresenterButton);
			}
			userSession.userList.userChangeSignal.add(userChanged);
			view.logoutButton.addEventListener(MouseEvent.CLICK, logoutClick);
			FlexGlobals.topLevelApplication.topActionBar.pageName.text = ResourceManager.getInstance().getString('resources', 'profile.title');
			addNavigationListeners();
			setNameLabels();
		}
		
		private function setNameLabels():void {
			view.userName.text = userSession.userList.me.name;
			var names:Array = view.userName.text.split(" ");
			var firstLetters:String = names[0].charAt(0);
			if (names[1]) {
				firstLetters += names[1].charAt(0);
			}
			view.firstLetters.text = firstLetters.toUpperCase();
		}
		
		private function addNavigationListeners():void {
			view.shareCameraButton.addEventListener(MouseEvent.CLICK, navigateToCameraSettings);
			view.shareMicButton.addEventListener(MouseEvent.CLICK, navigateToAudioSettings);
			view.lockViewersButton.addEventListener(MouseEvent.CLICK, navigateToLockSettings);
		}
		
		private function removeNavigationListeners():void {
			view.shareCameraButton.removeEventListener(MouseEvent.CLICK, navigateToCameraSettings);
			view.shareMicButton.removeEventListener(MouseEvent.CLICK, navigateToAudioSettings);
			view.lockViewersButton.removeEventListener(MouseEvent.CLICK, navigateToLockSettings);
		}
		
		private function navigateTo(view:String):Function {
			return function(e:MouseEvent):void {
				userUISession.pushPage(view);
			}
		}
		
		private function setMuteState(muted:Boolean):void {
			if (muted) {
				view.muteAllButton.visible = false;
				view.muteAllButton.includeInLayout = false;
				view.muteAllExceptPresenterButton.visible = false;
				view.muteAllExceptPresenterButton.includeInLayout = false;
				view.unmuteAllButton.visible = true;
				view.unmuteAllButton.includeInLayout = true;
			} else {
				view.muteAllButton.visible = true;
				view.muteAllButton.includeInLayout = true;
				view.muteAllExceptPresenterButton.visible = true;
				view.muteAllExceptPresenterButton.includeInLayout = true;
				view.unmuteAllButton.visible = false;
				view.unmuteAllButton.includeInLayout = false;
			}
		}
		
		private function disableCamButton(disable:Boolean):void {
			if (disable) {
				view.shareCameraButton.visible = false;
				view.shareCameraButton.includeInLayout = false;
			} else {
				view.shareCameraButton.visible = true;
				view.shareCameraButton.includeInLayout = true;
			}
		}
		
		/**
		 * User pressed log out button
		 */
		public function logoutClick(event:MouseEvent):void {
			userUISession.pushPage(PageEnum.EXIT);
		}
		
		protected function onClearAllButton(event:MouseEvent):void {
			for each (var user:User in userSession.userList.users) {
				clearUserStatusSignal.dispatch(user.userID);
				userSession.userList.getUser(user.userID).status = User.NO_STATUS;
			}
			userUISession.popPage();
		}
		
		protected function onMuteAllButton(event:MouseEvent):void {
			muteAllUsersSignal.dispatch(true);
			setMuteState(true);
			userUISession.popPage();
		}
		
		protected function onUnmuteAllButton(event:MouseEvent):void {
			muteAllUsersSignal.dispatch(false);
			setMuteState(false);
			userUISession.popPage();
		}
		
		protected function onMuteAllExceptPresenterButton(event:MouseEvent):void {
			muteAllUsersExpectPresenterSignal.dispatch(true);
			setMuteState(true);
			userUISession.popPage();
		}
		
		private function displayManagementButtons(display:Boolean):void {
			view.clearAllStatusButton.visible = display;
			view.clearAllStatusButton.includeInLayout = display;
			view.muteAllButton.visible = display;
			view.muteAllButton.includeInLayout = display;
			view.muteAllExceptPresenterButton.visible = display;
			view.muteAllExceptPresenterButton.includeInLayout = display;
			view.lockViewersButton.visible = display;
			view.lockViewersButton.includeInLayout = display;
			view.unmuteAllButton.visible = display;
			view.unmuteAllButton.includeInLayout = display;
		}
		
		private function userChanged(user:User, type:int):void {
			if (userSession.userList.me.userID == user.userID) {
				if (userSession.userList.me.role == User.MODERATOR) {
					displayManagementButtons(true);
					setMuteState(userSession.meetingMuted);
				} else {
					displayManagementButtons(false);
				}
			}
		}
		
		override public function destroy():void {
			super.destroy();
			if (view.clearAllStatusButton.hasEventListener(MouseEvent.CLICK)) {
				view.clearAllStatusButton.removeEventListener(MouseEvent.CLICK, onClearAllButton);
			}
			if (view.unmuteAllButton.hasEventListener(MouseEvent.CLICK)) {
				view.unmuteAllButton.removeEventListener(MouseEvent.CLICK, onUnmuteAllButton);
			}
			if (view.muteAllButton.hasEventListener(MouseEvent.CLICK)) {
				view.muteAllButton.removeEventListener(MouseEvent.CLICK, onMuteAllButton);
			}
			if (view.muteAllExceptPresenterButton.hasEventListener(MouseEvent.CLICK)) {
				view.muteAllExceptPresenterButton.removeEventListener(MouseEvent.CLICK, onMuteAllExceptPresenterButton);
			}
			
			view.logoutButton.removeEventListener(MouseEvent.CLICK, logoutClick);
			userSession.lockSettings.disableCamSignal.remove(disableCamButton);
			userSession.userList.userChangeSignal.remove(userChanged);
			removeNavigationListeners();
			view.dispose();
			view = null;
		}
	}
}
