package org.bigbluebutton.web.toolbar.webcambutton.commands {
	import org.osflash.signals.Signal;
	
	public class CamSettingsClosedSignal extends Signal {
		public function CamSettingsClosedSignal() {
			/**
			 *  @1 clicked string
			 */
			super(String);
		}
	}
}
