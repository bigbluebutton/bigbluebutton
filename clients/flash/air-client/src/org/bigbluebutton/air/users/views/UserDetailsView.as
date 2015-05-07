package org.bigbluebutton.air.users.views {
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.lib.user.models.User;
	
	import spark.components.Button;
	
	public class UserDetailsView extends UserDetailsViewBase implements IUserDetailsView {
		public function UserDetailsView():void {
		}
		
		protected var _user:User;
		
		public function set user(u:User):void {
			_user = u;
			update();
		}
		
		public function get user():User {
			return _user;
		}
		
		public function update():void {
			if (user != null && FlexGlobals.topLevelApplication.mainshell != null) {
				if (_user.me) {
					userNameText.text = _user.name + " " + resourceManager.getString('resources', 'userDetail.you');
				} else {
					userNameText.text = _user.name;
				}
				if (_user.presenter) {
					statusText.text = resourceManager.getString('resources', 'participants.status.presenter');
				} else if (_user.role == "MODERATOR") {
					statusText.text = resourceManager.getString('resources', 'participants.status.moderator');
				} else {
					statusText.text = "";
				}
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
		
		public function dispose():void {
		}
		
		public function get showCameraButton():Button {
			return showCameraButton0;
		}
		
		public function get showPrivateChat():Button {
			return showPrivateChat0;
		}
	}
}
