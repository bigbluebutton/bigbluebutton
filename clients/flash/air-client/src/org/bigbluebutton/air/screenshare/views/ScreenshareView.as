package org.bigbluebutton.air.screenshare.views
{
	import flash.geom.Rectangle;
	import flash.media.Video;
	import flash.net.NetStream;
	
	import mx.core.UIComponent;
	
	public class ScreenshareView extends UIComponent
	{
		private var _video:Video;
		private var _videoWidth:int;
		private var _videoHeight:int;
		
		
		public function ScreenshareView()
		{
			super();

		}
		
		public function display(ns:NetStream, width:int, height:int):void {
			_video = new Video(width, height);
			_video.width = _videoWidth = width;
			_video.height = _videoHeight = height;
			trace("**** Container w=" + this.width + ",h=" + this.height + " Video w=" + _video.width + ",h=" + _video.height);
			_video.smoothing = true;
			_video.attachNetStream(ns);
			addChild(_video);
		}
		
		public function calcSizeAndPosition(cw:int, ch:int, vw:int, vh:int):Rectangle {
			return null;
		}
		
		private function vidIsSmallerThanContainer(cw:int, ch:int, vw:int, vh:int):Boolean {
			return (vh < ch) && (vw < cw);
		}
		
		private function fitVideoToContainer(cw:int, ch:int, vw:int, vh:int):Rectangle {
			return null;
		}
		
		/**
		 * Resizes the desktop sharing video to fit to this window
		 */
		public function fitToWindow():void {			
			if (videoIsSmallerThanWindow()) {
				fitWindowToVideo();
			} else {
				fitVideoToWindow();
			}
		}
		
		private function fitVideoToWindow():void {
			_video.width = this.width;
			_video.scaleY = _video.scaleX;
			if(_video.height > this.height){
				_video.height = this.height;
				_video.scaleX = _video.scaleY;
			}
			this.width = _video.width;
			this.height = _video.height;
			
		}
		
		private function fitWindowToVideo():void {
			this.width = _video.width = _videoWidth;
			this.height = _video.height = _videoHeight;
		}
		
		private function videoIsSmallerThanWindow():Boolean {
			return (_videoHeight < this.height) && (_videoWidth < this.width);
		}
		
		/**
		 * resizes the desktop sharing video to actual video resolution
		 */
		private function fitToActualSize():void{
			if (videoIsSmallerThanWindow()) {
				fitWindowToVideo();
			} else {
				this.width = _video.width = _videoWidth;
				this.height = _video.height = _videoHeight;
			}
		}
	}
}