package org.bigbluebutton.web.deskshare.views {
	
	import flash.display.Bitmap;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.net.NetConnection;
	import flash.net.URLRequest;
	
	import mx.controls.VideoDisplay;
	
	import org.bigbluebutton.lib.common.views.VideoView;
	
	public class DeskshareVideoView extends VideoView {
		
		protected var originalVideoWidth:Number;
		
		protected var originalVideoHeight:Number;
		
		protected var screenWidth:Number;
		
		protected var screenHeight:Number;
		
		//protected var aspectRatio:Number;
		
		protected var _videoDisplay:VideoDisplay;
		
		private var _mouse:Bitmap;
		
		public function DeskshareVideoView(videoDisplay:VideoDisplay) {
			_videoDisplay = videoDisplay;
			super();
		}
		
		public function addVideo():void {
			_videoDisplay.addChild(video);
		}
		
		public function setVideoPosition(x:Number, y:Number, w:Number, h:Number):void {
			this.screenHeight = h;
			this.screenWidth = w;
			if (!aspectRatio) {
				aspectRatio = video.width / video.height;
			}
			if (w / aspectRatio < h) {
				video.width = w;
				video.height = w / aspectRatio
			} else {
				video.height = h;
				video.width = h * aspectRatio
			}
			video.x = (w - video.width) / 2;
			video.y = (h - video.height) / 2;
		}
		
		public function displayOriginalSize(w:Number, h:Number, xChange:Number = 0, yChange:Number = 0):void {
			this.screenHeight = h;
			this.screenWidth = w;
			video.width = originalVideoWidth;
			video.height = originalVideoHeight;
			video.x = (screenWidth - video.width) * xChange / 100;
			video.y = (screenHeight - video.height) * yChange / 100;;
		}
		
		public function initializeScreenSizeValues(originalVideoWidth0:Number, originalVideoHeight0:Number, screenHeight0:Number, screenWidth0:Number):void {
			this.screenHeight = screenHeight0;
			this.screenWidth = screenWidth0;
			this.originalVideoWidth = originalVideoWidth0;
			this.originalVideoHeight = originalVideoHeight0;
		}
		
		public function get videoWidth():Number {
			return video.width;
		}
		
		public function get videoHeight():Number {
			return video.height;
		}
		
		/**
		 * We can't add image to the stage, need to load the image as a bitmap
		 */
		public function addMouse():void {
			var loader:Loader = new Loader();
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loadMouseComplete);
			var request:URLRequest = new URLRequest("assets/images/cursor.png");
			loader.load(request);
		}
		
		/**
		 * Move mouse
		 * Based on provided values from the server need to recalculate position respecting current screen size and rotation
		 */
		public function moveMouse(originalX:Number, originalY:Number):void {
			var reducedScreenPercentage:Number;
			// need to wait until mouse bitmap is loaded and added to the stage
			if (_mouse) {
				if (video.height == screenHeight) {
					reducedScreenPercentage = originalVideoHeight / video.height;
				} else {
					reducedScreenPercentage = originalVideoWidth / video.width;
				}
				if (originalY <= 0) {
					_mouse.y = video.y;
				} else if (originalY / reducedScreenPercentage > video.height) {
					_mouse.y = video.y + video.height;
				} else {
					_mouse.y = video.y + originalY / reducedScreenPercentage;
				}
				if (originalX <= 0) {
					_mouse.x = video.x;
				} else if (originalX / reducedScreenPercentage > video.width) {
					_mouse.x = video.x + video.width;
				} else {
					_mouse.x = video.x + originalX * video.width / originalVideoWidth;
				}
			}
		}
		
		/**
		 * Once cursor bitmap loaded - add it to the stage
		 */
		private function loadMouseComplete(event:Event):void {
			_mouse = Bitmap(event.target.loader.content);
			_videoDisplay.addChild(_mouse);
		}
		
		public function removeMouse():void {
			_videoDisplay.removeChild(_mouse);
		}
		
		/**
		 * Move mouse
		 * Based on provided values from the server need to recalculate position respecting current screen size and rotation
		 */
		public function changeMouseLocation(x:Number, y:Number):void {
			if (_mouse) {
				_mouse.x = x;
				_mouse.y = y;
			}
		}
	}
}
