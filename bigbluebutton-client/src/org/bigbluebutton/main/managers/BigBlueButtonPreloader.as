package org.bigbluebutton.main.managers
{
	import mx.events.RSLEvent;
	import mx.preloaders.DownloadProgressBar;
	
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class BigBlueButtonPreloader extends DownloadProgressBar
	{
		public function BigBlueButtonPreloader()
		{
			super();
			downloadingLabel = "Downloading BigBlueButton main...";
			initializingLabel = "Initializing BigBlueButton...";
			addEventListener(RSLEvent.RSL_ERROR, sharedLibraryLoadingFailed);
		}
		
		private function sharedLibraryLoadingFailed(e:RSLEvent):void{
			ResourceUtil.getInstance().changeLocale([ResourceUtil.DEFAULT_LANGUAGE]);
		}

	}
}