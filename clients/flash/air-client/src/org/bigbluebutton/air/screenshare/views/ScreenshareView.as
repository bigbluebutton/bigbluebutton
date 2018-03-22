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
		
		public function display(ns:NetStream, width:int, height:int):void {
			_video = new Video(width, height);
			_video.width = _videoWidth = width;
			_video.height = _videoHeight = height;
			_video.smoothing = true;
			_video.attachNetStream(ns);
			addChild(_video);
		}
	}
}