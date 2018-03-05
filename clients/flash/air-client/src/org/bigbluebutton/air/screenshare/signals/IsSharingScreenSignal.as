package org.bigbluebutton.air.screenshare.signals
{

	import org.osflash.signals.Signal;
	
	public class IsSharingScreenSignal extends Signal
	{
		public function IsSharingScreenSignal()
		{
			super(String, int, int, String, String);
		}
	}
}