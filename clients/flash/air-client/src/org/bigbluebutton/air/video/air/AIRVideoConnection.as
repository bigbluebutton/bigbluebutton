package org.bigbluebutton.air.video.air {
	import flash.media.CameraPosition;
	
	import org.bigbluebutton.air.video.services.VideoConnection;
	
	public class AIRVideoConnection extends VideoConnection {
		
		[PostConstruct]
		public function init():void {
			baseConnection.init(this);
			userSession.successJoiningMeetingSignal.add(loadCameraSettings)
		}
		
		
		private function loadCameraSettings():void {
			if (saveData.read("cameraQuality") != null) {
				_selectedCameraQuality = userSession.videoProfileManager.getVideoProfileById(saveData.read("cameraQuality") as String);
				if (!_selectedCameraQuality) {
					_selectedCameraQuality = userSession.videoProfileManager.defaultVideoProfile;
					trace("selected camera quality " + _selectedCameraQuality)
				}
			} else {
				_selectedCameraQuality = userSession.videoProfileManager.defaultVideoProfile;
			}
			if (saveData.read("cameraRotation") != null) {
				_selectedCameraRotation = saveData.read("cameraRotation") as int;
			} else {
				_selectedCameraRotation = 0;
			}
			if (saveData.read("cameraPosition") != null) {
				_cameraPosition = saveData.read("cameraPosition") as String;
			} else {
				_cameraPosition = CameraPosition.FRONT;
			}
		}
	}
}
