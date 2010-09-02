package org.bigbluebutton.main.models
{
	import flash.display.Sprite;
	
	import mx.events.RSLEvent;
	import mx.preloaders.DownloadProgressBar;
	
	//import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class BigBlueButtonPreloader extends DownloadProgressBar
	{
		public function BigBlueButtonPreloader()
		{
			super();
			downloadingLabel = "Downloading BigBlueButton Playback...";
			initializingLabel = "Playback starting...";
			MINIMUM_DISPLAY_TIME = 0;
		}
		
		override public function set preloader(value:Sprite):void{
			super.preloader = value;
		}
		
	}
}