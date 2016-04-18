package org.bigbluebutton.air.users.views.userdetails {
	
	import mx.core.FlexGlobals;
	
	import spark.components.Button;
	
	import org.bigbluebutton.lib.user.models.User;
	
	public class UserDetailsView extends UserDetailsViewBase implements IUserDetailsView {
		
		protected var _user:User;
		
		protected var _userMe:User;
		
		public function set user(u:User):void {
			_user = u;
			update();
		}
		
		public function set userMe(u:User):void {
			_userMe = u;
			update();
		}
		
		public function get user():User {
			return _user;
		}
		
		public function get userMe():User {
			return _userMe;
		}
		
		public function update():void {
			if (user != null && FlexGlobals.topLevelApplication.mainshell != null && userMe != null) {
				if (_user.me) {
					userNameText.text = _user.name + " " + resourceManager.getString('resources', 'userDetail.you');
				} else {
					userNameText.text = _user.name;
				}
				if (_user.presenter) {
					roleText.text = resourceManager.getString('resources', 'participants.status.presenter');
					if (_user.role == User.MODERATOR) {
						roleText.text += "/" + resourceManager.getString('resources', 'participants.status.moderator');
					}
				} else if (_user.role == User.MODERATOR) {
					roleText.text = resourceManager.getString('resources', 'participants.status.moderator');
				} else {
					roleText.text = "";
				}
				if (_user.status != User.NO_STATUS && _userMe.role == User.MODERATOR) {
					clearStatusButton.includeInLayout = true;
					clearStatusButton.visible = true;
				} else {
					clearStatusButton.includeInLayout = false;
					clearStatusButton.visible = false;
				}
				if (!_user.presenter && _userMe.role == User.MODERATOR) {
					makePresenterButton.includeInLayout = true;
					makePresenterButton.visible = true;
				} else {
					makePresenterButton.includeInLayout = false;
					makePresenterButton.visible = false;
				}
				clearStatusButton.label = resourceManager.getString('resources', 'profile.emojiStatus.clear');
				cameraIcon.visible = cameraIcon.includeInLayout = _user.hasStream;
				micIcon.visible = micIcon.includeInLayout = (_user.voiceJoined && !_user.muted);
				micOffIcon.visible = micOffIcon.includeInLayout = (_user.voiceJoined && _user.muted);
				noMediaText.visible = noMediaText.includeInLayout = (!_user.voiceJoined && !_user.hasStream);
				//TODO: buttons
				showCameraButton0.includeInLayout = _user.hasStream;
				showCameraButton0.visible = _user.hasStream;
				showPrivateChat0.includeInLayout = !_user.me;
				showPrivateChat0.visible = !_user.me;
			}
		}
		
		public function updateLockButtons(isRoomLocked:Boolean):void {
			if (_userMe.role == User.MODERATOR && isRoomLocked && _user.role != User.MODERATOR) {
				if (_user.locked) {
					unlockButton.visible = true;
					unlockButton.includeInLayout = true;
					lockButton.visible = false;
					lockButton.includeInLayout = false;
				} else {
					unlockButton.visible = false;
					unlockButton.includeInLayout = false;
					lockButton.visible = true;
					lockButton.includeInLayout = true;
				}
			} else {
				unlockButton.visible = false;
				unlockButton.includeInLayout = false;
				lockButton.visible = false;
				lockButton.includeInLayout = false;
			}
		}
		
		public function dispose():void {
		}
		
		public function get showCameraButton():Button {
			return showCameraButton0;
		}
		
		public function get showPrivateChat():Button {
			return showPrivateChat0;
		}
		
		public function get clearStatusButton():Button {
			return clearStatusButton0;
		}
		
		public function get promoteButton():Button {
			return promoteButton0;
		}
		
		public function get makePresenterButton():Button {
			return makePresenterButton0;
		}
		
		public function get lockButton():Button {
			return lockButton0;
		}
		
		public function get unlockButton():Button {
			return unlockButton0;
		}
	}
}
