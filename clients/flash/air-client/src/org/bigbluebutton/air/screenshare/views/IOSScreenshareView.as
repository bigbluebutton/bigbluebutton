package org.bigbluebutton.air.screenshare.views {
	import flash.display.DisplayObject;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.core.UIComponent;
	import mx.formatters.DateFormatter;
	
	import spark.components.Image;
	import spark.components.ProgressBar;
	
	import org.bigbluebutton.BBBRtmpPlayer;
	import org.bigbluebutton.BBBRtmpPlayerEvent;
	import org.bigbluebutton.air.util.ConnUtil;
	
	// FIXME : Work in progress class, needs behave like Android screensahring display
	public class IOSScreenshareView extends UIComponent {
		protected var player:BBBRtmpPlayer;
		
		protected var videoComp:DisplayObject;
		
		protected var originalVideoWidth:Number;
		
		protected var originalVideoHeight:Number;
		
		private var _waitingBar : ProgressBar;

		private var _waitingTimer : Timer;
		
		private var _connectionId : String;
		
		private const WAITING_SECONDS : int = 15;
		
		protected var dateFormat:DateFormatter = new DateFormatter("Y-MM-DD J:NN:SS:QQ");

		private function waitingTimerProgressHandler(e:TimerEvent):void {
			trace("PROGRESS " + _waitingTimer.currentCount);
			_waitingBar.currentProgress = _waitingTimer.currentCount;
		}

		public function resizeForProgressBar():void {
			// if we have device where screen width less than screen height e.g. phone
			if (width < height) {
				// make the video width full width of the screen 
				_waitingBar.width = width;
				// calculate height based on a video width, it order to keep the same aspect ratio
				_waitingBar.height = (_waitingBar.width / originalVideoWidth) * originalVideoHeight;
				// if calculated height appeared to be bigger than screen height, recalculuate the video size based on width
				if (height < _waitingBar.height) {
					// make the video height full height of the screen
					_waitingBar.height = height;
					// calculate width based on a video height, it order to keep the same aspect ratio
					_waitingBar.width = ((originalVideoWidth * _waitingBar.height) / originalVideoHeight);
				}
			} // if we have device where screen height less than screen width e.g. tablet
			else {
				// make the video height full height of the screen
				_waitingBar.height = height;
				// calculate width based on a video height, it order to keep the same aspect ratio
				_waitingBar.width = ((originalVideoWidth * _waitingBar.height) / originalVideoHeight);
				// if calculated width appeared to be bigger than screen width, recalculuate the video size based on height
				if (width < _waitingBar.width) {
					// make the video width full width of the screen 
					_waitingBar.width = width;
					// calculate height based on a video width, it order to keep the same aspect ratio
					_waitingBar.height = (_waitingBar.width / originalVideoWidth) * originalVideoHeight;
				}
			}
			
			_waitingBar.x = width - _waitingBar.width;
			_waitingBar.y = height - _waitingBar.height;
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
			
			
			_waitingBar = new ProgressBar();
			
			_waitingBar.width = imgWidth;
			_waitingBar.height = imgWidth;
			
			_waitingBar.currentProgress = 0;
			_waitingBar.totalProgress = WAITING_SECONDS;
			_waitingBar.percentWidth = 80;
			_waitingBar.percentHeight = 100;
			_waitingBar.bottom = 20;
			_waitingBar.styleName = "micLevelProgressBar";
			
			addChild(_waitingBar);
			
			_waitingTimer = new Timer(1000, WAITING_SECONDS);
			_waitingTimer.addEventListener(TimerEvent.TIMER, waitingTimerProgressHandler);

			if (player) {
				close();
			}
			
			videoComp = new Image();
			addChild(videoComp);
			
			this.originalVideoWidth = imgWidth;
			this.originalVideoHeight = imgHeight;
			
			_connectionId = ConnUtil.generateConnId();
			
			var url:String = uri + "/" + streamName + " live=1 conn=S:" + meetingId + " conn=S:" + externalUserId + " conn=S:" + authToken + " conn=S:" + _connectionId;
			
			player = new BBBRtmpPlayer(url);
			
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTED, onConnected);
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTING, onConnecting);
			player.addEventListener(BBBRtmpPlayerEvent.CONNECTION_FAILED, onConnectionFailed);
			player.addEventListener(BBBRtmpPlayerEvent.DISCONNECTED, onDisconnected);
			
			player.play();
		}
		
/*		private function showProgressBar() : void {
			_waitingBar = new ProgressBar();
			_waitingBar.currentProgress = 0;
			_waitingBar.totalProgress = 100;
			_waitingBar.percentWidth = 80;
			_waitingBar.percentHeight = 100;
			_waitingBar.bottom = 20;
			_waitingBar.horizontalCenter = 0;
			_waitingBar.verticalCenter = 0;
			_waitingBar.styleName = "micLevelProgressBar";
			
			addChild(_waitingBar);
			
			_waitingTimer = new Timer(1000, WAITING_SECONDS);
			_waitingTimer.addEventListener(TimerEvent.TIMER, waitingTimerProgressHandler);
			_waitingTimer.start();
		}
*/		
		private function onConnected(e:BBBRtmpPlayerEvent):void {
			trace(dateFormat.format(new Date()) + " EVENT: " + e.type + " MESSAGE: " + e.getMessage());
			if (_waitingBar && _waitingBar.parent == this) {
				_waitingTimer.removeEventListener(TimerEvent.TIMER, waitingTimerProgressHandler);
				_waitingBar.currentProgress = WAITING_SECONDS;
				removeChild(_waitingBar);
			}
			if (image) {
				image.source = player.getBmpData();
			}
		}
		
		private function onConnecting(e:BBBRtmpPlayerEvent):void {
			trace(dateFormat.format(new Date()) + " EVENT: " + e.type + " MESSAGE: " + e.getMessage());
			_waitingTimer.start();
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
			
			if (_waitingBar) {
				resizeForProgressBar();
			}
			
			if (player) {
				resizeForPortrait();
			}
		}
	}
}
