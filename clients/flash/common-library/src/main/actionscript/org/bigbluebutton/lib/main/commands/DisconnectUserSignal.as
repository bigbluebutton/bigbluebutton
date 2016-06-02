package org.bigbluebutton.lib.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class DisconnectUserSignal extends Signal {
		/**
		 * @1 disconnectionStatusCode
		 */
		public function DisconnectUserSignal() {
			super(int);
		}
	}
}
