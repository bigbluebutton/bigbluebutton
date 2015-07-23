package org.bigbluebutton.air.video.views {
	
	import flash.net.NetConnection;
	
	import mx.core.FlexGlobals;
	
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	
	public class VideoChatView extends VideoChatViewBase implements IVideoChatView {
		private var webcam:VideoChatVideoView;
		
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function startStream(connection:NetConnection, name:String, streamName:String, userID:String, width:Number, height:Number, screenHeight:Number, screenWidth:Number):void {
			if (webcam)
				stopStream();
			webcam = new VideoChatVideoView();
			webcam.percentWidth = 100;
			webcam.percentHeight = 100;
			this.videoGroup.addElement(webcam);
			var topActionBarHeight:Number = FlexGlobals.topLevelApplication.topActionBar.height;
			var bottomMenuHeight:Number = FlexGlobals.topLevelApplication.bottomMenu.height;
			webcam.startStream(connection, name, streamName, userID, width, height, screenHeight, screenWidth, topActionBarHeight, bottomMenuHeight);
			webcam.setVideoPosition(name);
		}
		
		public function stopStream():void {
			if (webcam) {
				webcam.close();
				if (this.videoGroup.containsElement(webcam)) {
					this.videoGroup.removeElement(webcam);
				}
				webcam = null;
			}
		}
		
		public function get videoGroup():Group {
			return videoGroup0;
		}
		
		public function dispose():void {
			stopStream();
		}
		
		public function get noVideoMessage():Label {
			return noVideoMessage0;
		}
		
		public function get streamlist():List {
			return videoStreamsList;
		}
		
		public function getDisplayedUserID():String {
			if (webcam != null) {
				return webcam.userID;
			} else {
				return null;
			}
		}
	}
}
