package org.bigbluebutton.air.video.commands
{
	import flash.media.Camera;
	
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.user.services.IUsersService;
	import org.bigbluebutton.air.video.models.WebcamStreamInfo;
	
	import robotlegs.bender.bundles.mvcs.Command;

	public class StopShareCameraCommand extends Command
	{
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		override public function execute():void {
			disableCamera();
		}
		
		private function disableCamera():void {
			var webcams:Array = meetingData.webcams.findWebcamsByUserId(meetingData.users.me.intId);
			if (webcams.length > 0) {
				usersService.removeStream(meetingData.users.me.intId, (webcams[0] as WebcamStreamInfo).streamId);
				userSession.videoConnection.stopPublishing(setupCamera(userSession.videoConnection.cameraPosition));
			}
		}
		
		private function setupCamera(position:String):Camera {
			return findCamera(position);
		}
		
		private function findCamera(position:String):Camera {
			if (!Camera.isSupported) {
				return null;
			}
			var cam:Camera = this.getCamera(position);
			return cam;
		}
		
		// Get the requested camera. If it cannot be found,
		// return the device's default camera.
		private function getCamera(position:String):Camera {
			for (var i:uint = 0; i < Camera.names.length; ++i) {
				var cam:Camera = Camera.getCamera(String(i));
				if (cam.position == position)
					return cam;
			}
			return Camera.getCamera();
		}
	}
}