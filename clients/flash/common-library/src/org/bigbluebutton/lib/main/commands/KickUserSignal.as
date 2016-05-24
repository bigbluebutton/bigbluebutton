package org.bigbluebutton.lib.main.commands {
	import org.bigbluebutton.lib.user.models.User;
	import org.osflash.signals.Signal;
	
	public class KickUserSignal extends Signal {
		public function KickUserSignal() {
			/**
			 * @1 user
			 */
			super(User);
		}
	}
}
