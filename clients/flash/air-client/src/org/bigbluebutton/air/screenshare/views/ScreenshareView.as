package org.bigbluebutton.air.screenshare.views
{

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
		
		public function display(ns:NetStream, vidWidth:int, vidHeight:int):void {
			_video = new Video(width, height);
			_video.x = 0;
			_video.y = 0;
			_video.width = _videoWidth = vidWidth;
			_video.height = _videoHeight = vidHeight;
			_video.smoothing = true;
			trace("**** ssView s=" + this.width + ",h=" + this.height + " vid w=" + vidWidth + ",h=" + vidHeight);
			_video.attachNetStream(ns);
			addChild(_video);
		}
	}
}