package org.bigbluebutton.lib.main.commands {
	import org.osflash.signals.Signal;
	
	public class GoToSlideSignal extends Signal {
		public function GoToSlideSignal() {
			/**
			 * @1 mute
			 */
			super(String);
		}
	}
}
