package org.bigbluebutton.main.managers
{
	import flash.display.Sprite;
	
	import mx.controls.Alert;
	import mx.events.RSLEvent;
	import mx.preloaders.DownloadProgressBar;
	
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class BigBlueButtonPreloader extends DownloadProgressBar
	{
		public function BigBlueButtonPreloader()
		{
			super();
			downloadingLabel = "Downloading BigBlueButton main...";
			initializingLabel = "BigBlueButton starting...";
			MINIMUM_DISPLAY_TIME = 0;
		}
		
		override public function set preloader(value:Sprite):void{
			super.preloader = value;
			value.addEventListener(RSLEvent.RSL_ERROR, sharedLibraryLoadingFailed);
		}
		
		private function sharedLibraryLoadingFailed(e:RSLEvent):void{
			ResourceUtil.getInstance().changeLocale([ResourceUtil.DEFAULT_LANGUAGE]);
		}

	}
}