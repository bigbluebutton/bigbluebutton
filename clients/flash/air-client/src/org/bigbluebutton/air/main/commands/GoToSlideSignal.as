package org.bigbluebutton.air.main.commands {
	import org.osflash.signals.Signal;
	
	public class GoToSlideSignal extends Signal {
		public function GoToSlideSignal() {
			/**
			 * @1 pageId
			 */
			super(String);
		}
	}
}
