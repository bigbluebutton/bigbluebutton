package org.bigbluebutton.web.video.commands {
	
	import flash.media.Camera;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	import org.bigbluebutton.web.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class ShareCameraCommandWeb extends Command {
		
		[Inject]
		public var camera:String;
		
		[Inject]
		public var enabled:Boolean
		
		[Inject]
		public var userService:IUsersService;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function execute():void {
			if (enabled) {
				enableCamera();
			} else {
				disableCamera();
			}
		}
		
		private function buildStreamName(camWidth:int, camHeight:int, userId:String):String {
			var d:Date = new Date();
			var curTime:Number = d.getTime();
			var uid:String = userSession.userId;
			if (userSession.videoProfileManager == null) {
				trace("null video profile manager");
			}
			var videoProfile:VideoProfile = userSession.videoConnection.selectedCameraQuality;
			var res:String = videoProfile.id;
			return res.concat("-" + uid) + "-" + curTime;
		}
		
		private function setupCamera():Camera {
			if (!Camera.isSupported) {
				return null;
			}
			return Camera.getCamera(camera);
		}
		
		private function enableCamera():void {
			userSession.videoConnection.camera = setupCamera();
			userSession.videoConnection.selectCameraQuality(userSession.videoConnection.selectedCameraQuality);
			var userId:String = userSession.userId;
			if (userSession.videoConnection.camera) {
				var streamName:String = buildStreamName(userSession.videoConnection.camera.width, userSession.videoConnection.camera.height, userId);
				userService.addStream(userId, streamName);
				userSession.videoConnection.startPublishing(userSession.videoConnection.camera, streamName);
			}
		}
		
		private function disableCamera():void {
			var streamNames:Array = userSession.userList.me.streamName.split("|");
			for each (var streamName:String in streamNames) {
				if (!camera || userSession.videoConnection.getStreamNameForCamera(setupCamera()) == streamName) {
					userService.removeStream(userSession.userId, streamName);
				}
			}
			if (userSession.videoConnection) {
				if (camera) {
					userSession.videoConnection.stopPublishing(setupCamera());
				} else {
					userSession.videoConnection.stopAllPublishing();
				}
				
			}
		}
	}
}
