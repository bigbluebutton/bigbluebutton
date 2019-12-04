package org.bigbluebutton.air.video.views {
	import flash.net.NetConnection;
	import flash.system.Capabilities;
	
	import spark.components.Group;
	
	import org.bigbluebutton.air.common.views.IOSVideoView;
	import org.bigbluebutton.air.common.views.VideoView;
	
	public class WebcamDock extends Group {
		
		private var _video:VideoView;
		private var _iosVideoView:IOSVideoView;
		
		public function WebcamDock() {
			super();
			
			if (Capabilities.version.indexOf("IOS") >= 0) {
				_iosVideoView = new IOSVideoView();
				_iosVideoView.percentWidth = 100;
				_iosVideoView.percentHeight = 100;
				addElement(_iosVideoView);
			} else {
				_video = new VideoView();
				_video.percentHeight = 100;
				_video.percentWidth = 100;
				addElement(_video);	
			}			
		}
		
		public function startStream(connection:NetConnection, name:String, streamName:String, userId:String, oWidth:Number, oHeight:Number, meetingId:String, authToken:String, externalUserId:String):void {
			
			if (Capabilities.version.indexOf("IOS") >= 0) {
				_iosVideoView.startStream(connection.uri, streamName, oWidth, oHeight, meetingId, authToken, externalUserId);
			} else {
				_video.startStream(connection, name, streamName, userId, oWidth, oHeight);	
			}
		}
		
		public function closeStream():void {
			if (Capabilities.version.indexOf("IOS") >= 0) {
				_iosVideoView.close();
			} else {
				_video.close();
			}	
		}
	}
}
