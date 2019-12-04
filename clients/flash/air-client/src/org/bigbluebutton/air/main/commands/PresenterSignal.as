package org.bigbluebutton.air.main.commands {
	
	import org.bigbluebutton.air.user.models.User2x;
	import org.osflash.signals.Signal;
	
	public class PresenterSignal extends Signal {
		public function PresenterSignal() {
			/**
			 * @1 user
			 */
			super(User2x);
		}
	}
}
