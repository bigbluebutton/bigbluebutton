package org.bigbluebutton.web.toolbar.webcambutton.commands {
	import org.osflash.signals.Signal;
	
	public class ShareCameraSignal extends Signal {
		public function ShareCameraSignal() {
			/**
			 *  @1 camera enabled
			 *  @2 camera number
			 */
			super(Boolean, String);
		}
	}
}
