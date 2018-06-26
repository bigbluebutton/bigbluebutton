package org.bigbluebutton.air.screenshare.views {
	import flash.display.DisplayObject;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.core.UIComponent;
	
	import spark.components.Image;
	import spark.components.ProgressBar;
	
	import org.bigbluebutton.BBBRtmpPlayer;
	import org.bigbluebutton.BBBRtmpPlayerEvent;
	
	// FIXME : Work in progress class, needs behave like Android screensahring display
	public class IOSScreenshareView extends UIComponent {
		protected var player:BBBRtmpPlayer;
		
		protected var videoComp:DisplayObject;
		
		protected var originalVideoWidth:Number;
		
		protected var originalVideoHeight:Number;
		
		private var _waitingBar : ProgressBar;
		
		private var _waitingTimer : Timer;
		
		private const WAITING_SECONDS : int = 15;
		
		private function waitingTimerProgressHandler(e:TimerEvent):void {
			_waitingBar.totalProgress = (_waitingTimer.currentCount / WAITING_SECONDS) * 100;
		}
		
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
			
			showProgressBar();
			
			if (player) {
				close();
			}
			
			videoComp = new Image();
			addChild(videoComp);
			
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
		
		private function showProgressBar() : void {
			_waitingBar = new ProgressBar();
			_waitingBar.totalProgress = 0;
			_waitingBar.percentWidth = 80;
			_waitingBar.height = 40;
			_waitingBar.bottom = 20;
			_waitingBar.horizontalCenter = 0;
			_waitingBar.verticalCenter = 0;
			_waitingBar.styleName = "micLevelProgressBar";
			
			addChild(_waitingBar);
			
			_waitingTimer = new Timer(1000, WAITING_SECONDS);
			_waitingTimer.addEventListener(TimerEvent.TIMER, waitingTimerProgressHandler);
			_waitingTimer.start();
		}
		
		private function onConnected(e:BBBRtmpPlayerEvent):void {
			trace("EVENT: " + e.type + " MESSAGE: " + e.getMessage());
			if (_waitingBar && _waitingBar.parent == this) {
				removeChild(_waitingBar);
			}
			if (image) {
				image.source = player.getBmpData();
			}
		}
		
		private function onConnecting(e:BBBRtmpPlayerEvent):void {
			trace("EVENT: " + e.type + " MESSAGE: " + e.getMessage());
		}
		
		private function onConnectionFailed(e:BBBRtmpPlayerEvent):void {
			trace("EVENT: " + e.type + " MESSAGE: " + e.getMessage());
			close();
		}
		
		private function onDisconnected(e:BBBRtmpPlayerEvent):void {
			trace("EVENT: " + e.type + " MESSAGE: " + e.getMessage());
			close();
		}
		
		public function close():void {
			if (player) {
				player.addEventListener(BBBRtmpPlayerEvent.CONNECTED, onConnected);
				player.addEventListener(BBBRtmpPlayerEvent.CONNECTING, onConnecting);
				player.removeEventListener(BBBRtmpPlayerEvent.CONNECTION_FAILED, onConnectionFailed);
				player.removeEventListener(BBBRtmpPlayerEvent.DISCONNECTED, onDisconnected);
				if (image && image.parent == this) {
					removeChild(image);
				}
				videoComp = null;
				player = null;	
			}
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			if (player) {
				resizeForPortrait();
			}
		}
	}
}
