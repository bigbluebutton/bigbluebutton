package org.bigbluebutton.lib.video.commands {
	
	import org.osflash.signals.Signal;
	
	public class CameraQualitySignal extends Signal {
		/**
		 * @1 camera quailty: 0 - low, 1 - medium, 2 = high
		 */
		public function CameraQualitySignal() {
			super(int);
		}
	}
}
