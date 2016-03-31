package org.bigbluebutton.air.video.air {
	import flash.media.CameraPosition;
	
	import org.bigbluebutton.lib.video.services.VideoConnection;
	
	public class AIRVideoConnection extends VideoConnection {
		
		[PostConstruct]
		public function init():void {
			baseConnection.init(this);
			userSession.successJoiningMeetingSignal.add(loadCameraSettings)
		}
		
		
		override protected function loadCameraSettings():void {
			if (saveData.read("cameraQuality") != null) {
				_selectedCameraQuality = userSession.videoProfileManager.getVideoProfileById(saveData.read("cameraQuality") as String);
				if (!_selectedCameraQuality) {
					_selectedCameraQuality = userSession.videoProfileManager.defaultVideoProfile;
					trace("selected camera quality " + _selectedCameraQuality)
				}
			} else {
				_selectedCameraQuality = userSession.videoProfileManager.defaultVideoProfile;
			}
			if (saveData.read("cameraPosition") != null) {
				_cameraPosition = saveData.read("cameraPosition") as String;
			} else if (this.hasOwnProperty("CameraPosition")) {
				_cameraPosition = CameraPosition.FRONT;
			}
		}
	}
}
