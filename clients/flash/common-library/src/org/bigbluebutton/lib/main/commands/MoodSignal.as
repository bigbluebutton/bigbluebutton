package org.bigbluebutton.lib.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class MoodSignal extends Signal {
		public function MoodSignal() {
			/**
			 * @1 mood
			 */
			super(String);
		}
	}
}
