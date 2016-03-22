package org.bigbluebutton.lib.main.commands {
	
	import org.osflash.signals.Signal;
	
	public class ChangeRoleSignal extends Signal {
		public function ChangeRoleSignal() {
			/**
			 * @1 userID, role
			 */
			super(Object);
		}
	}
}
