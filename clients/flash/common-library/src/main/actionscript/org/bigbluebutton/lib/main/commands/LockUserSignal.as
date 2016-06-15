package org.bigbluebutton.lib.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class LockUserSignal extends Signal {
		public function LockUserSignal() {
			/**
			 * @1 userID, role
			 */
			super(String, Boolean);
		}
	}
}
