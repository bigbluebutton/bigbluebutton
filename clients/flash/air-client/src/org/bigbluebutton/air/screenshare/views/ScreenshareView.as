package org.bigbluebutton.air.screenshare.views
{
	import flash.media.Video;
	import flash.net.NetStream;
	
	import mx.core.UIComponent;
	
	public class ScreenshareView extends UIComponent
	{
		private var _video:Video;
		
		public function ScreenshareView()
		{
			super();

		}
		
		public function display(ns:NetStream, width:int, height:int):void {
			_video = new Video(width, height);
			_video.width = width;
			_video.height = height;
			_video.x = 0;
			_video.y = 0;
			trace("**** Container w=" + this.width + ",h=" + this.height + " Video w=" + _video.width + ",h=" + _video.height);
			_video.smoothing = true;
			_video.attachNetStream(ns);
			addChild(_video);
		}
	}
}