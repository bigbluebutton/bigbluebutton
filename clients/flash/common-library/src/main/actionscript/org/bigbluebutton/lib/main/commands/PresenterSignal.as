package org.bigbluebutton.lib.main.commands {
	
	import org.bigbluebutton.lib.user.models.User;
	import org.osflash.signals.Signal;
	
	public class PresenterSignal extends Signal {
		public function PresenterSignal() {
			/**
			 * @1 user, userMe.userID
			 */
			super(User, String);
		}
	}
}
