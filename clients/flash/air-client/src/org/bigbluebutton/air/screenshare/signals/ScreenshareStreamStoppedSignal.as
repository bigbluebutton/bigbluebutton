package org.bigbluebutton.air.screenshare.signals
{
	import org.osflash.signals.Signal;

	public class ScreenshareStreamStoppedSignal extends Signal
	{
		public function ScreenshareStreamStoppedSignal()
		{
			super(String, String);
		}
	}
}