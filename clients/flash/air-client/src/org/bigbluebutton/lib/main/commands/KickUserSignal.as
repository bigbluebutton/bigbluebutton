package org.bigbluebutton.lib.main.commands {
	import org.bigbluebutton.lib.user.models.User2x;
	import org.osflash.signals.Signal;
	
	public class KickUserSignal extends Signal {
		public function KickUserSignal() {
			/**
			 * @1 user
			 */
			super(User2x);
		}
	}
}
