package org.bigbluebutton.air.video.commands {
	
	import org.osflash.signals.Signal;
	
	public class ShareCameraSignal extends Signal {
		public function ShareCameraSignal() {
			/**
			 * @1 camera enabled
			 * @2 camera position
			 */
			super(Boolean);
		}
	}
}
