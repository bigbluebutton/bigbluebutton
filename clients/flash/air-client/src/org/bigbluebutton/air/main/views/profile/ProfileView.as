package org.bigbluebutton.air.main.views.profile {
	
	import spark.components.Button;
	
	public class ProfileView extends ProfileViewBase implements IProfileView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function dispose():void {
		}
		
		public function get shareCameraButton():Button {
			return shareCameraBtn0;
		}
		
		public function get shareCameraBtnLabel():String {
			return shareCameraBtn0.label;
		}
		
		public function get shareMicButton():Button {
			return shareMicBtn0;
		}
		
		public function get statusButton():Button {
			return statusBtn0;
		}
		
		public function get shareMicBtnLabel():String {
			return shareMicBtn0.label;
		}
		
		public function get logoutButton():Button {
			return logoutButton0;
		}
		
		public function get clearAllStatusButton():Button {
			return clearAllStatusBtn;
		}
		
		public function get muteAllButton():Button {
			return muteAllBtn;
		}
		
		public function get muteAllExceptPresenterButton():Button {
			return muteAllExceptPresenterBtn;
		}
		
		public function get lockViewersButton():Button {
			return lockViewersBtn;
		}
		
		public function get unmuteAllButton():Button {
			return unmuteAllBtn;
		}
	}
}
