package org.bigbluebutton.air.common.views {
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.system.Capabilities;
	
	public class VideoViewAir extends VideoView {
		protected var aspectRatio:Number = 0;
		
		protected var originalVideoWidth:Number;
		
		protected var originalVideoHeight:Number;
		
		protected var screenWidth:Number;
		
		protected var screenHeight:Number;
		
		protected var topMenuBarHeight:Number;
		
		protected var bottomMenuBarHeight:Number;
		
		override public function startStream(connection:NetConnection, name:String, streamName:String, userID:String):void {
			if (connection.uri.indexOf("/video/") != -1 && Capabilities.version.indexOf("IOS") >= 0) {
				streamName = "h263/" + streamName;
			}
			super.startStream(connection, name, streamName, userID);
		}
		
		public function initializeScreenSizeValues(originalVideoWidth0:Number, originalVideoHeight0:Number, screenHeight0:Number, screenWidth0:Number, topMenuBarHeight0:Number, bottomMenuBarHeight0:Number):void {
			this.screenHeight = screenHeight0;
			this.screenWidth = screenWidth0;
			this.topMenuBarHeight = topMenuBarHeight0;
			this.bottomMenuBarHeight = bottomMenuBarHeight0;
			this.originalVideoWidth = originalVideoWidth0;
			this.originalVideoHeight = originalVideoHeight0;
		}
		
		public function resizeForPortrait():void {
			// if we have device where screen width less than screen height e.g. phone
			if (screenWidth < screenHeight) {
				// make the video width full width of the screen 
				video.width = screenWidth;
				// calculate height based on a video width, it order to keep the same aspect ratio
				video.height = (video.width / originalVideoWidth) * originalVideoHeight;
				// if calculated height appeared to be bigger than screen height, recalculuate the video size based on width
				if (screenHeight < video.height) {
					// make the video height full height of the screen
					video.height = screenHeight;
					// calculate width based on a video height, it order to keep the same aspect ratio
					video.width = ((originalVideoWidth * video.height) / originalVideoHeight);
				}
			} // if we have device where screen height less than screen width e.g. tablet
			else {
				// make the video height full height of the screen
				video.height = screenHeight;
				// calculate width based on a video height, it order to keep the same aspect ratio
				video.width = ((originalVideoWidth * video.height) / originalVideoHeight);
				// if calculated width appeared to be bigger than screen width, recalculuate the video size based on height
				if (screenWidth < video.width) {
					// make the video width full width of the screen 
					video.width = screenWidth;
					// calculate height based on a video width, it order to keep the same aspect ratio
					video.height = (video.width / originalVideoWidth) * originalVideoHeight;
				}
			}
		}
		
		public function resizeForLandscape():void {
			if (screenHeight < screenWidth) {
				video.height = screenWidth;
				video.width = ((originalVideoWidth * video.height) / originalVideoHeight);
				if (screenWidth < video.width) {
					video.width = screenHeight;
					video.height = (video.width / originalVideoWidth) * originalVideoHeight;
				}
			} else {
				video.width = screenHeight;
				video.height = (video.width / originalVideoWidth) * originalVideoHeight;
				if (screenHeight < video.height) {
					video.height = screenWidth;
					video.width = ((originalVideoWidth * video.height) / originalVideoHeight);
				}
			}
		}
		
		public function rotateVideo(rotation:Number):void {
			if (video && stage.contains(video)) {
				stage.removeChild(video);
			}
			video = new Video();
			video.attachNetStream(ns);
			switch (rotation) {
				case 0:
					resizeForPortrait();
					video.x = screenWidth / 2 - video.width / 2;
					video.y = screenHeight / 2 - video.height / 2 + topMenuBarHeight;
					break;
				case -90:
					resizeForLandscape();
					video.x = (screenWidth / 2) - (video.height / 2);
					video.y = (screenHeight / 2) + (video.width / 2) + topMenuBarHeight;
					break;
				case 90:
					resizeForLandscape();
					video.x = (screenWidth / 2) + (video.height / 2);
					video.y = (screenHeight / 2) - (video.width / 2) + topMenuBarHeight;
					break;
				case 180:
					resizeForPortrait();
					video.x = screenWidth / 2 + video.width / 2;
					video.y = (screenHeight / 2) + (video.height / 2) + topMenuBarHeight
					break;
				default:
					break;
			}
			video.rotation = rotation;
			this.stage.addChild(video);
		}
	}
}
