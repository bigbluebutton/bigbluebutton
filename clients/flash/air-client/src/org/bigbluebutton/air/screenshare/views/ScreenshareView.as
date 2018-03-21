package org.bigbluebutton.air.screenshare.views
{
	import flash.media.Video;
	import flash.net.NetStream;
	
	import mx.core.UIComponent;
	
	public class ScreenshareView extends UIComponent
	{
		private var _video:Video;
		
		public function ScreenshareView(ns:NetStream)
		{
			super();
			_video = new Video();
			_video.smoothing = true;
			_video.attachNetStream(ns);
			_video.attachNetStream(ns);
			addChild(_video);
		}
	}
}