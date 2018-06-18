package org.bigbluebutton.air.screenshare.views {
	import flash.display.DisplayObject;
	
	import mx.core.UIComponent;
	
	import spark.components.Image;
	
	import org.bigbluebutton.BBBRtmpPlayer;
	import org.bigbluebutton.BBBRtmpPlayerEvent;
	
	// FIXME : Work in progress class, needs behave like Android screensahring display
	public class IOSScreenshareView extends UIComponent {
		protected var player:BBBRtmpPlayer;
		
		protected var videoComp:DisplayObject;
		
		protected var originalVideoWidth:Number;
		
		protected var originalVideoHeight:Number;
		
		public function resizeForPortrait():void {
			// if we have device where screen width less than screen height e.g. phone
			if (width < height) {
				// make the video width full width of the screen 
				videoComp.width = width;
				// calculate height based on a video width, it order to keep the same aspect ratio
				videoComp.height = (videoComp.width / originalVideoWidth) * originalVideoHeight;
				// if calculated height appeared to be bigger than screen height, recalculuate the video size based on width
				if (height < videoComp.height) {
					// make the video height full height of the screen
					videoComp.height = height;
					// calculate width based on a video height, it order to keep the same aspect ratio
					videoComp.width = ((originalVideoWidth * videoComp.height) / originalVideoHeight);
				}
			} // if we have device where screen height less than screen width e.g. tablet
			else {
				// make the video height full height of the screen
				videoComp.height = height;
				// calculate width based on a video height, it order to keep the same aspect ratio
				videoComp.width = ((originalVideoWidth * videoComp.height) / originalVideoHeight);
				// if calculated width appeared to be bigger than screen width, recalculuate the video size based on height
				if (width < videoComp.width) {
					// make the video width full width of the screen 
					videoComp.width = width;
					// calculate height based on a video width, it order to keep the same aspect ratio
					videoComp.height = (videoComp.width / originalVideoWidth) * originalVideoHeight;
				}
			}
			
			videoComp.x = width - videoComp.width;
			videoComp.y = height - videoComp.height;
		}
		
		private function get image():Image {
			return videoComp as Image;
		}
		
		public function startStream(uri:String, streamName:String, imgWidth:Number, imgHeight:Number, meetingId:String, authToken:String, externalUserId:String):void {
			
			if (player) {
				close();
			}
			
			videoComp = new Image();
			if (numChildren == 0) {
				addChild(videoComp);
			}
			
			this.originalVideoWidth = imgWidth;
			this.originalVideoHeight = imgHeight;
			
			var url:String = uri + "/" + streamName + " live=1 conn=S:" + meetingId + " conn=S:" + externalUserId + " conn=S:" + authToken;
			
			player = new BBBRtmpPlayer(url);
			
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTED, onConnected);
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTING, onConnecting);
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTION_FAILED, onConnectionFailed);
			player.addEventListener(BBBRtmpPlayerEvent.DISCONNECTED, onDisconnected);
			
			player.play();
		}
		
		private function onConnected(e:BBBRtmpPlayerEvent):void {
			image.source = player.getBmpData();
		}
		
		private function onConnecting(e:BBBRtmpPlayerEvent):void {
			trace("EVENT: " + e.type + " MESSAGE: " + e.getMessage());
		}
		
		private function onConnectionFailed(e:BBBRtmpPlayerEvent):void {
			close();
		}
		
		private function onDisconnected(e:BBBRtmpPlayerEvent):void {
			close();
		}
		
		public function close():void {
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTED, onConnected);
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTING, onConnecting);
			player.removeEventListener(BBBRtmpPlayerEvent.CONNECTION_FAILED, onConnectionFailed);
			player.removeEventListener(BBBRtmpPlayerEvent.DISCONNECTED, onDisconnected);
			if (getChildAt(0) == image) {
				removeChild(image);
			}
			videoComp = null;
			player = null;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			if (player) {
				resizeForPortrait();
			}
		}
	}
}
