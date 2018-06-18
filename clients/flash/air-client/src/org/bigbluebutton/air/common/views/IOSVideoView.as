package org.bigbluebutton.air.common.views {
	import spark.components.Image;
	
	import org.bigbluebutton.BBBRtmpPlayer;
	import org.bigbluebutton.BBBRtmpPlayerEvent;
	
	public class IOSVideoView extends VideoBaseView {
		
		protected var player:BBBRtmpPlayer;
		
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
			if (player) {
				player.removeEventListener(BBBRtmpPlayerEvent.CONNECTED, onConnected);
				player.removeEventListener(BBBRtmpPlayerEvent.CONNECTING, onConnecting);
				player.removeEventListener(BBBRtmpPlayerEvent.CONNECTION_FAILED, onConnectionFailed);
				player.removeEventListener(BBBRtmpPlayerEvent.DISCONNECTED, onDisconnected);
			}
			if (numChildren > 0 && getChildAt(0) == image) {
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
		
		public function rotateVideo(rotation:Number):void {
			if (image && stage.contains(image)) {
				removeChild(image);
			}
			videoComp = new Image();
			switch (rotation) {
				case 0:
					resizeForPortrait();
					image.x = width / 2 - image.width / 2;
					image.y = height / 2 - image.height / 2; // + topMenuBarHeight;
					break;
				case -90:
					resizeForLandscape();
					image.x = (width / 2) - (image.height / 2);
					image.y = (height / 2) + (image.width / 2); // + topMenuBarHeight;
					break;
				case 90:
					resizeForLandscape();
					image.x = (width / 2) + (image.height / 2);
					image.y = (height / 2) - (image.width / 2); // + topMenuBarHeight;
					break;
				case 180:
					resizeForPortrait();
					image.x = width / 2 + image.width / 2;
					image.y = (height / 2) + (image.height / 2); // + topMenuBarHeight
					break;
				default:
					break;
			}
			image.rotation = rotation;
			addChild(image);
		}
	}
}
