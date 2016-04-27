package org.bigbluebutton.lib.video.commands {
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class CameraQualityCommand extends Command {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var cameraQualitySelected:VideoProfile;
		
		public function CameraQualityCommand() {
			super();
		}
		
		/**
		 * Set Camera Quality base on user selection
		 **/
		public override function execute():void {
			userSession.videoConnection.selectCameraQuality(cameraQualitySelected);
		}
	}
}
