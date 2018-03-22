package org.bigbluebutton.air.poll.commands {
	import org.osflash.signals.Signal;
	
	public class RespondToPollSignal extends Signal {
		public function RespondToPollSignal() {
			/**
			 * @1 answer
			 */
			super(String);
		}
	}
}
