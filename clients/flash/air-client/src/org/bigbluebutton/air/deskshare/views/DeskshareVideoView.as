package org.bigbluebutton.air.deskshare.views {
	
	import flash.display.Bitmap;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.air.common.views.VideoViewAir;
	
	public class DeskshareVideoView extends VideoViewAir {
		private var _mouse:Bitmap;
		
		public function DeskshareVideoView() {
			super();
		}
		
		/**
		 * We can't add image to the stage, need to load the image as a bitmap
		 */
		public function addMouseToStage():void {
			var loader:Loader = new Loader();
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, completeHandler);
			var request:URLRequest = new URLRequest("assets/res/common/cursor.png");
			loader.load(request);
		}
		
		/**
		 * Once cursor bitmap loaded - add it to the stage
		 */
		private function completeHandler(event:Event):void {
			_mouse = Bitmap(event.target.loader.content);
			this.stage.addChild(_mouse);
		}
		
		/**
		 * Move mouse
		 * Based on provided values from the server need to recalculate position respecting current screen size and rotation
		 */
		public function moveMouse(originalX:Number, originalY:Number):void {
			var reducedScreenPercentage:Number;
			// need to wait until mouse bitmap is loaded and added to the stage
			if (_mouse) {
				switch (video.rotation) {
					// straight
					case 0:
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
							_mouse.x = video.x + originalX / reducedScreenPercentage;
						}
						break;
					// left
					case -90:
						if (video.height == screenHeight) {
							reducedScreenPercentage = originalVideoHeight / video.width;
						} else {
							reducedScreenPercentage = originalVideoWidth / video.height;
						}
						if (originalY <= 0) {
							_mouse.x = video.x;
						} else if (originalY / reducedScreenPercentage > video.width) {
							_mouse.x = video.x + video.width;
						} else {
							_mouse.x = video.x + (originalY / reducedScreenPercentage);
						}
						if (originalX <= 0) {
							_mouse.y = video.y;
						} else if (originalX / reducedScreenPercentage > video.height) {
							_mouse.y = video.y - video.height;
						} else {
							_mouse.y = video.y - (originalX / reducedScreenPercentage);
						}
						break;
					// right
					case 90:
						if (video.height == screenHeight) {
							reducedScreenPercentage = originalVideoHeight / video.width;
						} else {
							reducedScreenPercentage = originalVideoWidth / video.height;
						}
						if (originalY <= 0) {
							_mouse.x = video.x;
						} else if (originalY / reducedScreenPercentage > video.width) {
							_mouse.x = video.x - video.width;
						} else {
							_mouse.x = video.x - (originalY / reducedScreenPercentage);
						}
						if (originalX <= 0) {
							_mouse.y = video.y;
						} else if (originalX / reducedScreenPercentage > video.height) {
							_mouse.y = video.y + video.height;
						} else {
							_mouse.y = video.y + (originalX / reducedScreenPercentage);
						}
						break;
					// upside down
					case 180:
						if (video.height == screenHeight) {
							reducedScreenPercentage = originalVideoHeight / video.height;
						} else {
							reducedScreenPercentage = originalVideoWidth / video.width;
						}
						if (originalY <= 0) {
							_mouse.y = video.y;
						} else if (originalY / reducedScreenPercentage > video.height) {
							_mouse.y = video.y - video.height;
						} else {
							_mouse.y = video.y - originalY / reducedScreenPercentage;
						}
						if (originalX <= 0) {
							_mouse.x = video.x;
						} else if (originalX / reducedScreenPercentage > video.width) {
							_mouse.x = video.x - video.width;
						} else {
							_mouse.x = video.x - originalX / reducedScreenPercentage;
						}
						break;
					default:
						break;
				}
				_mouse.rotation = video.rotation;
			}
		}
		
		public override function rotateVideo(rotation:Number):void {
			if (_mouse && stage.contains(_mouse)) {
				stage.removeChild(_mouse);
			}
			super.rotateVideo(rotation);
			if (_mouse) {
				stage.addChild(_mouse);
			}
		}
		
		public override function close():void {
			super.close();
			if (_mouse && this.stage.contains(_mouse)) {
				stage.removeChild(_mouse);
				_mouse = null;
			}
		}
	}
}
